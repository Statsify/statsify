FROM node:24.7.0-bookworm AS base
ENV CI=true TURBO_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

FROM base AS prune
ARG APP
COPY . .
RUN pnpm dlx "turbo@$(node -p 'require("./package.json").devDependencies.turbo')" prune "$APP" --docker

FROM base AS build
ARG APP
ENV PATH="/root/.cargo/bin:$PATH"
COPY --from=prune /app/out/json/ .
RUN if [ -e packages/skin-renderer ]; then \
    curl -fsSL https://sh.rustup.rs | sh -s -- -y --profile minimal --target wasm32-unknown-unknown \
    && curl -fsSL https://rustwasm.github.io/wasm-pack/installer/init.sh | sh; \
  fi
RUN pnpm install --frozen-lockfile
COPY --from=prune /app/out/full/ .
# Prune leaves out root files the apps need: swc's config, the skin renderer's release profile and the locales
COPY .swcrc Cargo.toml ./
RUN pnpm turbo run build --filter="$APP"
# A fresh install, since --prod over the full one unlinks dev dependencies but leaves them in node_modules
RUN rm -rf node_modules apps/*/node_modules packages/*/node_modules target \
  && pnpm install --frozen-lockfile --prod --offline \
  && mv node_modules /node_modules
COPY locales locales

FROM base AS assets
COPY . .
RUN pnpm install --frozen-lockfile --filter assets \
  && cd assets/private && pnpm blur && rm -rf backgrounds node_modules

FROM ubuntu:24.04
LABEL org.opencontainers.image.source=https://github.com/Statsify/statsify

# Skins render on lavapipe, Mesa's software Vulkan driver
RUN apt-get update \
  && apt-get install -y --no-install-recommends fontconfig libvulkan1 mesa-vulkan-drivers \
  && rm -rf /var/lib/apt/lists/*

COPY --from=base /usr/local/bin/node /usr/local/bin/node
WORKDIR /app
COPY --from=assets /app/assets assets
COPY --from=build /node_modules node_modules
COPY --from=build /app .
# Declared this late so the layers above stay shared between the apps' images
ARG APP
WORKDIR /app/apps/$APP
CMD ["node", "--enable-source-maps", "."]
