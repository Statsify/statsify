declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_PORT: number;
      API_MEDIA_ROOT: string;
      IGNORE_AUTH?: string;
      MONGODB_URI: string;
      REDIS_URL: string;
      HYPIXEL_API_KEY: string;
      HYPIXEL_API_TIMEOUT: number;
    }
  }
}

export {};
