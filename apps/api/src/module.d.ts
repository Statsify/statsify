declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_PORT: number;
      IGNORE_AUTH: boolean;
    }
  }
}

export {};
