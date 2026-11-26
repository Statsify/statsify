ARG PNPM_VERSION
ARG NODE_VERSION
ARG TURBO_VERSION
ARG RUST_VERSION
ARG CARGO_CHEF_VERSION

FROM ghcr.io/pnpm/pnpm:${PNPM_VERSION} AS pnpm-bin 

# install rust and cargo-chef
FROM lukemathwalker/cargo-chef:${CARGO_CHEF_VERSION}-rust-${RUST_VERSION}-slim-bookworm AS base
ARG NODE_VERSION
ARG TURBO_VERSION

# set rust env
ENV RUSTUP_HOME="/usr/local/rustup"
ENV CARGO_HOME="/usr/local/cargo"
ENV CARGO_TARGET_DIR="/app/target"

# set pnpm env
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PNPM_HOME:$PATH"
ENV TURBO_TELEMETRY_DISABLED=1

# install pnpm and node
COPY --from=pnpm-bin /opt/pnpm /opt/pnpm
RUN for bin in pnpm pn pnpx pnx; do [ -f "/opt/pnpm/$bin" ] && ln -s "/opt/pnpm/$bin" "/usr/local/bin/$bin" || true; done
RUN pnpm runtime set node "${NODE_VERSION}" -g
RUN pnpm add -g "turbo@${TURBO_VERSION}"
RUN pnpm config set store-dir /var/cache/pnpm/store && \
    pnpm config set cache-dir /var/cache/pnpm/cache

FROM base AS rust-planner
WORKDIR /app
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM base AS rust-cacher
WORKDIR /app
COPY --from=rust-planner /app/recipe.json recipe.json
RUN --mount=type=cache,id=cargo-registry,target=/usr/local/cargo/registry \
    --mount=type=cache,id=cargo-git,target=/usr/local/cargo/git \
    HOST_TARGET=$(rustc -vV | awk '/host:/ {print $2}') && \
    cargo chef cook --release --target "${HOST_TARGET}" --recipe-path recipe.json

FROM base AS pnpm-fetcher
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    pnpm fetch

# export folders for each app with minimal amount of dependencies
FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune api --docker --out-dir /pruned/api && \
    turbo prune discord-bot --docker --out-dir /pruned/discord-bot && \
    turbo prune support-bot --docker --out-dir /pruned/support-bot && \
    turbo prune verify-server --docker --out-dir /pruned/verify-server

# build api
FROM rust-cacher AS api-builder
WORKDIR /app
# forces pnpm-fetcher to run before api-builder, not needed otherwise
COPY --from=pnpm-fetcher /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /pruned/api/json/ .
COPY --from=pruner /pruned/api/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    pnpm install --prefer-offline --frozen-lockfile

COPY --from=pruner /pruned/api/full/ .
RUN --mount=type=cache,id=cargo-registry,target=/usr/local/cargo/registry \
    --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    --mount=type=cache,id=turbo,target=/app/.turbo/cache \
    turbo run build --filter=api && \
    pnpm deploy --prefer-offline --filter=api --prod /prod/api

# build discord-bot
FROM pnpm-fetcher AS discord-bot-builder
WORKDIR /app
COPY --from=pruner /pruned/discord-bot/json/ .
COPY --from=pruner /pruned/discord-bot/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    pnpm install --prefer-offline --frozen-lockfile

COPY --from=pruner /pruned/discord-bot/full/ .
RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    --mount=type=cache,id=turbo,target=/app/.turbo/cache \
    turbo run build --filter=discord-bot && \
    pnpm deploy --prefer-offline --filter=discord-bot --prod /prod/discord-bot

# build support-bot
FROM pnpm-fetcher AS support-bot-builder
WORKDIR /app
COPY --from=pruner /pruned/support-bot/json/ .
COPY --from=pruner /pruned/support-bot/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    pnpm install --prefer-offline --frozen-lockfile

COPY --from=pruner /pruned/support-bot/full/ .
RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    --mount=type=cache,id=turbo,target=/app/.turbo/cache \
    turbo run build --filter=support-bot && \
    pnpm deploy --prefer-offline --filter=support-bot --prod /prod/support-bot

# build verify-server
FROM pnpm-fetcher AS verify-server-builder
WORKDIR /app
COPY --from=pruner /pruned/verify-server/json/ .
COPY --from=pruner /pruned/verify-server/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    pnpm install --prefer-offline --frozen-lockfile

COPY --from=pruner /pruned/verify-server/full/ .
RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    --mount=type=cache,id=turbo,target=/app/.turbo/cache \
    turbo run build --filter=verify-server && \
    pnpm deploy --prefer-offline --filter=verify-server --prod /prod/verify-server

FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ENV NODE_ENV=production

FROM runtime AS api
RUN apt-get update && apt-get install -y --no-install-recommends \
    fontconfig \
    libvulkan1 \
    mesa-vulkan-drivers \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app/apps/api
COPY --from=api-builder /prod/api ./
CMD ["node", "--enable-source-maps", "."]

FROM runtime AS discord-bot
WORKDIR /app/apps/discord-bot
COPY --from=discord-bot-builder /prod/discord-bot ./
CMD ["node", "--enable-source-maps", "."]

FROM runtime AS support-bot
WORKDIR /app/apps/support-bot
COPY --from=support-bot-builder /prod/support-bot ./
CMD ["node", "--enable-source-maps", "."]

FROM runtime AS verify-server
WORKDIR /app/apps/verify-server
COPY --from=verify-server-builder /prod/verify-server ./
CMD ["node", "--enable-source-maps", "."]