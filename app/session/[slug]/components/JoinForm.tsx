"use client";

import { useActionState } from "react";
import { joinSession } from "@/app/actions/player";

export default function JoinForm({
  sessionId,
  slug,
}: {
  sessionId: number;
  slug: string;
}) {
  const [state, formAction, isPending] = useActionState(joinSession, {});

  if (state?.success) {
    return (
      <div className="bg-primary/5 rounded-2xl p-4 text-center">
        <p className="text-[14px] text-primary font-medium">
          Joined as {state.playerName}!
        </p>
        <p className="text-[12px] text-muted mt-1">
          Refresh the page to see updates.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <form action={formAction} className="flex gap-2">
        <input type="hidden" name="sessionId" value={sessionId} />
        <input type="hidden" name="slug" value={slug} />
        <input
          type="text"
          name="name"
          required
          placeholder="Your name"
          className="flex-1 rounded-xl bg-background border-0 px-4 py-3 text-[15px] text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-primary px-5 py-3 text-[15px] font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50 focus:outline-none"
        >
          {isPending ? "..." : "Join"}
        </button>
      </form>
      {state?.error && (
        <p className="text-[12px] text-red-500 mt-1.5 px-1">{state.error}</p>
      )}
    </div>
  );
}
