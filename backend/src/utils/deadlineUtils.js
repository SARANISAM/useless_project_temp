import { DateTime } from "luxon";
import { env } from "../config/env.js";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export const PANIC_STATES = Object.freeze({
  CHILL: "CHILL",
  MAYBE_START: "MAYBE_START",
  OKAY_SERIOUS: "OKAY_SERIOUS",
  PANIC_MODE: "PANIC_MODE",
  DEADLINE_DEAD: "DEADLINE_DEAD",
  COMPLETED: "COMPLETED"
});

export function buildDeadlineTimestamp(deadlineDate, deadlineTime) {
  if (typeof deadlineDate !== "string" || typeof deadlineTime !== "string") return null;
  const dt = DateTime.fromISO(`${deadlineDate}T${deadlineTime}`, { zone: env.APP_TIMEZONE });
  return dt.isValid ? dt.toUTC() : null;
}

export function calculateDeadlineState(deadlineTimestamp, { completed = false } = {}) {
  const nowMs = Date.now();
  const deadlineMs = new Date(deadlineTimestamp).getTime();
  if (Number.isNaN(deadlineMs)) throw new Error("Invalid deadline_timestamp");

  const remainingMs = deadlineMs - nowMs;
  const overdue = remainingMs <= 0;
  let panicState;

  if (completed) panicState = PANIC_STATES.COMPLETED;
  else if (overdue) panicState = PANIC_STATES.DEADLINE_DEAD;
  else if (remainingMs <= HOUR) panicState = PANIC_STATES.PANIC_MODE;
  else if (remainingMs <= 6 * HOUR) panicState = PANIC_STATES.OKAY_SERIOUS;
  else if (remainingMs <= DAY) panicState = PANIC_STATES.MAYBE_START;
  else panicState = PANIC_STATES.CHILL;

  return {
    now: new Date(nowMs).toISOString(),
    timeRemainingMs: Math.max(0, remainingMs),
    timeRemainingSeconds: Math.max(0, Math.floor(remainingMs / 1000)),
    timeRemainingMinutes: Math.max(0, Math.floor(remainingMs / 60000)),
    isOverdue: overdue && !completed,
    panicState,
    deadlineTimestamp: new Date(deadlineMs).toISOString()
  };
}

export function formatRemaining(ms) {
  if (ms <= 0) return "00 : 00 : 00";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(" : ");
}

export function stageForPanicState(panicState) {
  return {
    CHILL: "LOTS_OF_TIME",
    MAYBE_START: "SIX_TO_TWENTY_FOUR_HOURS",
    OKAY_SERIOUS: "ONE_TO_SIX_HOURS",
    PANIC_MODE: "LAST_HOUR",
    DEADLINE_DEAD: "DEADLINE_PASSED",
    COMPLETED: "COMPLETED"
  }[panicState] || "LOTS_OF_TIME";
}
