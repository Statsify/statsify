# Contributing
* If you wish to contribute to the Statsify simply fork the repository and submit a pull request
* If you wish to report a bug/suggestion simply create an issue

## Guidelines

### General Concepts
* Code should follow our ESLint rules as closely as possible
* Code should attempt to be TypeScript type safe
* Code should attempt to be consistent, fast, scalable, and efficient

### Packages
* Packages should be in the packages folder
* The folder name should be the packages's name
* The name in its package.json should follow the format `@statsify/{packageName}`
* Packages should not be runnable

### Apps
* Apps should be in the apps folder and should be simply be called by the app name
* Apps should also have a yarn workspace script in the root `package.json`
* Apps should be runnable
* Apps can use import paths to simplify imports in the project

## Running
* Follow the steps in the `README.md`

## Questions
* Questions should go in our [`Discord`](https://statsify.net/discord)