declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VERIFY_SERVER_IP: string;
      MONGODB_URI: string;
    }
  }
}

export {};
