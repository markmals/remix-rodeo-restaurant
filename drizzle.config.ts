import { defineConfig } from "drizzle-kit"

export default defineConfig({
    schema: "./app/data/schema.server.ts",
    out: "./migrations",
    driver: "better-sqlite",
    dbCredentials: {
        url: "./app/data/sqlite.db",
    },
    verbose: true,
    strict: false,
})
