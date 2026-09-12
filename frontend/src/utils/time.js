export function formatCountdown(ms) {
  if (ms <= 0) return "00 : 00 : 00";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(" : ");
}
export function formatDeadline(iso) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata"
  }).format(new Date(iso));
}
export function getLocalDateTimeParts() {
  const now = new Date();
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false
  }).format(now);
  return { date, time };
}
