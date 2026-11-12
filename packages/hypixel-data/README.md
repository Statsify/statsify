# @statsify/hypixel-data

Data taken from Hypixel's menus, and the adapters that turn what Hypixel stores into items for
`@statsify/textures` to draw.

## Adapters

- `fromHypixelNBT(data)`: Hypixel's gzipped NBT, like the Pit's `inv_contents`, as items. A 1.8
  banner's `BlockEntityTag` gives its base color and patterns, with 1.8's pattern codes (`bo`,
  `cr`) turned into 26.3's ids.
  `playerInventoryOrder` puts a player inventory's hotbar last, as the game shows it.
- `fromBedwarsQuickBuy(favorites)`: the 9 × 6 BedWars shop open on Quick Buy, with each
  item's count, cost and description. `src/bedwars-shop.ts` holds the shop as
  Hypixel's own NBT has it. Without one, the default quick buy.
- `fromBedwarsHotbar(favoriteSlots)`: a BedWars hotbar from `favorite_slots`, as the Hotbar
  Manager shows it. Without one, the default hotbar.
- `fromDuelsKit(layout, key)`: a Duels `layout_*` kit. The key (`layout_uhc_duel_layout`,
  `layout_mw_duel_herobrine`, `layout_sw_duel_kit_mini_solo_scout`) picks the mode's kit in
  `data/duels-modes.json`, so items get the count, name and tooltip the game gives them, and
  Blitz and SkyWars kits get the armor their picker lists. Armor tokens in older layouts go
  to the armor slots, since the game equips armor. A token no dumped kit has is drawn from the
  Bukkit material it ends in (`hype_train_minecart_7`). Without a layout, it's the game's default
  layout: the single-kit modes in `DUELS_DEFAULT_KEYS` and every kit in `DUELS_KITS`.
- `fromTntGamesLayout(layout, key)`: a TNT Games layout by its `TNTGames` key (`tntrun`,
  `pvprun`, `spleef`, `wizards`, `tnttag`, all in `TNT_GAMES_LAYOUTS`), with the editors' items
  from `data/tnt-games.json`. Without a layout, the game's default one.
- `fromLegacyKit(layout)`: a kit of 1.8 `"id,damage"` values by slot, as Mega Walls'
  `<class>Inventory`, Blitz's `<Kit>Inventory` and classic Walls' `InventoryLayout` send it.
  Walls' newer `InventoryLayout2` adds each item's name (`"273,0,§bSpeedy Spade"`, or `NONAME`),
  which the item gets. It's a slot for every item a player has placed, not one kit: the Layout
  Editor shows the player's current items in those slots, and an item the layout lacks in a free one.
- `fromBlitzKit(layout, kit, level, renames)` and `fromMegaWallsKit(layout, kit, level)`: Blitz's
  `<Kit>Inventory` by the kit's level (1 to 10) and Mega Walls' `<class>Inventory` by the class's
  Kit upgrade (1 to 5), with the "Edit <Kit> Layout" editors' items from `data/legacy-kits.json`.
  A kit's items change with its level, so they get the game's counts, names and tooltips (and Mega
  Walls' armor) only at the level each editor was dumped at, and are plain items at the others.
  `renames` holds the player's `kit_item_rename_<Kit>_<material>` names by material. Without a
  layout, it's the default at that level: `BLITZ_KITS` and `MEGA_WALLS_KITS` list them.
- `fromSkyWarsKit(layout, kit)`: a SkyWars `kit_…_inventory`, which names items by their Bukkit
  material, Damage and enchantment ids (`DIAMOND_AXE:0:16`). `kit` is the kit's id
  (`kit_basic_solo_scout`, as `activeKit_SOLO` holds it) or its key in `SKYWARS_KITS`. Items the
  kit's lobby menu (Normal, Insane, Mini or Mega Kits) lists get the game's counts, names and
  tooltips from `data/skywars-kits.json`, taken from the Kit Customizers and the SkyWars Duel
  editors that hold the same items; a stale item from an older kit version loses its slot to the
  current one. Without a layout, it's the default: the menu's list in order, armor put on and the
  rest from slot 0. `SKYWARS_KITS` lists the kits whose every item is known. Mythical kits are in
  both Normal's and Insane's menus, so they stay plain.
- `fromQuakeLoadout(stats)`: the Quake stats' gun (`case`, `barrel`, `trigger`, `muzzle`, and
  `sight`, its laser), `hat`, `armor` (the Kits menu's chestplate), `leggings` and `boots` as a
  row of 9, with the Quakecraft Shop menus' items from `data/quake.json`.
- `fromArenaLoadout(stats)`: the Arena stats' `offensive`, `utility`, `support` and `ultimate`
  skills and `active_rune` as a row of 5, with the Arena Shop's items from `data/arena.json`.
- `fromTurboKartRacersKart(stats)`: the GingerBread stats' `engine_active`, `booster_active` and
  `frame_active` parts as a row of 3, matched to the part selectors' items in
  `data/turbo-kart-racers.json` by rarity and attribute levels (Basic parts by rarity, since
  they're stored without attributes).
- `fromSpeedUhcKit(id)`: an `activeKit_<MODE>` kit, like `kit_basic_normal_logger`, as a row of
  its items from the Speed UHC Shop's Kits page, and the Default kit from a game's Gear Selector
  (`data/speed-uhc.json`). Only Normal's page is dumped.

In these four, a pick the dumped menus don't have leaves its slot empty.

Every `data/*.json` comes from the game: open the layout editors, kit
menus and shop menus with the StatsifyDump module running, then `pnpm build` and
`node scripts/import-dump.ts <dump.json> …`
with the last export of each dump session. Open each kit's editor from its picker before moving
anything: the picker shown next names the kit, and only an unsaved kit shows the default. Blitz's
and Mega Walls' editors open from each kit's Upgrades or Class page, which gives the level.
An item's `tooltip` holds the lines under its name as the game drew them, enchantments and
attributes included.

Kits come back as 40 slots: the hotbar, the three main rows, then boots to helmet in 36 to 39.
`ARMOR_SLOTS` lists the armor slots helmet first, as the inventory screen shows them.

For a skin render, `armorOf(items)` turns items (Pit's `inv_armor`, slots 36 to 39) into
`{ helmet, chestplate, leggings, boots }`, each `{ material, color, enchanted }`, a player head's
`{ head, enchanted }` texture hash or a mob skull's `{ skull }`; other things on the head, like
a block, are left out. `duelsKitArmor(key)`, `skyWarsKitArmor(kit)`, `blitzKitArmor(kit, level)` and
`megaWallsKitArmor(kit, level)` give a kit's armor by the keys the adapters above take; Blitz's
covers every level from its Upgrades page. Leather is dyed by the name its picker gives (White
Leather Chestplate), else by the picker icon when it shows that piece, else (Blitz) by the color
its editor shows on that piece. Mega Walls Duel's picker lists no armor, so its classes come back
undefined.

