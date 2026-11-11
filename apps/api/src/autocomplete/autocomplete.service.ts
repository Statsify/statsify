/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AutocompleteType } from "@statsify/api-client";
import { Guild, Player, User } from "@statsify/schemas";
import { GuildService } from "#guild";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { InjectRedis } from "#redis";
import { Injectable } from "@nestjs/common";
import { PlayerSearchService } from "#player";
import { Redis } from "ioredis";
import type { ReturnModelType } from "@typegoose/typegoose";

const HISTORY_MS = 14 * 86_400_000;
const HALF_LIFE_MS = 3 * 86_400_000;
const LOOKUPS_PER_ENTRY = 10;
const MAX_CHOICES = 25;

interface HistoryEntry {
  name: string;
  lookups: number[];
}

const frecency = (lookups: number[], now: number) =>
  lookups.reduce((score, time) => score + 0.5 ** ((now - time) / HALF_LIFE_MS), 0);

const blend = (query: string, personal: string[][], global: string[]) => {
  const prefix = query.toLowerCase();
  const seen = new Set<string>();
  const names: string[] = [];

  const push = (name: string) => {
    const lower = name.toLowerCase();
    if (seen.has(lower)) return;
    seen.add(lower);
    names.push(name);
  };

  for (const tier of personal)
    for (const name of tier) if (name.toLowerCase().startsWith(prefix)) push(name);

  for (const name of global) push(name);

  const exact = names.findIndex((name) => name.toLowerCase() === prefix);
  if (exact > 0) names.unshift(...names.splice(exact, 1));

  return names.slice(0, MAX_CHOICES);
};

@Injectable()
export class AutocompleteService {
  public constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly playerSearchService: PlayerSearchService,
    private readonly guildService: GuildService,
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
    @InjectModel(Player) private readonly playerModel: ReturnModelType<typeof Player>,
    @InjectModel(Guild) private readonly guildModel: ReturnModelType<typeof Guild>
  ) {}

  public suggest(type: AutocompleteType, id: string, query: string): Promise<string[]> {
    return type === AutocompleteType.GUILD ?
      this.suggestGuilds(id, query) :
      this.suggestPlayers(id, query);
  }

  public async record(type: AutocompleteType, id: string, name: string) {
    const lower = name.toLowerCase();

    const stored =
      type === AutocompleteType.PLAYER ?
        (await this.playerModel.findOne({ usernameToLower: lower }).select({ username: true }).lean().exec())?.username :
        (await this.guildModel.findOne({ nameToLower: lower }).select({ name: true }).lean().exec())?.name;

    if (!stored) return;

    const now = Date.now();
    const entries = await this.readHistory(type, id, now);
    const entry = entries.find((e) => e.name === stored);

    if (entry) entry.lookups = [now, ...entry.lookups].slice(0, LOOKUPS_PER_ENTRY);
    else entries.push({ name: stored, lookups: [now] });

    const kept = entries
      .sort((a, b) => frecency(b.lookups, now) - frecency(a.lookups, now))
      .slice(0, MAX_CHOICES);

    await this.redis.set(this.historyKey(type, id), JSON.stringify(kept), "PX", HISTORY_MS);
  }

  public async clear(id: string) {
    await this.redis.del(
      this.historyKey(AutocompleteType.PLAYER, id),
      this.historyKey(AutocompleteType.GUILD, id)
    );
  }

  private async suggestPlayers(id: string, query: string) {
    const [history, guild, global] = await Promise.all([
      this.getHistory(AutocompleteType.PLAYER, id),
      this.getLinkedGuild(id),
      query ? this.playerSearchService.get(query) : [],
    ]);

    // Guild members whose name couldn't be found are stored as `ERROR <uuid>`.
    const guildmates = (guild?.members ?? [])
      .map((member) => member.username)
      .filter((username): username is string => !!username && !username.startsWith("ERROR "))
      .sort((a, b) => a.localeCompare(b));

    return blend(query, [history, guildmates], global);
  }

  private async suggestGuilds(id: string, query: string) {
    const [history, guild, stored] = await Promise.all([
      this.getHistory(AutocompleteType.GUILD, id),
      this.getLinkedGuild(id),
      this.guildService.search(query),
    ]);

    return blend(query, [guild ? [guild.name] : [], history], stored.map((g) => g.name));
  }

  private async getHistory(type: AutocompleteType, id: string) {
    const now = Date.now();
    const entries = await this.readHistory(type, id, now);

    return entries
      .sort((a, b) => frecency(b.lookups, now) - frecency(a.lookups, now))
      .map((entry) => entry.name);
  }

  private async readHistory(type: AutocompleteType, id: string, now: number): Promise<HistoryEntry[]> {
    const raw = await this.redis.get(this.historyKey(type, id));
    if (!raw) return [];

    return (JSON.parse(raw) as HistoryEntry[])
      .map((entry) => ({ ...entry, lookups: entry.lookups.filter((time) => now - time < HISTORY_MS) }))
      .filter((entry) => entry.lookups.length > 0);
  }

  private async getLinkedGuild(id: string) {
    const user = await this.userModel.findOne({ id }).select({ uuid: true }).lean().exec();
    if (!user?.uuid) return null;

    const player = await this.playerModel
      .findOne({ uuid: user.uuid })
      .select({ guildId: true })
      .lean()
      .exec();

    if (!player?.guildId) return null;

    return this.guildModel
      .findOne({ id: player.guildId })
      .select({ name: true, "members.username": true })
      .lean()
      .exec();
  }

  private historyKey(type: AutocompleteType, id: string) {
    return `autocomplete:history:${type}:${id}`;
  }
}
