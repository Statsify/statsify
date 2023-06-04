# Contributing
* If you wish to contribute to the Statsify project, simply fork the repository and submit a pull request
* If you wish to report a bug/suggestion simply create an issue
* If you are unsure of anything join our [`Discord`] and then message, `jacob#5432` OR create a ticket in the `#create-ticket` channel

## Guidelines

### General Concepts
* Code should follow our ESLint rules as closely as possible (`pnpm lint`)
* Code should attempt to be TypeScript type safe
* Code should attempt to be consistent, fast, scalable, and efficient

### Packages
* Packages should not be runnable
* Packages should be in the packages folder
* The folder name should just be the packages's name
* The name in its package.json should follow the format `@statsify/{packageName}`

### Apps
* Apps should be runnable
* Apps should be in the apps folder and should simply be called by the app name
* Apps should have a pnpm workspace script in the root `package.json`
* Apps can use import paths to simplify imports in the project

## Running
* Follow the steps in the `README.md`

## Questions
* Questions should go in our [`Discord`](https://statsify.net/discord)