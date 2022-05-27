declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
      API_ROUTE: string;
      DISCORD_BOT_PUBLIC_KEY: string;
      DISCORD_BOT_PORT?: number;
      DISCORD_BOT_TOKEN: string;
      DISCORD_BOT_APPLICATION_ID: string;
      DISCORD_BOT_GUILD?: string;
      CORE_IDS?: string;
    }
  }
}

export {};
