declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    NODE_ENV: 'development' | 'production' | 'test';
    CLIENT_URL?: string;
    SESSION_SECRET?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GOOGLE_CALLBACK_URL?: string;
  }
}

