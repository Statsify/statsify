# Changelog
All notable changes to this project will be documented in this file.

# [next]

## Bug Fixes

- **ci:** Make coverage not fail the ci (#67) ([58aa38d](https://github.com/Statsify/statsify/commit/58aa38d50c62dc6993dd20fd5d045a83d8bdd929))
- **schema:** Fix Quake Ratios + Skywars Doubles (#53) ([50e17e8](https://github.com/Statsify/statsify/commit/50e17e8dc027b4fec98b392b4240790f7656a84f))
- **schema:** Fix quake ratios + skywars doubles (#52) ([50e18c6](https://github.com/Statsify/statsify/commit/50e18c6bad6407a534e91706b9e9f990cc937d0e))
- **responses:** Fixes api doc responses (#43) ([04b8234](https://github.com/Statsify/statsify/commit/04b823460cfd62576e30f66d3ce593ad5addd74c))
- **friends:** Fixed requesting too many friends ([7d9350b](https://github.com/Statsify/statsify/commit/7d9350bd3730b7789720262b5654a2095d0b77f3))
- **guildservice:** Added some basic caching along with a few refactors ([7a4afbf](https://github.com/Statsify/statsify/commit/7a4afbfa18c47cfe9c218b4ed3b58df85f095580))
- **guild:** Added an ExpByGame class and fixed some issues ([6c212bd](https://github.com/Statsify/statsify/commit/6c212bd8807b94cab5284a58c5a2634b56c8c9c7))
- **playerservice:** Fix fetching player and adding to database ([339b757](https://github.com/Statsify/statsify/commit/339b757f00eb7ec46ef8dbd8934b1b651f2cf7cf))
- **arcade:** Add more relevant arcade stats ([97f5349](https://github.com/Statsify/statsify/commit/97f5349c73e8439dfc453d770caac1d585d46d06))
- **playerservice:** Fix caching ([68a1a4b](https://github.com/Statsify/statsify/commit/68a1a4b61071b77f18c657a53a2fe93f43fc4fb7))
- **playercontroller:** Changes the api operation of PlayerController#getPlayer ([212ecc8](https://github.com/Statsify/statsify/commit/212ecc8172fac7616010a11b90c9e8bcb604e637))
- **skywars:** Fixed ratios for overall normal ([13dc20a](https://github.com/Statsify/statsify/commit/13dc20a4cb6f7309240687607bef04a4268ad650))

## Documentation

- **redoc:** Change Redoc from Light Theme to "Tokyo Night" vibe (#57) ([0daf363](https://github.com/Statsify/statsify/commit/0daf36311acc97f0060eb754e2a163a535e4fae4))
- **readme:** Added readme and contributing guidelines ([6e96d8f](https://github.com/Statsify/statsify/commit/6e96d8f81863335690d702a3bfd8bf4e8f656ac4))
- Added comments to a lot of classes/functions and fixed a few issues and inconsistencies ([ded73d3](https://github.com/Statsify/statsify/commit/ded73d3c1849c616834e09c1ecb67f202cb89d6f))

## Features

- **guild monthly, player:** Monthly gexp and delete route (#68) ([b21d56d](https://github.com/Statsify/statsify/commit/b21d56d93d6922331c39b70d903aa2d26adcfaed))
- **discord-bot:** Initial commit (#58) ([af68693](https://github.com/Statsify/statsify/commit/af68693bee1a5c8480866c753c20b2077adc5305))
- **rankings:** Add player rankings (#54) ([40a2a1b](https://github.com/Statsify/statsify/commit/40a2a1b3549918780cd68bc9c30d2708bec50a7b))
- **leaderboards:** Player leaderboards (#27) ([fa2e874](https://github.com/Statsify/statsify/commit/fa2e874393edd4b8e585470879d34a6924fa8324))
- **testing:** Add jest unit tests (#47) ([5e22484](https://github.com/Statsify/statsify/commit/5e22484a5ea614994b7ecbfece06c0aaa39a7a3f))
- **blitz:** Added Shark + Milkman Kit & Fixed Leveling (#48) ([1535f6a](https://github.com/Statsify/statsify/commit/1535f6aafd398e65a3e15e23e38b065b55e0d7df))
- **historical:** Added last day, week, and month historical stats (#35) ([580be74](https://github.com/Statsify/statsify/commit/580be74ff06909e87ac0f05afd4bd2033228fa44))
- **historical:** Add historical stats routes and logic (#31) ([9c338c5](https://github.com/Statsify/statsify/commit/9c338c592adb59638c52a7000dbd3ded17221cd8))
- **site:** Create initial site app (#24) ([f1ca206](https://github.com/Statsify/statsify/commit/f1ca20656e85a75be69a94ed35d93bd11811430d))
- **leaderboards:** Started player leaderboards ([32a412b](https://github.com/Statsify/statsify/commit/32a412b343ca5c63d8874b7d5b30fd6594fe74da))
- **arcade:** Add seasonal gamemode stats (#17) ([0065b78](https://github.com/Statsify/statsify/commit/0065b78b84d7f8c5b539bd238efac84b93283405))
- **rankedskywars:** Added rankedskywars ([751b573](https://github.com/Statsify/statsify/commit/751b573382c779e94a7a3035a3b1ffc9aa092217))
- **skin:** Addded a route to generate player heads, and changed some dtos ([225c6c9](https://github.com/Statsify/statsify/commit/225c6c9ee4fa0a6c20e6962772265c7a91373df4))
- **guild:** Added `expHistory` and `scaledExpHistory` for the whole guild ([e3e75d3](https://github.com/Statsify/statsify/commit/e3e75d3b1dd710509d98b697f7aa7b191ba84b3c))
- **gamecounts:** Added gamecounts ([f167ee9](https://github.com/Statsify/statsify/commit/f167ee9810020cc04804438b4c37bb3a62770d82))
- **watchdog:** Added watchdog stats ([6b4837c](https://github.com/Statsify/statsify/commit/6b4837c804467bf13c7662c920a00b834fa4bf91))
- **friends:** Added friends ([2e3bbb2](https://github.com/Statsify/statsify/commit/2e3bbb259f5ce7df77c8f6fb8cb48eabfdd39cef))
- **status:** Added status route and schema ([509af83](https://github.com/Statsify/statsify/commit/509af8395d169f3170508e54c3985fb3e6f55767))
- **guildservice:** Add member name fetching ([801bf21](https://github.com/Statsify/statsify/commit/801bf21b75266b22de10af0802ff5ce39039d501))
- **guild:** Add the rest of the default guild data (#13) ([03cca49](https://github.com/Statsify/statsify/commit/03cca49d5d80772b4c08cd48aec83f124ef1e0ac))
- **recentgames:** Added recentgames ([a699c5a](https://github.com/Statsify/statsify/commit/a699c5a2c1a1760465617ffb78024756c0555679))
- **api:** Added some validation to routes ([aa351bf](https://github.com/Statsify/statsify/commit/aa351bfea79b33ab2931cf9a11fcd588750361ab))
- **megawalls:** Add kit stats (#11) ([c18d5bf](https://github.com/Statsify/statsify/commit/c18d5bfe994c50f17004049dda4d9be54b0c0402))
- **guild:** Added guild stats ([6c52373](https://github.com/Statsify/statsify/commit/6c523738cfac7d6d28d359569759b99e4523386d))
- **paintball:** Add more stats and perks (#8) ([6e3531b](https://github.com/Statsify/statsify/commit/6e3531bf3a126c866bef5d826ce40d5d8cbdea7c))
- **speeduhc:** Add more suhc stats ([faaa976](https://github.com/Statsify/statsify/commit/faaa976a28ff2b947470845cbd7656eee7f00892))
- **player:** Added last game ([212fb70](https://github.com/Statsify/statsify/commit/212fb70a7207ce48b3e52955472d8e3d680af71f))
- **playersocials:** Added player socials ([5a47359](https://github.com/Statsify/statsify/commit/5a47359c022d114f70e9b9b5ccc8ff57f5317351))
- **duels:** Added duels stats, fixed some serialization issues add store field ([9b6c833](https://github.com/Statsify/statsify/commit/9b6c8334b544eefd8b9cdfafd439228735bfdd2f))
- **schemas:** Added serialization and deserialization ([98e00b1](https://github.com/Statsify/statsify/commit/98e00b1e77d0e1da643c20a8e0d3a62ebd132c83))
- **parkour:** Added parkour stats ([cee350f](https://github.com/Statsify/statsify/commit/cee350fbe41aa3a80e3ce9406e4956716fccb08a))
- **murdermystery:** Added mudermystery stats ([d8b8c56](https://github.com/Statsify/statsify/commit/d8b8c56198e692d0afcec7e0b1e42c6980ce6f7b))
- **megawalls:** Added megawalls stats ([741c020](https://github.com/Statsify/statsify/commit/741c0200ddceacedee6f9d276921a1e2aca37b38))
- **tntgames:** Added tntgames stats ([9f65162](https://github.com/Statsify/statsify/commit/9f65162a935789e051d2757992e88429d300a6b5))
- **smashheroes:** Added smashheroes stats ([c92eea0](https://github.com/Statsify/statsify/commit/c92eea0a9c8988d36308a6877f58cf2001d90f66))
- **copsandcrims:** Added copsandcrims stats ([4e8db84](https://github.com/Statsify/statsify/commit/4e8db84f5af24b10872a27edce8c623cb107ea40))
- **buildbattle:** Added buildbattle stats ([d1f44bc](https://github.com/Statsify/statsify/commit/d1f44bc07378b3afdef3b01ed14f419f931c9845))
- **speeduhc:** Added speeduhc stats ([494ac03](https://github.com/Statsify/statsify/commit/494ac03b75031354be298daf3c86467778251463))
- **uhc:** Added uhc stats ([67db928](https://github.com/Statsify/statsify/commit/67db9280c5a6f2aa37bca65255c562c9f98240c7))
- **warlords:** Added warlords stats ([e27a5ca](https://github.com/Statsify/statsify/commit/e27a5cabab1883b4b6c76083df55da2f95fe2adb))
- **walls:** Added walls stats ([20fbe3a](https://github.com/Statsify/statsify/commit/20fbe3a0a8ff2d62407ff4e549da661ed87b6022))
- **vampirez:** Added vampirez stats ([188cdd4](https://github.com/Statsify/statsify/commit/188cdd471942d3aae65dd9c37569b999a8d2537a))
- **turbokartracers:** Added turbo kart racers ([51fbc4f](https://github.com/Statsify/statsify/commit/51fbc4f6f40a5ce569d086596d50a4100873f89f))
- **quake:** Added quake stats ([4f213d0](https://github.com/Statsify/statsify/commit/4f213d0ec7f658343a6e884ee90a87985931da10))
- **paintball:** Added paintball stats ([57c8220](https://github.com/Statsify/statsify/commit/57c822089eddaf14e7237eb8e0e2684f7d1c3c70))
- **arenabrawl:** Added arenabrawl stats ([6141f8f](https://github.com/Statsify/statsify/commit/6141f8f0b698dd2c12d0567915594b0e8c6199d0))
- **arcade:** Added arcade stats ([9942d1e](https://github.com/Statsify/statsify/commit/9942d1e879a616636e67a0072483d86279932a77))
- **blitzsg:** Added blitzsg stats ([c2be101](https://github.com/Statsify/statsify/commit/c2be10169af04e60fcd7e57e4da621e586d9450d))
- **skywars:** Addded skywars stats ([d2f644a](https://github.com/Statsify/statsify/commit/d2f644ae3b9944d6e627b54a82968e9fa41a91c9))
- **bedwars:** Added bedwars stats ([f2bf1ae](https://github.com/Statsify/statsify/commit/f2bf1aeaf6111800839e31a3efbd8eef7cde1c18))
- Switched to redoc and added more player fields ([ee8038e](https://github.com/Statsify/statsify/commit/ee8038e37581f4212ad792cc7c7a85a96a86e746))
- Added util package ([081656e](https://github.com/Statsify/statsify/commit/081656e8fb0bb418519ffca40da963db43f1737e))
- Added typegoose and swagger and created the schemas package ([df67b2b](https://github.com/Statsify/statsify/commit/df67b2b28fbd28f44633e08525117555e96cee7c))
- Math package ([8603a66](https://github.com/Statsify/statsify/commit/8603a666acc42602bfc53a174d479cdae853f300))
- Add logger package ([3f0f1b6](https://github.com/Statsify/statsify/commit/3f0f1b61baebf25a276933a77c866290242fab25))
- Api app ([e02205a](https://github.com/Statsify/statsify/commit/e02205af392c1b4d643c4d213d0956e1d90f2570))

## Refactor

- **constructor:** Move getConstructor to utils (#63) ([d5e7ccb](https://github.com/Statsify/statsify/commit/d5e7ccb0d8fc8e7f601765d3c5edb73d0cfdbe07))
- **dtos:** Change #dtos to export from an `index.ts` (#44) ([7e29eec](https://github.com/Statsify/statsify/commit/7e29eeca042b0a9814653b9a74b841fac2dec842))
- **leaderboards:** Added pipelining to leaderboards ([074f180](https://github.com/Statsify/statsify/commit/074f18045cff7a1c930e8924ffb624de503fac6c))
- **skywars:** Use better regex (#9) ([e26b8f3](https://github.com/Statsify/statsify/commit/e26b8f379cd1bdc095cc1cfe1cc869bb40f4140d))
- **tsconfig:** Update tsconfig to be strict ([91c385b](https://github.com/Statsify/statsify/commit/91c385be458dfbd52eb3e2142a1f2220d143ddbc))
- Logger constructor ([471170e](https://github.com/Statsify/statsify/commit/471170ec069e36ac7e1da7b106bbdd1dc5934300))

## Styling

- **schema:** Alphabetize Schema (#49) ([12209b5](https://github.com/Statsify/statsify/commit/12209b586fcb4d0f2354bf1b24197c077c408f05))
- **readme:** Change headers to be correct size ([20b62d0](https://github.com/Statsify/statsify/commit/20b62d0c221ef08d24a32c8b880279de3a1ba9c9))
- Added vscode settings ([5f09061](https://github.com/Statsify/statsify/commit/5f090612e2ea1ee37c0d95e7083a8c2bfea9641c))

## Testing

- **utils:** 100% Util coverage (#62) ([6d6972e](https://github.com/Statsify/statsify/commit/6d6972e5179d7d60b13598afc839c01c017dfd91))
- **logger:** Add logger tests (finally!) (#61) ([70bcdbb](https://github.com/Statsify/statsify/commit/70bcdbb6212fc68f624a6ce8232421ad03353363))
- **utils:** Adding missing util tests (#60) ([bae1cfd](https://github.com/Statsify/statsify/commit/bae1cfd334a0f058e266050d4dfd21bc219647c2))
- **math:** Add more math tests such as radians and missing situations (#59) ([601b960](https://github.com/Statsify/statsify/commit/601b96079986a093989be76b4a00482830564adf))

