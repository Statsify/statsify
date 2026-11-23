# @statsify/hypixel-data

Data taken from Hypixel's menus, and the adapters that turn what Hypixel stores into items for
`@statsify/textures` to draw.

## Adapters

- `fromHypixelNBT(data)`: Hypixel's gzipped NBT, like the Pit's `inv_contents`, as items. A 1.8
  banner's `BlockEntityTag` gives its base color and patterns, with 1.8's pattern codes (`bo`,
  `cr`) turned into 26.3's ids.
  `playerInventoryOrder` puts a player inventory's hotbar last, as the game shows it.
- `fromBedwarsQuickBuy(favorites)`: the 9 × 6 BedWars shop open on Quick Buy, with each
  item's count, cost and description from `src/bedwars-shop.ts`. Without one, the default quick buy.
- `fromBedwarsHotbar(favoriteSlots)`: a BedWars hotbar from `favorite_slots`, as the Hotbar
  Manager shows it. Without one, the default hotbar.
- `fromDuelsKit(layout, key)`: a Duels `layout_*` kit. The key (`layout_uhc_duel_layout`,
  `layout_mw_duel_herobrine`, `layout_sw_duel_kit_mini_solo_scout`) picks the mode's kit, and
  Blitz and SkyWars kits get the armor their picker lists. A token no dumped kit has is drawn from
  the Bukkit material it ends in (`hype_train_minecart_7`). Without a layout, it's the default of a
  mode in `DUELS_DEFAULT_KEYS` or a kit in `DUELS_KITS`.
- `fromTntGamesLayout(layout, key)`: a TNT Games layout by its `TNTGames` key (`tntrun`,
  `pvprun`, `spleef`, `wizards`, `tnttag`, all in `TNT_GAMES_LAYOUTS`). Without one, the default.
- `fromLegacyKit(layout)`: 1.8 `"id,damage"` values by slot, as Mega Walls' `<class>Inventory`,
  Blitz's `<Kit>Inventory` and classic Walls' `InventoryLayout` send them. Walls' `InventoryLayout2`
  adds each item's name (`"273,0,§bSpeedy Spade"`, or `NONAME`), and holds a slot for every item a
  player has placed, not one kit.
- `fromBlitzKit(layout, kit, level, renames)` and `fromMegaWallsKit(layout, kit, level)`: Blitz's
  `<Kit>Inventory` by kit level (1 to 10) and Mega Walls' `<class>Inventory` by Kit upgrade (1 to 5).
  Items get the game's counts, names and tooltips (and Mega Walls' armor) only at the level each
  editor was dumped at. `renames` holds the player's `kit_item_rename_<Kit>_<material>` names by
  material. Without a layout, it's the default at that level, as `BLITZ_KITS` and `MEGA_WALLS_KITS` list.
- `fromSkyWarsKit(layout, kit)`: a SkyWars `kit_…_inventory`, which names items by Bukkit material,
  Damage and enchantment ids (`DIAMOND_AXE:0:16`). `kit` is the kit's id (`kit_basic_solo_scout`, as
  `activeKit_SOLO` holds it) or a `SKYWARS_KITS` key. Items its lobby menu lists get the game's
  counts, names and tooltips, but Mythical kits, in both Normal's and Insane's menus, stay plain.
  Without a layout, it's the default of a kit in `SKYWARS_KITS`.
- `fromQuakeLoadout(stats)`: the Quake gun's `case`, `barrel`, `trigger`, `muzzle` and `sight` (its
  laser), then `hat`, `armor` (the chestplate), `leggings` and `boots`.
- `fromArenaLoadout(stats)`: the Arena `offensive`, `utility`, `support` and `ultimate` skills, then
  `active_rune`.
- `fromTurboKartRacersKart(stats)`: the GingerBread `engine_active`, `booster_active` and
  `frame_active` parts, matched by rarity and attribute levels (Basic parts by rarity alone).
- `fromSpeedUhcKit(id)`: an `activeKit_<MODE>` kit, like `kit_basic_normal_logger`. Only Normal's
  Kits page and the Default kit are dumped.

The last four give a row of the shop's items. Kits come back as 40 slots: the hotbar, the three main
rows, then boots to helmet in 36 to 39. `ARMOR_SLOTS` lists the armor slots helmet first, as the
inventory screen shows them.

Tables meant to be complete throw on what they lack: the BedWars shop and hotbar categories, TNT
Games' and Arena's items, and 1.8's ids, Bukkit materials and potion effects. The dumps are partial
for the rest: a Quake or Turbo Kart Racers part they lack leaves its slot empty, and a default kit,
level or Speed UHC kit they lack comes back undefined. 1.8's untyped spawn egg (Damage 0, like
SkyWars' Mystery Egg) has no 26.3 item, so it's left out.

## Armor

For a skin render, `armorOf(items)` turns items (Pit's `inv_armor`, slots 36 to 39) into
`{ helmet, chestplate, leggings, boots }`, each `{ material, color, enchanted }`, a player head's
`{ head, enchanted }` texture hash or a mob skull's `{ skull }`; other things on the head are left
out. `duelsKitArmor(mode, kit)`, `skyWarsKitArmor(kit)`, `blitzKitArmor(kit, level)` and
`megaWallsKitArmor(kit, level)` give a kit's armor by the names the adapters' keys hold; Blitz's
covers every level. Leather is dyed by the color its picker names (White Leather Chestplate), else by the
picker icon, else (Blitz) by the color its editor shows. Mega Walls Duel's picker lists no armor, so
its classes come back undefined.

## Data

Every `data/*.json` comes from the game: open the layout editors, kit menus and shop menus with the
StatsifyDump module running, then `pnpm build` and `node scripts/import-dump.ts <dump.json> …` with
the last export of each dump session. Open each kit's editor from its picker before moving anything:
the picker shown next names the kit, and only an unsaved kit shows the default. Blitz's and Mega
Walls' editors open from each kit's Upgrades or Class page, which gives the level. An item's
`tooltip` holds the lines under its name as the game drew them.
