import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);

export function generateSlug(): string {
  return nanoid();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function calculatePerPerson(
  totalPrice: number,
  playerCount: number
): number {
  if (playerCount === 0) return 0;
  return totalPrice / playerCount;
}
