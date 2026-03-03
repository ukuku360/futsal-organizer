import { type Session } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export default function SessionHeader({
  session,
  playerCount,
}: {
  session: Session;
  playerCount: number;
}) {
  const perPerson =
    playerCount > 0 ? session.total_price / playerCount : session.total_price;

  const isMapLink =
    session.location?.startsWith("http") ||
    session.location?.includes("maps");

  return (
    <div className="space-y-3">
      {/* Court & Date */}
      <div className="bg-surface rounded-2xl p-5">
        <h1 className="text-[20px] font-bold text-foreground">{session.court_name}</h1>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[13px] text-muted">
          <span>
            {new Date(session.game_date + "T00:00:00").toLocaleDateString(
              "en-AU",
              { weekday: "short", day: "numeric", month: "short", year: "numeric" }
            )}
          </span>
          <span>{session.game_time}</span>
          <span>Captain: {session.captain_name}</span>
        </div>

        {/* Location */}
        {session.location && (
          <div className="flex items-start gap-2 text-[13px] mt-3 pt-3 border-t border-border">
            <span className="text-muted mt-px">&#128205;</span>
            {isMapLink ? (
              <a
                href={session.location}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium"
              >
                View on Map
              </a>
            ) : (
              <span className="text-foreground/70">{session.location}</span>
            )}
          </div>
        )}

        {/* Notes */}
        {session.notes && (
          <div className="flex items-start gap-2 text-[13px] mt-2">
            <span className="text-muted mt-px">&#128221;</span>
            <span className="text-foreground/70">{session.notes}</span>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="bg-surface rounded-2xl p-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[12px] text-muted mb-1">Total</p>
            <p className="text-[18px] font-bold text-foreground">{formatCurrency(session.total_price)}</p>
          </div>
          <div>
            <p className="text-[12px] text-muted mb-1">Players</p>
            <p className="text-[18px] font-bold text-foreground">{playerCount}</p>
          </div>
          <div>
            <p className="text-[12px] text-muted mb-1">Per Person</p>
            <p className="text-[18px] font-bold text-primary">
              {formatCurrency(perPerson)}
            </p>
          </div>
        </div>
      </div>

      {/* Captain Payment Details */}
      {(session.pay_id || session.bsb || session.acc) && (
        <div className="bg-surface rounded-2xl p-5">
          <p className="text-[13px] font-medium text-muted mb-3">
            Pay {session.captain_name}
          </p>
          <div className="space-y-2.5">
            {session.pay_id && (
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-muted">PayID</span>
                <span className="text-[14px] font-medium text-foreground">
                  {session.pay_id}
                </span>
              </div>
            )}
            {session.bsb && (
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-muted">BSB</span>
                <span className="text-[14px] font-medium text-foreground">
                  {session.bsb}
                </span>
              </div>
            )}
            {session.acc && (
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-muted">ACC</span>
                <span className="text-[14px] font-medium text-foreground">
                  {session.acc}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Receipt */}
      {session.receipt_path && (
        <div className="bg-surface rounded-2xl p-5">
          <p className="text-[13px] font-medium text-muted mb-3">Booking Receipt</p>
          <img
            src={`/uploads/${session.receipt_path}`}
            alt="Payment receipt"
            className="rounded-xl max-w-full max-h-64 object-contain"
          />
        </div>
      )}
    </div>
  );
}
