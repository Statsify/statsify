ARG RUST_VERSION=1.99
ARG PNPM_VERSION=12
ARG NODE_VERSION=24
ARG CARGO_CHEF_VERSION=0.1.78

# install rust and cargo-chef
FROM lukemathwalker/cargo-chef:${CARGO_CHEF_VERSION}-rust-${RUST_VERSION}-slim-bookworm AS base

# set rust env
ENV RUSTUP_HOME="/usr/local/rustup"
ENV CARGO_HOME="/usr/local/cargo"
ENV CARGO_TARGET_DIR="/app/target"

# add pnpm to path
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PNPM_HOME:$PATH"

ENV TURBO_TELEMETRY_DISABLED=1

# install pnpm
COPY --from=ghcr.io/pnpm/pnpm:12 /opt/pnpm /opt/pnpm
RUN for bin in pnpm pn pnpx pnx; do ln -s "/opt/pnpm/$bin" "/usr/local/bin/$bin"; done

# install node
RUN pnpm runtime set node ${NODE_VERSION} -g

# install curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# add wasm and install wasm-pack
RUN rustup default ${RUST_VERSION} && \
    rustup target add wasm32-unknown-unknown && \
    curl --proto '=https' --tlsv1.2 -LsSf https://drager.github.io/wasm-pack/installer/init.sh | sh

FROM base AS planner
WORKDIR /app
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# download dependencies
FROM base AS cacher
WORKDIR /app

# fetch pnpm dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/var/cache/pnpm/store \
    --mount=type=cache,id=pnpm-cache,target=/var/cache/pnpm/cache \
    pnpm fetch --store-dir /var/cache/pnpm/store --cache-dir /var/cache/pnpm/cache

# fetch and compile rust dependencies
COPY --from=planner /app/recipe.json recipe.json
RUN --mount=type=cache,id=cargo-registry,target=/usr/local/cargo/registry \
    cargo chef cook --release --recipe-path recipe.json && \
    cargo chef cook --release --target wasm32-unknown-unknown --recipe-path recipe.json

# build repo
FROM cacher AS builder
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/var/cache/pnpm/store \
    --mount=type=cache,id=pnpm-cache,target=/var/cache/pnpm/cache \
    --mount=type=cache,id=cargo-registry,target=/usr/local/cargo/registry \
    --mount=type=cache,id=wasm-pack,target=/root/.cache/.wasm-pack \
    --mount=type=cache,id=turbo,target=/app/.turbo/cache \
    pnpm install --prefer-offline --frozen-lockfile \
      --store-dir /var/cache/pnpm/store \
      --cache-dir /var/cache/pnpm/cache && \
    pnpm build

RUN pnpm deploy --filter=api --prod /prod/api && \
    pnpm deploy --filter=discord-bot --prod /prod/discord-bot && \
    pnpm deploy --filter=support-bot --prod /prod/support-bot && \
    pnpm deploy --filter=verify-server --prod /prod/verify-server

FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ENV NODE_ENV=production

FROM runtime AS api
RUN apt-get update && apt-get install -y --no-install-recommends \
    fontconfig \
    libvulkan1 \
    mesa-vulkan-drivers \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app/apps/api
COPY --from=builder /prod/api ./
CMD ["node", "--enable-source-maps", "."]

FROM runtime AS discord-bot
WORKDIR /app/apps/discord-bot
COPY --from=builder /prod/discord-bot ./
CMD ["node", "--enable-source-maps", "."]

FROM runtime AS support-bot
WORKDIR /app/apps/support-bot
COPY --from=builder /prod/support-bot ./
CMD ["node", "--enable-source-maps", "."]

FROM runtime AS verify-server
WORKDIR /app/apps/verify-server
COPY --from=builder /prod/verify-server ./
CMD ["node", "--enable-source-maps", "."]