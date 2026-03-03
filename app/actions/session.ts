"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function createSession(formData: FormData) {
  const captainName = (formData.get("captainName") as string)?.trim();
  const courtName = (formData.get("courtName") as string)?.trim();
  const gameDate = formData.get("gameDate") as string;
  const gameTime = formData.get("gameTime") as string;
  const totalPrice = parseFloat(formData.get("totalPrice") as string);
  const payId = (formData.get("payId") as string)?.trim() || null;
  const bsb = (formData.get("bsb") as string)?.trim() || null;
  const acc = (formData.get("acc") as string)?.trim() || null;
  const location = (formData.get("location") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const receiptFile = formData.get("receipt") as File | null;

  if (!captainName || !courtName || !gameDate || !gameTime || isNaN(totalPrice) || totalPrice <= 0) {
    throw new Error("Missing required fields");
  }

  // Handle file upload
  let receiptPath: string | null = null;
  if (receiptFile && receiptFile.size > 0) {
    const ext = path.extname(receiptFile.name) || ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await receiptFile.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);
    receiptPath = filename;
  }

  const slug = generateSlug();

  const insertSession = db.prepare(`
    INSERT INTO sessions (slug, captain_name, court_name, game_date, game_time, total_price, receipt_path, location, notes, pay_id, bsb, acc)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertPlayer = db.prepare(`
    INSERT INTO players (session_id, name, is_captain, has_paid, payment_confirmed)
    VALUES (?, ?, 1, 1, 1)
  `);

  const createTx = db.transaction(() => {
    const info = insertSession.run(
      slug, captainName, courtName, gameDate, gameTime, totalPrice, receiptPath, location, notes, payId, bsb, acc
    );
    insertPlayer.run(info.lastInsertRowid, captainName);
  });
  createTx();

  // Set captain cookie
  const cookieStore = await cookies();
  cookieStore.set(`player_${slug}`, captainName, {
    path: `/session/${slug}`,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });

  redirect(`/session/${slug}`);
}

export async function updateSession(formData: FormData) {
  const sessionId = parseInt(formData.get("sessionId") as string);
  const slug = formData.get("slug") as string;
  const courtName = (formData.get("courtName") as string)?.trim();
  const gameDate = formData.get("gameDate") as string;
  const gameTime = formData.get("gameTime") as string;
  const totalPrice = parseFloat(formData.get("totalPrice") as string);
  const payId = (formData.get("payId") as string)?.trim() || null;
  const bsb = (formData.get("bsb") as string)?.trim() || null;
  const acc = (formData.get("acc") as string)?.trim() || null;
  const location = (formData.get("location") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const receiptFile = formData.get("receipt") as File | null;

  if (!courtName || !gameDate || !gameTime || isNaN(totalPrice) || totalPrice <= 0) {
    throw new Error("Missing required fields");
  }

  // Handle new receipt upload
  let receiptPath: string | undefined;
  if (receiptFile && receiptFile.size > 0) {
    const ext = path.extname(receiptFile.name) || ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const buffer = Buffer.from(await receiptFile.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);
    receiptPath = filename;
  }

  if (receiptPath !== undefined) {
    db.prepare(`
      UPDATE sessions SET court_name = ?, game_date = ?, game_time = ?, total_price = ?, location = ?, notes = ?, receipt_path = ?, pay_id = ?, bsb = ?, acc = ?
      WHERE id = ?
    `).run(courtName, gameDate, gameTime, totalPrice, location, notes, receiptPath, payId, bsb, acc, sessionId);
  } else {
    db.prepare(`
      UPDATE sessions SET court_name = ?, game_date = ?, game_time = ?, total_price = ?, location = ?, notes = ?, pay_id = ?, bsb = ?, acc = ?
      WHERE id = ?
    `).run(courtName, gameDate, gameTime, totalPrice, location, notes, payId, bsb, acc, sessionId);
  }

  const { revalidatePath } = await import("next/cache");
  revalidatePath(`/session/${slug}`);
  redirect(`/session/${slug}`);
}
