FROM node:24.22.1-bookworm AS base
ENV CI=true TURBO_TELEMETRY_DISABLED=1 PNPM_HOME=/pnpm
RUN --mount=type=bind,source=package.json,target=/tmp/package.json \
  npm install -g "$(node -p 'require("/tmp/package.json").packageManager')"
WORKDIR /app

FROM base AS prune
ARG APP
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store --mount=type=cache,id=pnpm-cache,target=/root/.cache/pnpm \
  pnpm dlx "turbo@$(node -p 'require("./package.json").devDependencies.turbo')" prune "$APP" --docker

FROM base AS build
ENV PATH="/root/.cargo/bin:$PATH"
# Before ARG APP and the package files, so every app shares this layer and dependency changes don't reinstall Rust
RUN curl -fsSL https://sh.rustup.rs | sh -s -- -y --profile minimal --target wasm32-unknown-unknown \
  && curl -fsSL https://rustwasm.github.io/wasm-pack/installer/init.sh | sh
ARG APP
COPY --from=prune /app/out/json/ .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=prune /app/out/full/ .
# turbo prune leaves out root files, like these and the locales
COPY .swcrc Cargo.toml ./
RUN --mount=type=cache,id=cargo-registry,target=/root/.cargo/registry \
  --mount=type=cache,id=cargo-target,target=/app/target \
  --mount=type=cache,id=wasm-pack,target=/root/.cache/.wasm-pack \
  pnpm turbo run build --filter="$APP"
# --prod over the full install unlinks dev dependencies but leaves them in node_modules
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  rm -rf node_modules apps/*/node_modules packages/*/node_modules .turbo apps/*/.turbo packages/*/.turbo \
  && pnpm install --frozen-lockfile --prod --offline \
  && mv node_modules /node_modules
COPY locales locales

FROM base AS assets-prune
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store --mount=type=cache,id=pnpm-cache,target=/root/.cache/pnpm \
  pnpm dlx "turbo@$(node -p 'require("./package.json").devDependencies.turbo')" prune scripts --docker

# Only the blur's inputs, so it reruns when backgrounds, the script or dependencies change instead of on every commit
FROM base AS assets
COPY --from=assets-prune /app/out/json/ .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile --filter scripts
COPY apps/scripts/src/blur-backgrounds.ts apps/scripts/src/
COPY assets assets
WORKDIR /app/apps/scripts
RUN node src/blur-backgrounds.ts && rm -rf ../../assets/private/backgrounds

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
# Declared late so the layers above stay shared between apps
ARG APP
WORKDIR /app/apps/$APP
CMD ["node", "--enable-source-maps", "."]
