import { createServerFn } from "@tanstack/react-start";
import { setCookie, getCookie, deleteCookie } from "@tanstack/react-start/server";
import { readDb, writeDb, type Tournament, type Winner, type Signup } from "./db";

// AUTHENTICATION
export const loginAdmin = createServerFn({ method: "POST" })
  .validator((password: string) => password)
  .handler(async ({ data: password }) => {
    if (password === "admin") {
      setCookie("admin_session", "true", {
        httpOnly: true,
        secure: process.env["NODE_ENV"] === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      });
      return { success: true };
    }
    return { success: false, error: "Invalid password" };
  });

export const logoutAdmin = createServerFn({ method: "POST" })
  .handler(async () => {
    deleteCookie("admin_session");
    return { success: true };
  });

export const checkAdminStatus = createServerFn({ method: "GET" })
  .handler(async () => {
    const session = getCookie("admin_session");
    return { isAdmin: session === "true" };
  });

// TOURNAMENT
export const getTournament = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = await readDb();
    return db.tournament;
  });

export const updateTournament = createServerFn({ method: "POST" })
  .validator((data: Tournament) => data)
  .handler(async ({ data }) => {
    const db = await readDb();
    const session = getCookie("admin_session");
    if (session !== "true") throw new Error("Unauthorized");
    
    db.tournament = data;
    await writeDb(db);
    return db.tournament;
  });

// WINNERS
export const getWinners = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = await readDb();
    return db.winners;
  });

export const addWinner = createServerFn({ method: "POST" })
  .validator((data: Omit<Winner, "id">) => data)
  .handler(async ({ data }) => {
    const db = await readDb();
    const session = getCookie("admin_session");
    if (session !== "true") throw new Error("Unauthorized");

    const newWinner: Winner = {
      ...data,
      id: `w-${Date.now()}`,
    };
    db.winners.push(newWinner);
    await writeDb(db);
    return newWinner;
  });

export const deleteWinner = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const db = await readDb();
    const session = getCookie("admin_session");
    if (session !== "true") throw new Error("Unauthorized");

    db.winners = db.winners.filter((w) => w.id !== id);
    await writeDb(db);
    return { success: true };
  });

// SIGNUPS
export const getSignups = createServerFn({ method: "GET" })
  .handler(async () => {
    const db = await readDb();
    const session = getCookie("admin_session");
    if (session !== "true") throw new Error("Unauthorized");

    return db.signups;
  });

export const addSignup = createServerFn({ method: "POST" })
  .validator((email: string) => email)
  .handler(async ({ data: email }) => {
    const db = await readDb();
    db.signups.push({ email, createdAt: new Date().toISOString() });
    await writeDb(db);
    return { success: true };
  });
