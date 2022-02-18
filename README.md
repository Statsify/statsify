<div align="center">

<img src="https://statsify.net/cdn/logos/pixel.png" width="10%" alt="Statsify Logo">

# Statsify
A Hypixel and Minecraft focused Discord Bot

</div>

## 💻 Developing
### ⚒️ Requirements
-   [`Node.js`]: For running code (`v16`)
-   *[`Yarn`]*\*: Installing packages and running scripts (`npm install -g yarn`)
-   [`MongoDB`]: For Persistent data ([`Atlas`])
-   *[`Redis`]*\*: For Leaderboards, ([`Redis Cloud`])
-   [`Hypixel API Key`]: For requesting Hypixel data, Run `/api new` on hypixel.net

\* is Optional

### 🚀 Running
* The codebase is split into apps and packages
* Set up a `.env` file in the root of the project following the `.env.schema` file
* Use `yarn build` to build all packages and apps,
* Use `yarn build:watch` to watch files and build them as you code
* Use `yarn {appName} start` to run an app

### 🤖 Other Important commands
```bash
# Change things in a package/app
$ yarn workspace {app or package name} {command}

# Example: Adding a dependency
$ yarn workspace {app or package name} add {dependency}

# Linting
$ yarn lint
```

## 💁 Contributing
* Follow the guidelines in [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md)

## 😕 Help
* If you require support join our [`Discord`] and create a ticket in the `#create-ticket` channel


## 📙 Features
- Image Profiles
- Leaderboards
- Historical Stats

## 🔗 Links
- [`Website`]
- [`Bot Invite`]
- [`Discord`]
- [`Donate`]

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