FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:1-16

# Install additional OS packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends fontconfig redis-server

# Install NPM packages
RUN su node -c "npm install -g pm2 git-cz pnpm"