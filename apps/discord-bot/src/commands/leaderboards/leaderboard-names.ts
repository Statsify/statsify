/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Fuse from "fuse.js";
import { type LocalizeFunction, getLocalizeFunction } from "@statsify/discord";
import { flatten, removeFormatting } from "@statsify/util";
import type { APIApplicationCommandOptionChoice } from "discord-api-types/v10";
import type { LeaderboardMetadata, MetadataEntry } from "@statsify/schemas";

let statKeysByEnglishName: Map<string, string> | undefined;

export function translateStat(t: LocalizeFunction, name: string) {
  statKeysByEnglishName ??= new Map(
    Object.entries(
      flatten(
        getLocalizeFunction("en-US")("stats", {
          returnObjects: true,
        }) as unknown as object,
        "stats",
      ),
    ).map(([key, text]) => [text, key]),
  );

  const key = statKeysByEnglishName.get(name);
  return key ? t(key) : name;
}

export function translateLeaderboardName(
  t: LocalizeFunction,
  { name, fieldName = "" }: Pick<LeaderboardMetadata, "name" | "fieldName">,
) {
  const translated = translateStat(t, name);
  if (translated !== name || !name.endsWith(fieldName)) return translated;

  return (
    name.slice(0, name.length - fieldName.length) + translateStat(t, fieldName)
  );
}

type Choice = APIApplicationCommandOptionChoice<string>;

interface SearchName {
  name: string;
  choice: Choice;
}

export class LeaderboardChoices {
  private searches = new Map<string, [Fuse<SearchName>, Choice[]]>();

  public constructor(private readonly fields: MetadataEntry[]) {}

  public search(t: LocalizeFunction, query: string): Choice[] {
    const [fuse, list] = this.getSearch(t);

    if (!query) return list.slice(0, 25);

    const choices = new Set(
      fuse.search(query).map((result) => result.item.choice),
    );
    return [...choices].slice(0, 25);
  }

  private getSearch(t: LocalizeFunction) {
    let search = this.searches.get(t.locale);
    if (search) return search;

    const list = this.fields.map(([value, { leaderboard }]) => ({
      value,
      name: removeFormatting(translateLeaderboardName(t, leaderboard)),
    }));

    // One entry per language, since Fuse ranks a match on two keys above a match on one
    const names = list.flatMap((choice, index) => [
      { name: choice.name, choice },
      {
        name: removeFormatting(this.fields[index][1].leaderboard.name),
        choice,
      },
    ]);

    search = [
      new Fuse(names, {
        keys: ["name"],
        includeScore: false,
        shouldSort: true,
        isCaseSensitive: false,
        threshold: 0.3,
        ignoreLocation: true,
      }),
      list,
    ];

    this.searches.set(t.locale, search);
    return search;
  }
}
