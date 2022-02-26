declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_BOT_PUBLIC_KEY: string;
      DISCORD_BOT_PORT: number;
    }
  }
}

export {};
