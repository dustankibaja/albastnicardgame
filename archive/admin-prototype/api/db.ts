import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "db.json");

export type Tournament = {
  name: string;
  startsAt: string;
  venue?: string;
  prizePool?: string;
  format?: string;
};

export type Winner = {
  id: string;
  name: string;
  image?: string;
  tournament: string;
  date: string;
  year: number;
  position: number;
  prize?: string;
  city?: string;
};

export type Signup = {
  email: string;
  createdAt: string;
};

export type DbSchema = {
  tournament: Tournament;
  winners: Winner[];
  signups: Signup[];
};

// Phase 1: the default tournament below is stale (#25) and is NOT verified data.
const defaultDb: DbSchema = {
  tournament: {
    name: "Albastini Tournament #25",
    startsAt: "2026-08-27T15:00:00+03:00",
    venue: "Dar es Salaam",
    prizePool: "TSh 250,000",
    format: "64 players · knockout",
  },
  // Placeholder winners removed in Phase 1: they were not real records.
  winners: [],
  signups: [],
};

let memoryDb: DbSchema | null = null;

export async function readDb(): Promise<DbSchema> {
  if (memoryDb) return memoryDb;

  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    memoryDb = JSON.parse(data);
    return memoryDb!;
  } catch (error: any) {
    memoryDb = defaultDb;
    // Try to write it, but ignore if we are in a read-only environment (like Vercel)
    try {
      await fs.writeFile(DB_PATH, JSON.stringify(defaultDb, null, 2), "utf-8");
    } catch (e) {
      // Ignore EROFS
    }
    return memoryDb;
  }
}

export async function writeDb(data: DbSchema): Promise<void> {
  memoryDb = data;
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    // Ignore EROFS in serverless environments
  }
}
