// environment.d.ts

declare namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string; // <-- Informa ao TS que JWT_SECRET existe
      // Outras variáveis de ambiente, se houver:
      // PORT: string; 
    }
  }