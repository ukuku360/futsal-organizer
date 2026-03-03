"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import db, { type Player } from "@/lib/db";

export async function joinSession(
  prevState: { error?: string; success?: boolean; playerName?: string },
  formData: FormData
) {
  const sessionId = parseInt(formData.get("sessionId") as string);
  const slug = formData.get("slug") as string;
  const name = (formData.get("name") as string)?.trim();

  if (!name) {
    return { error: "Please enter your name" };
  }

  if (name.length > 50) {
    return { error: "Name is too long (max 50 characters)" };
  }

  const existing = db
    .prepare("SELECT id FROM players WHERE session_id = ? AND name = ?")
    .get(sessionId, name) as Player | undefined;

  if (existing) {
    return { error: "This name is already taken in this session" };
  }

  db.prepare("INSERT INTO players (session_id, name) VALUES (?, ?)").run(
    sessionId,
    name
  );

  // Set cookie so we remember this user
  const cookieStore = await cookies();
  cookieStore.set(`player_${slug}`, name, {
    path: `/session/${slug}`,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: "lax",
  });

  revalidatePath(`/session/${slug}`);
  return { success: true, playerName: name };
}

export async function leaveSession(formData: FormData) {
  const playerId = parseInt(formData.get("playerId") as string);
  const slug = formData.get("slug") as string;

  db.prepare("DELETE FROM players WHERE id = ? AND is_captain = 0").run(
    playerId
  );

  // Clear cookie
  const cookieStore = await cookies();
  cookieStore.delete(`player_${slug}`);

  revalidatePath(`/session/${slug}`);
}

export async function markPaid(formData: FormData) {
  const playerId = parseInt(formData.get("playerId") as string);
  const slug = formData.get("slug") as string;

  db.prepare("UPDATE players SET has_paid = 1 WHERE id = ?").run(playerId);
  revalidatePath(`/session/${slug}`);
}

export async function confirmPayment(formData: FormData) {
  const playerId = parseInt(formData.get("playerId") as string);
  const slug = formData.get("slug") as string;

  db.prepare(
    "UPDATE players SET payment_confirmed = 1 WHERE id = ?"
  ).run(playerId);
  revalidatePath(`/session/${slug}`);
}

export async function updatePlayerDetails(formData: FormData) {
  const playerId = parseInt(formData.get("playerId") as string);
  const slug = formData.get("slug") as string;
  const details = (formData.get("details") as string)?.trim() || null;

  db.prepare("UPDATE players SET details = ? WHERE id = ?").run(details, playerId);
  revalidatePath(`/session/${slug}`);
}
