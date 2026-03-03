import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import db, { type Session, type Player } from "@/lib/db";
import Link from "next/link";
import SessionHeader from "./components/SessionHeader";
import JoinForm from "./components/JoinForm";
import PlayerList from "./components/PlayerList";
import ShareLink from "./components/ShareLink";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = db
    .prepare("SELECT * FROM sessions WHERE slug = ?")
    .get(slug) as Session | undefined;

  if (!session) {
    notFound();
  }

  const players = db
    .prepare(
      "SELECT * FROM players WHERE session_id = ? ORDER BY is_captain DESC, joined_at ASC"
    )
    .all(session.id) as Player[];

  const cookieStore = await cookies();
  const currentPlayerName = cookieStore.get(`player_${slug}`)?.value ?? null;

  const hasJoined = currentPlayerName
    ? players.some((p) => p.name === currentPlayerName)
    : false;

  const isCaptain = currentPlayerName === session.captain_name;

  const confirmed = players.filter((p) => p.payment_confirmed).length;
  const pending = players.filter((p) => p.has_paid && !p.payment_confirmed).length;
  const unpaid = players.filter((p) => !p.has_paid).length;

  return (
    <div className="space-y-3">
      {/* Session Info + Price */}
      <SessionHeader session={session} playerCount={players.length} />

      {/* Actions: Share + Edit (captain only) */}
      <div className="flex justify-end gap-2">
        {isCaptain && (
          <Link
            href={`/session/${slug}/edit`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-surface px-3.5 py-2 text-[13px] font-medium text-muted hover:text-foreground transition-colors"
          >
            &#9998; Edit Match
          </Link>
        )}
        <ShareLink />
      </div>

      {/* Join Form */}
      {!hasJoined && (
        <div className="bg-surface rounded-2xl p-5">
          <h2 className="text-[14px] font-semibold text-foreground mb-3">
            Join this game
          </h2>
          <JoinForm sessionId={session.id} slug={slug} />
        </div>
      )}

      {/* Player List */}
      <div>
        <div className="flex items-center justify-between px-1 mb-2">
          <h2 className="text-[14px] font-semibold text-foreground">
            Players
          </h2>
          <span className="text-[13px] text-muted">{players.length} joined</span>
        </div>
        {players.length > 0 ? (
          <PlayerList
            players={players}
            slug={slug}
            currentPlayerName={currentPlayerName}
            captainName={session.captain_name}
          />
        ) : (
          <div className="bg-surface rounded-2xl p-8 text-center">
            <p className="text-[14px] text-muted">
              No players yet. Be the first to join!
            </p>
          </div>
        )}
      </div>

      {/* Payment Summary */}
      <div className="bg-surface rounded-2xl p-5">
        <h2 className="text-[14px] font-semibold text-foreground mb-4">
          Payment Summary
        </h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[22px] font-bold text-[#2e7d32]">{confirmed}</p>
            <p className="text-[12px] text-muted">Confirmed</p>
          </div>
          <div>
            <p className="text-[22px] font-bold text-[#e65100]">{pending}</p>
            <p className="text-[12px] text-muted">Pending</p>
          </div>
          <div>
            <p className="text-[22px] font-bold text-muted">{unpaid}</p>
            <p className="text-[12px] text-muted">Unpaid</p>
          </div>
        </div>
      </div>
    </div>
  );
}
