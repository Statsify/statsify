<div align="center">

<img src="https://statsify.net/cdn/logos/pixel.png" width="10%" alt="Statsify Logo">

# Statsify
A Hypixel and Minecraft focused Discord Bot

</div>

## 💻 Developing
### ⚒️ Requirements
-   [`Node.js`]: For running code (`v16`)
-   [`Yarn`]: Installing packages and running scripts (`npm install -g yarn`)
-   [`MongoDB`]: For Persistent data ([`Atlas`])
-   [`Redis`]: For Leaderboards, ([`Redis Cloud`])
-   [`Hypixel API Key`]: For requesting Hypixel data, Run `/api new` on hypixel.net


### 🖼️ Assets
* Currently we supply public assets for development as a [git submodule](https://github.com/Statsify/public-assets)
* In addition, you must provide a 1.8.9 texture pack in the `assets/public/minecraft-textures/default`

### 🚀 Running
* The codebase is split into apps and packages
* Set up a `config.js` file in the root of the project following the `config.schema.js` file (copy paste it over and fill it in)
* Pull the git submodules (`git submodule update --init`)
* Set up the assets by running `cd assets/public && yarn`
* Use `yarn build` to build all packages and apps,
* Use `yarn build:watch` to watch files and build them while you code
* Use `yarn {appName} start` to run an app, eg `yarn api start` to run the API

### 🤖 Other Important commands
```bash
# Change things in a package/app
$ yarn workspace {app or package name} {command}

# Example: Adding a dependency
$ yarn workspace {app or package name} add {dependency}

# Linting
$ yarn lint

# Testing
$ yarn test

# Type Testing
$ yarn test:types
```

## 💁 Contributing
* Follow the guidelines in [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md)
* If you are unsure of anything join our [`Discord`] and then message, `jacob#5432`

## 😕 Help
* If you require support join our [`Discord`] and create a ticket in the `#create-ticket` channel

## 🔗 Links
- [`Website`]
- [`Bot Invite`]
- [`Discord`]
- [`Donate`]

## Showcase
![Bedwars Command](https://raw.githubusercontent.com/Statsify/statsify/main/apps/site/public/examples/bedwars.png)
![Bedwars Command](https://raw.githubusercontent.com/Statsify/statsify/main/apps/site/public/examples/bedwars-leaderboard.png)
![Bedwars Command](https://raw.githubusercontent.com/Statsify/statsify/main/apps/site/public/examples/guild-overall.png)
![Bedwars Command](https://raw.githubusercontent.com/Statsify/statsify/main/apps/site/public/examples/status.png)
![Bedwars Command](https://raw.githubusercontent.com/Statsify/statsify/main/apps/site/public/examples/friends.png)


<!-- LINKS -->
[`website`]: https://statsify.net
[`bot invite`]: https://statsify.net/invite
[`discord`]: https://statsify.net/discord
[`donate`]: https://statsify.net/donate
[`node.js`]: https://nodejs.org/en/download/current/
[`redis`]: https://redis.io
[`mongodb`]: https://www.mongodb.com/
[`hypixel api key`]: https://api.hypixel.net
[`yarn`]: https://yarnpkg.com/
[`atlas`]: https://www.mongodb.com/cloud/atlas/register`
[`redis cloud`]: https://redis.com/try-free/