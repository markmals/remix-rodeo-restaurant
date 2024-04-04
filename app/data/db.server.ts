import { drizzle } from "drizzle-orm/better-sqlite3"
import Database from "better-sqlite3"
import * as schema from "./schema.server"

const sqlite = new Database("./app/data/sqlite.db", { fileMustExist: true })
export const db = drizzle(sqlite, { schema })
