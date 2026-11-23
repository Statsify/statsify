/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HttpService } from "@nestjs/axios";
import type { Image } from "skia-canvas";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { InjectRedis } from "#redis";
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { PlayerNotFoundException } from "@statsify/api-client";
import { Redis } from "ioredis";
import { Skin } from "@statsify/schemas";
import { catchError, lastValueFrom, map } from "rxjs";
import { createCanvas, loadImage } from "@statsify/rendering";
import { getAssetPath, getMinecraftTexturePath } from "@statsify/assets";
import { getHelmetModel, getKartModel, parseSuitPiece } from "./kart-cosmetics.js";
import {
  type WarlordsMount,
  getWarlordsArmor,
  getWarlordsHelmetModel,
  getWarlordsMount,
  getWarlordsWeaponModel,
} from "./warlords-cosmetics.js";
import { join } from "node:path";
import { type SmashHero, getSmashHero } from "./smash-cosmetics.js";
import {
  type Armor,
  type ArmorPiece,
  type ModelInstance,
  ModelLibrary,
  type SceneMount,
  renderScene,
  renderSkin,
} from "@statsify/skin-renderer";
import {
  type ArmorDto,
  type ArmorPieceDto,
  KART_CAMERA,
  type KartRenderDto,
  SMASH_CAMERA,
  type SKULLS,
  type SkinRenderDto,
  type SmashRenderDto,
  WARLORDS_CAMERA,
  type WarlordsRenderDto,
} from "#dtos";
import type { ReturnModelType } from "@typegoose/typegoose";
import { access, readFile, readdir } from "node:fs/promises";

@Injectable()
export class SkinService {
  private readonly libraries = new Map<ResourcePack, Promise<ModelLibrary>>();

  public constructor(
    private readonly httpService: HttpService,
    @InjectModel(Skin) private readonly skinModel: ReturnModelType<typeof Skin>,
    @InjectRedis() private readonly redis: Redis
  ) {}

  public async getHead(uuid: string, size: number): Promise<Buffer> {
    const { skin } = await this.getSkin(uuid)
      .then((skin) => this.resolveSkin(skin?.skinUrl, skin?.slim ?? false))
      .catch(() => this.resolveSkin(undefined, false));

    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, size, size);

    ctx.drawImage(skin, 8, 8, 8, 8, 0, 0, size, size);
    ctx.drawImage(skin, 40, 8, 8, 8, 0, 0, size, size);

    return canvas.toBuffer("png");
  }

  public async getRender(
    uuid: string,
    extruded: boolean,
    { yaw, pose, cape, armor = {} }: Omit<SkinRenderDto, "uuid">
  ): Promise<Buffer> {
    const [skin, resolvedArmor] = await Promise.all([this.getSkin(uuid), this.resolveArmor(armor)]);

    const [{ skin: image }, capeImage] = await Promise.all([
      this.resolveSkin(skin.skinUrl, skin.slim),
      cape && skin.capeUrl ? loadTexture(skin.capeUrl) : undefined,
    ]);

    const enchanted = Object.values(resolvedArmor).some((piece) => piece?.enchanted);

    return renderSkin(imageData(image), skin.slim ?? false, extruded, {
      yaw,
      pose,
      armor: resolvedArmor,
      glint: enchanted ? await readFile(getMinecraftTexturePath("textures/misc/enchanted_item_glint.png")) : undefined,
      cape: capeImage && imageData(capeImage),
    });
  }

  public async getKartRender({ uuid, ...options }: KartRenderDto): Promise<Buffer> {
    const kart = resolveKart(options, uuid !== undefined);

    const [library, player] = await Promise.all([
      this.getLibrary(KART_PACK),
      uuid ? this.getScenePlayer(uuid) : undefined,
    ]);

    return renderKart(library, kart, { ...options, player });
  }

  public async getWarlordsRender({ uuid, ...options }: WarlordsRenderDto): Promise<Buffer> {
    const warlords = resolveWarlords(options, uuid !== undefined);

    const [library, player] = await Promise.all([
      this.getLibrary(WARLORDS_PACK),
      uuid ? this.getScenePlayer(uuid) : undefined,
    ]);

    return renderWarlords(library, warlords, { ...options, player });
  }

  public async getSmashRender({ hero, master, ...options }: SmashRenderDto): Promise<Buffer> {
    const smash = resolveSmash(hero, master);
    const library = await this.getLibrary(SMASH_PACK);
    return renderSmash(library, smash, options);
  }

  public async getSkin(tag: string): Promise<Skin> {
    tag = tag.replaceAll("-", "").toLowerCase();
    const isUsername = tag.length <= 16;

    const cachedSkin = await this.skinModel
      .findOne()
      .where(isUsername ? "usernameToLower" : "uuid")
      .equals(tag)
      .lean()
      .exec();

    if (cachedSkin && Date.now() < cachedSkin.expiresAt) {
      return cachedSkin;
    }

    const uuid = isUsername ? await this.getUuid(tag) : tag;

    const skin = await this.requestSkin(uuid).catch((error) => {
      if (cachedSkin) return cachedSkin;
      throw error;
    });

    // Cache for 3 hours
    skin.expiresAt = Date.now() + (1000 * 60 * 60 * 3);

    await this.skinModel.replaceOne({ uuid }, skin, { upsert: true }).lean().exec();

    return skin;
  }

  private async resolveSkin(
    skinUrl?: string,
    slim?: boolean
  ): Promise<{ skin: Image; slim: boolean }> {
    if (!skinUrl) {
      return this.resolveSkin(
        getMinecraftTexturePath("textures/entity/steve.png"),
        false
      );
    }

    const skin = await loadImage(skinUrl);

    return {
      skin,
      slim: slim ?? false,
    };
  }

  private async resolveArmor(armor: ArmorDto): Promise<Armor> {
    const [helmet, chestplate, leggings, boots] = await Promise.all([
      this.resolveHelmet(armor.helmet),
      armor.chestplate && resolveArmorPiece(armor.chestplate, 1),
      armor.leggings && resolveArmorPiece(armor.leggings, 2),
      armor.boots && resolveArmorPiece(armor.boots, 1),
    ]);

    return { helmet, chestplate, leggings, boots };
  }

  private async resolveHelmet(helmet: ArmorDto["helmet"]): Promise<ArmorPiece | undefined> {
    if (!helmet) return;
    if ("head" in helmet) return this.resolveHead(helmet.head);

    // 1.8 draws no glint on a worn skull or player head
    if ("skull" in helmet) {
      const texture = await readFile(getMinecraftTexturePath(`textures/entity/${SKULL_TEXTURES[helmet.skull]}.png`));
      return { texture, enchanted: false, skull: true };
    }

    return resolveArmorPiece(helmet, 1);
  }

  private async resolveHead(hash: string): Promise<ArmorPiece> {
    const key = `head:${hash}`;
    let head = await this.redis.getBuffer(key);

    if (!head) {
      head = imageData(await loadTexture(`https://textures.minecraft.net/texture/${hash}`));

      // The hash pins the image, so this expiry only bounds how many heads Redis keeps
      await this.redis.set(key, head, "EX", 60 * 60 * 24 * 30);
    }

    return { texture: head, enchanted: false, skull: true };
  }

  private async getScenePlayer(uuid: string): Promise<PlayerSkin> {
    const { skinUrl, slim } = await this.getSkin(uuid);
    const player = await this.resolveSkin(skinUrl, slim);
    return { skin: imageData(player.skin), slim: player.slim };
  }

  // Forgets a failed load, so a pack copied in after startup is picked up without a restart
  private getLibrary(pack: ResourcePack) {
    let library = this.libraries.get(pack);

    if (!library) {
      library = loadPackLibrary(pack).catch((error) => {
        this.libraries.delete(pack);
        throw error;
      });

      this.libraries.set(pack, library);
    }

    return library;
  }

  private getUuid(username: string): Promise<string> {
    return lastValueFrom(
      this.httpService.get(`https://api.mojang.com/users/profiles/minecraft/${username}`).pipe(
        map((response) => response.data as MojangProfile),
        map((data) => data.id),
        catchError((error) => {
          if (error.response.status === 404) throw new PlayerNotFoundException();
          // Ratelimited
          if (error.response.status === 429) throw new InternalServerErrorException();

          // Unknown
          throw new InternalServerErrorException();
        })
      )
    );
  }

  private requestSkin(uuid: string) {
    return lastValueFrom(
      this.httpService.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`).pipe(
        map((response) => {
          if (response.status !== 200) throw response;
          return response.data;
        }),
        map((data) => new Skin(data)),
        catchError((error) => {
          // Player not found
          if (error.status === 204) throw new PlayerNotFoundException();
          throw new InternalServerErrorException();
        })
      )
    );
  }
}

// This field is set by loadImage from `@statsify/rendering`
const imageData = (image: Image) => {
  const { _data: data } = image as unknown as { _data: Buffer };
  return data;
};

const loadTexture = (url: string) =>
  loadImage(url).catch((error) => {
    if (error.response?.status === 404) throw new NotFoundException("texture");
    throw error;
  });

const SKULL_TEXTURES: Record<(typeof SKULLS)[number], string> = {
  skeleton: "skeleton/skeleton",
  wither_skeleton: "skeleton/wither_skeleton",
  zombie: "zombie/zombie",
  creeper: "creeper/creeper",
};

const UNDYED_LEATHER = 0xA0_65_40;

async function resolveArmorPiece(
  { material, color = UNDYED_LEATHER, enchanted = false }: ArmorPieceDto,
  layer: 1 | 2,
  textures = getMinecraftTexturePath("textures")
): Promise<ArmorPiece> {
  const path = join(textures, `models/armor/${material}_layer_${layer}`);
  if (material !== "leather") return { texture: await readFile(`${path}.png`), enchanted };

  // The dye tints the base, then the overlay adds the undyed details
  const [base, overlay] = await Promise.all([loadImage(`${path}.png`), loadImage(`${path}_overlay.png`)]);
  const canvas = createCanvas(base.width, base.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(base, 0, 0);

  const pixels = ctx.getImageData(0, 0, base.width, base.height);
  const dye = [(color >> 16) & 0xFF, (color >> 8) & 0xFF, color & 0xFF];

  for (let i = 0; i < pixels.data.length; i += 4) {
    for (let channel = 0; channel < 3; channel++) {
      pixels.data[i + channel] = Math.floor((pixels.data[i + channel] * dye[channel]) / 255);
    }
  }

  ctx.putImageData(pixels, 0, 0);
  ctx.drawImage(overlay, 0, 0);

  return { texture: await canvas.toBuffer("png"), enchanted };
}

interface ResourcePack {
  name: string;
  /** The pack's assets/minecraft folder */
  path: string;
}

// Hypixel's pack listing only carries SkyBlock's pack, so game packs are copied in by hand
const resourcePack = (name: string, folder: string): ResourcePack => ({
  name,
  path: join(getAssetPath(`resource-packs/${folder}`, "public"), "assets/minecraft"),
});

export const KART_PACK = resourcePack("Turbo Kart Racers", "turbo-kart-racers");
export const WARLORDS_PACK = resourcePack("Warlords", "warlords");
export const SMASH_PACK = resourcePack("Smash Heroes", "smash");
// The 1.8.9 client's own textures for what no game pack draws, such as mounts
export const VANILLA_PACK = resourcePack("Minecraft 1.8.9", "vanilla-1.8.9");

// The kart is worn by an armor stand the rider sits on: the stand's mounted offset (1.975 × 0.75 blocks)
// less the player's riding offset (0.35), in pixels
const KART_MOUNT = -(1.975 * 0.75 - 0.35) * 16;

async function readPackFiles<T>(pack: ResourcePack, folder: string, extension: string, read: (path: string) => Promise<T>) {
  const files = (await readdir(join(pack.path, folder), { recursive: true })).filter((file) => file.endsWith(extension));
  const contents = await Promise.all(files.map((file) => read(join(pack.path, folder, file))));
  return Object.fromEntries(files.map((file, index) => [file.slice(0, -extension.length), contents[index]]));
}

export async function loadPackLibrary(pack: ResourcePack): Promise<ModelLibrary> {
  // Only a missing pack is a 503. Anything else is broken state, and Sentry skips 503s.
  await access(pack.path).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") throw new ServiceUnavailableException(`The ${pack.name} pack isn't installed`);
    throw error;
  });

  const [models, textures, mcmeta] = await Promise.all([
    readPackFiles(pack, "models", ".json", (path) => readFile(path, "utf8")),
    readPackFiles(pack, "textures", ".png", (path) => readFile(path)),
    readPackFiles(pack, "textures", ".png.mcmeta", (path) => readFile(path, "utf8")),
  ]);

  return new ModelLibrary({ models, textures, mcmeta });
}

export interface KartScene {
  models: ModelInstance[];
  suit: Omit<ArmorDto, "helmet">;
}

export function resolveKart(
  { kart, helmet, jacket, pants, shoes }: Pick<KartRenderDto, "kart" | "helmet" | "jacket" | "pants" | "shoes">,
  seated: boolean
): KartScene {
  const models: ModelInstance[] = [
    { model: getKartModel(kart), bone: "root", display: "head", translation: [0, KART_MOUNT, 0] },
  ];

  const helmetModel = getHelmetModel(helmet);
  if (helmetModel) models.push({ model: helmetModel, bone: "head", display: "head" });

  const suit = {
    chestplate: parseSuitPiece(jacket, "JACKET"),
    leggings: parseSuitPiece(pants, "PANTS"),
    boots: parseSuitPiece(shoes, "SHOES"),
  };

  if (!seated && (helmetModel || Object.values(suit).some(Boolean))) {
    throw new BadRequestException("A helmet or suit needs a uuid to wear it");
  }

  return { models, suit };
}

interface PlayerSkin {
  skin: Uint8Array;
  slim: boolean;
}

export interface KartRenderOptions extends Pick<KartRenderDto, "extruded" | "width" | "height" | "yaw" | "pitch"> {
  player?: PlayerSkin;
}

async function resolvePackArmor(pack: ResourcePack, pieces: Omit<ArmorDto, "helmet">): Promise<Armor> {
  const textures = join(pack.path, "textures");
  const [chestplate, leggings, boots] = await Promise.all([
    pieces.chestplate && resolveArmorPiece(pieces.chestplate, 1, textures),
    pieces.leggings && resolveArmorPiece(pieces.leggings, 2, textures),
    pieces.boots && resolveArmorPiece(pieces.boots, 1, textures),
  ]);

  return { chestplate, leggings, boots };
}

export async function renderKart(
  library: ModelLibrary,
  { models, suit }: KartScene,
  {
    player,
    extruded = false,
    width = KART_CAMERA.width,
    height = KART_CAMERA.height,
    yaw = KART_CAMERA.yaw,
    pitch = KART_CAMERA.pitch,
  }: KartRenderOptions
): Promise<Buffer> {
  const output = { width, height, yaw, pitch };

  if (!player) return renderScene(library, { models }, output);

  const armor = await resolvePackArmor(KART_PACK, suit);

  return renderScene(library, { player: { ...player, extruded, armor, pose: "sit" }, models }, output);
}

export interface WarlordsScene {
  models: ModelInstance[];
  armor?: ArmorPieceDto;
  mount?: WarlordsMount;
}

export function resolveWarlords(
  cosmetics: Pick<WarlordsRenderDto, "class" | "helmet" | "armor" | "team" | "weapon" | "mount">,
  withPlayer: boolean
): WarlordsScene {
  const { class: playerClass, helmet = 0, armor = 0, team = "blue", weapon } = cosmetics;
  const weaponModel = weapon === undefined ? undefined : getWarlordsWeaponModel(weapon);
  const mount = cosmetics.mount === undefined ? undefined : getWarlordsMount(cosmetics.mount);

  if (!withPlayer) {
    const worn = [cosmetics.class, cosmetics.helmet, cosmetics.armor, cosmetics.team];
    if (worn.some((value) => value !== undefined)) throw new BadRequestException("A class, helmet, armor or team needs a uuid to wear it");
    if (weaponModel && mount) throw new BadRequestException("A weapon needs a uuid to hold it on a mount");
    if (mount) return { models: [], mount };
    if (!weaponModel) throw new BadRequestException("A render without a uuid needs a weapon or a mount");

    return { models: [{ model: weaponModel, bone: "root" }] };
  }

  if (playerClass === undefined) throw new BadRequestException("A player render needs the player's class");

  const models: ModelInstance[] = [
    { model: getWarlordsHelmetModel(playerClass, helmet, team), bone: "head", display: "head" },
  ];

  if (weaponModel) models.push({ model: weaponModel, bone: "rightHand", display: "thirdperson" });

  return { models, armor: getWarlordsArmor(armor, team), mount };
}

export interface WarlordsRenderOptions extends Pick<WarlordsRenderDto, "extruded" | "width" | "height" | "yaw" | "pitch"> {
  player?: PlayerSkin;
}

async function loadMount({ entity, textures }: WarlordsMount): Promise<SceneMount> {
  const horse = join(VANILLA_PACK.path, "textures/entity/horse");

  const layers = await Promise.all(textures.map((texture) => readFile(join(horse, `${texture}.png`))));

  return { entity, textures: layers };
}

export async function renderWarlords(
  library: ModelLibrary,
  { models, armor, mount }: WarlordsScene,
  { player, extruded = false, ...camera }: WarlordsRenderOptions
): Promise<Buffer> {
  const defaults = mount ? WARLORDS_CAMERA.mount : player ? WARLORDS_CAMERA.player : WARLORDS_CAMERA.weapon;

  const output = {
    width: camera.width ?? defaults.width,
    height: camera.height ?? defaults.height,
    yaw: camera.yaw ?? defaults.yaw,
    pitch: camera.pitch ?? defaults.pitch,
  };

  const scene = { models, mount: mount && await loadMount(mount) };

  if (!player) return renderScene(library, scene, output);

  const worn = await resolvePackArmor(WARLORDS_PACK, { chestplate: armor, leggings: armor, boots: armor });

  return renderScene(library, { ...scene, player: { ...player, extruded, armor: worn } }, output);
}

export interface SmashScene extends Pick<SmashHero, "skinColor" | "chestplate" | "leggings" | "boots"> {
  models: ModelInstance[];
}

export function resolveSmash(hero: string, master = false): SmashScene {
  const { head, held, framesHeld, ...worn } = getSmashHero(hero, master);

  return {
    ...worn,
    models: [
      { model: head, bone: "head", display: "head" },
      { model: held, bone: "rightHand", display: "thirdperson", framed: framesHeld },
    ],
  };
}

function drawHeroSkin(color: number) {
  const canvas = createCanvas(64, 64);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
  ctx.fillRect(0, 0, 64, 64);
  return canvas.toBuffer("png");
}

export async function renderSmash(
  library: ModelLibrary,
  { models, skinColor, ...worn }: SmashScene,
  {
    width = SMASH_CAMERA.width,
    height = SMASH_CAMERA.height,
    yaw = SMASH_CAMERA.yaw,
    pitch = SMASH_CAMERA.pitch,
  }: Pick<SmashRenderDto, "width" | "height" | "yaw" | "pitch">
): Promise<Buffer> {
  const [skin, armor] = await Promise.all([drawHeroSkin(skinColor), resolvePackArmor(SMASH_PACK, worn)]);

  const player = {
    skin,
    // Every lobby stand's skin uses the classic arms
    slim: false,
    extruded: false,
    armor,
    pose: "standing",
  } as const;

  return renderScene(library, { player, models }, { width, height, yaw, pitch });
}

interface MojangProfile {
  id: string;
  name: string;
  legacy?: true;
  demo?: true;
}
