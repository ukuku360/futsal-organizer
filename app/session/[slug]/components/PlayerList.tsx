"use client";

import { useState } from "react";
import { type Player } from "@/lib/db";
import {
  leaveSession,
  markPaid,
  confirmPayment,
  updatePlayerDetails,
} from "@/app/actions/player";

function PaymentBadge({ player }: { player: Player }) {
  if (player.payment_confirmed) {
    return (
      <span className="inline-flex items-center rounded-lg bg-[#e8f5e9] px-2.5 py-1 text-[11px] font-semibold text-[#2e7d32]">
        Confirmed
      </span>
    );
  }
  if (player.has_paid) {
    return (
      <span className="inline-flex items-center rounded-lg bg-[#fff3e0] px-2.5 py-1 text-[11px] font-semibold text-[#e65100]">
        Paid
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-lg bg-background px-2.5 py-1 text-[11px] font-semibold text-muted">
      Unpaid
    </span>
  );
}

function PlayerDetails({
  player,
  slug,
  isMe,
}: {
  player: Player;
  slug: string;
  isMe: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [details, setDetails] = useState(player.details || "");

  if (editing && isMe) {
    return (
      <form
        action={async (formData) => {
          await updatePlayerDetails(formData);
          setEditing(false);
        }}
        className="mt-1.5"
      >
        <input type="hidden" name="playerId" value={player.id} />
        <input type="hidden" name="slug" value={slug} />
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            name="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="e.g. Bank: CommBank BSB 062-000"
            className="w-full rounded-lg bg-background border-0 px-2.5 py-1.5 text-[12px] text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
            autoFocus
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-primary-dark transition-colors shrink-0"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setDetails(player.details || "");
              setEditing(false);
            }}
            className="rounded-lg bg-background px-2.5 py-1.5 text-[11px] font-medium text-muted hover:text-foreground transition-colors shrink-0"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  if (player.details) {
    return (
      <div className="mt-1 flex items-center gap-1">
        <p className="text-[12px] text-muted truncate">{player.details}</p>
        {isMe && (
          <button
            onClick={() => setEditing(true)}
            className="text-[11px] text-primary hover:text-primary-dark shrink-0"
          >
            Edit
          </button>
        )}
      </div>
    );
  }

  if (isMe) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="mt-1 text-[11px] text-primary hover:text-primary-dark"
      >
        + Add your details
      </button>
    );
  }

  return null;
}

export default function PlayerList({
  players,
  slug,
  currentPlayerName,
  captainName,
}: {
  players: Player[];
  slug: string;
  currentPlayerName: string | null;
  captainName: string;
}) {
  const isCaptain = currentPlayerName === captainName;

  return (
    <div className="bg-surface rounded-2xl divide-y divide-border">
      {players.map((player) => {
        const isMe = player.name === currentPlayerName;
        const isCaptainPlayer = player.is_captain === 1;

        return (
          <div
            key={player.id}
            className={`px-5 py-3.5 ${isMe ? "bg-primary/[0.03]" : ""}`}
          >
            <div className="flex items-center justify-between">
              {/* Left: name + role */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-[13px] font-bold text-primary">
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] font-medium text-foreground truncate">
                      {player.name}
                    </span>
                    {isCaptainPlayer && (
                      <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary shrink-0">
                        Captain
                      </span>
                    )}
                    {isMe && !isCaptainPlayer && (
                      <span className="text-[11px] text-muted shrink-0">
                        You
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: status + actions */}
              <div className="flex items-center gap-2 shrink-0">
                <PaymentBadge player={player} />

                {isMe && !isCaptainPlayer && !player.has_paid && (
                  <form action={markPaid}>
                    <input type="hidden" name="playerId" value={player.id} />
                    <input type="hidden" name="slug" value={slug} />
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-primary-dark transition-colors"
                    >
                      I Paid
                    </button>
                  </form>
                )}

                {isCaptain &&
                  !isCaptainPlayer &&
                  player.has_paid === 1 &&
                  !player.payment_confirmed && (
                    <form action={confirmPayment}>
                      <input
                        type="hidden"
                        name="playerId"
                        value={player.id}
                      />
                      <input type="hidden" name="slug" value={slug} />
                      <button
                        type="submit"
                        className="rounded-lg bg-[#2e7d32] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#1b5e20] transition-colors"
                      >
                        Confirm
                      </button>
                    </form>
                  )}

                {isMe && !isCaptainPlayer && (
                  <form action={leaveSession}>
                    <input type="hidden" name="playerId" value={player.id} />
                    <input type="hidden" name="slug" value={slug} />
                    <button
                      type="submit"
                      className="rounded-lg bg-background px-3 py-1.5 text-[12px] font-medium text-muted hover:text-red-500 transition-colors"
                    >
                      Leave
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Player details row */}
            <div className="ml-10">
              <PlayerDetails player={player} slug={slug} isMe={isMe} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
