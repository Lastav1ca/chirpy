import type { MigrationConfig } from "drizzle-orm/migrator";

process.loadEnvFile(".env")

type APIConfig = {
    fileserverHits : number;
    platform : string;
};

const migrationConfig: MigrationConfig = {
  migrationsFolder: "./src/db/migrations",
};

export type DBConfig = {
    url : string
    migrationConfig : MigrationConfig
};

type Config = {
  api: APIConfig;
  db: DBConfig;
};

//helper func for throwing error if env is missing
function envOrThrow(key : string) : string{
    const value = process.env[key];
    if (!value) throw new Error(`Missing environment variable: ${key}`)
    return value;
}

export const config: Config = {
  api: { fileserverHits: 0, platform: envOrThrow("PLATFORM") },
  db: { url: envOrThrow("DB_URL"), migrationConfig },
};