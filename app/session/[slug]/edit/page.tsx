import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import db, { type Session } from "@/lib/db";
import { updateSession } from "@/app/actions/session";
import Link from "next/link";

export default async function EditSessionPage({
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

  // Only captain can edit
  const cookieStore = await cookies();
  const currentPlayerName = cookieStore.get(`player_${slug}`)?.value ?? null;
  if (currentPlayerName !== session.captain_name) {
    redirect(`/session/${slug}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-bold text-foreground">Edit Match</h1>
        <Link
          href={`/session/${slug}`}
          className="text-[14px] text-primary font-medium"
        >
          Cancel
        </Link>
      </div>

      <form action={updateSession}>
        <input type="hidden" name="sessionId" value={session.id} />
        <input type="hidden" name="slug" value={slug} />

        <div className="bg-surface rounded-2xl p-5 space-y-4">
          <div>
            <label htmlFor="courtName" className="block text-[13px] font-medium text-muted mb-1.5">
              Court / Venue Name
            </label>
            <input
              type="text"
              id="courtName"
              name="courtName"
              required
              defaultValue={session.court_name}
              className="w-full rounded-xl bg-background border-0 px-4 py-3 text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="gameDate" className="block text-[13px] font-medium text-muted mb-1.5">
                Date
              </label>
              <input
                type="date"
                id="gameDate"
                name="gameDate"
                required
                defaultValue={session.game_date}
                className="w-full rounded-xl bg-background border-0 px-4 py-3 text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label htmlFor="gameTime" className="block text-[13px] font-medium text-muted mb-1.5">
                Time
              </label>
              <input
                type="time"
                id="gameTime"
                name="gameTime"
                required
                defaultValue={session.game_time}
                className="w-full rounded-xl bg-background border-0 px-4 py-3 text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label htmlFor="totalPrice" className="block text-[13px] font-medium text-muted mb-1.5">
              Total Court Price (AUD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-[15px]">$</span>
              <input
                type="number"
                id="totalPrice"
                name="totalPrice"
                required
                min="0"
                step="0.01"
                defaultValue={session.total_price}
                className="w-full rounded-xl bg-background border-0 pl-9 pr-4 py-3 text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 space-y-4 mt-3">
          <p className="text-[13px] font-medium text-muted">Payment Details</p>

          <div>
            <label htmlFor="payId" className="block text-[13px] font-medium text-muted mb-1.5">
              PayID
            </label>
            <input
              type="text"
              id="payId"
              name="payId"
              defaultValue={session.pay_id ?? ""}
              placeholder="e.g. 0412345678 or email@example.com"
              className="w-full rounded-xl bg-background border-0 px-4 py-3 text-[15px] text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bsb" className="block text-[13px] font-medium text-muted mb-1.5">
                BSB
              </label>
              <input
                type="text"
                id="bsb"
                name="bsb"
                defaultValue={session.bsb ?? ""}
                placeholder="e.g. 062-000"
                className="w-full rounded-xl bg-background border-0 px-4 py-3 text-[15px] text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label htmlFor="acc" className="block text-[13px] font-medium text-muted mb-1.5">
                Account Number
              </label>
              <input
                type="text"
                id="acc"
                name="acc"
                defaultValue={session.acc ?? ""}
                placeholder="e.g. 1234 5678"
                className="w-full rounded-xl bg-background border-0 px-4 py-3 text-[15px] text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 space-y-4 mt-3">
          <p className="text-[13px] font-medium text-muted">Optional Details</p>

          <div>
            <label htmlFor="receipt" className="block text-[13px] font-medium text-muted mb-1.5">
              Update Receipt
            </label>
            {session.receipt_path && (
              <p className="text-[12px] text-muted mb-1">Current receipt uploaded. Upload a new one to replace it.</p>
            )}
            <input
              type="file"
              id="receipt"
              name="receipt"
              accept="image/*"
              className="w-full rounded-xl bg-background border-0 px-4 py-2.5 text-[14px] text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-[13px] file:font-medium file:text-primary hover:file:bg-primary/20 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-[13px] font-medium text-muted mb-1.5">
              Location / Map Link
            </label>
            <input
              type="text"
              id="location"
              name="location"
              defaultValue={session.location ?? ""}
              placeholder="e.g. Google Maps link or address"
              className="w-full rounded-xl bg-background border-0 px-4 py-3 text-[15px] text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-[13px] font-medium text-muted mb-1.5">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={session.notes ?? ""}
              placeholder="e.g. Bring shin guards, parking info..."
              className="w-full rounded-xl bg-background border-0 px-4 py-3 text-[15px] text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-primary px-4 py-4 text-[16px] font-semibold text-white hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 mt-4"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
