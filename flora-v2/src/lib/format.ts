/**
 * Canonical date and time formatting for Flora CRM.
 *
 * Source of truth for every dashboard date display:
 * - formatFullDate: hero greeting date (weekday, day, month, year)
 * - formatDate: absolute day + short month + year (tables, activity rows)
 * - formatTime: 12-hour clock time
 * - formatRowDate: list-row date that folds same-day values into clock time
 *
 * Rules:
 * - Locale is always en-AE — ARCHITECTURE forbids page-local date helpers,
 *   so every page must import from this module instead of re-declaring one.
 * - Rows stay absolute: no relative English copy in this module.
 * - Money display lives in src/lib/finance.ts and never here.
 */

export function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-AE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export function formatTime(value: Date): string {
  return new Intl.DateTimeFormat("en-AE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function formatFullDate(value: Date): string {
  return new Intl.DateTimeFormat("en-AE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

export function formatRowDate(value: Date, now: Date = new Date()): string {
  const sameDay =
    value.getFullYear() === now.getFullYear() &&
    value.getMonth() === now.getMonth() &&
    value.getDate() === now.getDate();

  if (sameDay) {
    return formatTime(value);
  }

  if (value.getFullYear() === now.getFullYear()) {
    return new Intl.DateTimeFormat("en-AE", {
      day: "2-digit",
      month: "short",
    }).format(value);
  }

  return formatDate(value);
}
