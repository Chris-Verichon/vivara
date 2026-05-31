import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- Date helpers ---

/**
 * Format a date string (YYYY-MM-DD) to a human-readable string.
 * e.g. "2024-06-15" → "June 15, 2024"
 */
export function formatMemoryDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00")
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Extract the year from a date string (YYYY-MM-DD).
 */
export function getYear(dateString: string): number {
  return parseInt(dateString.slice(0, 4), 10)
}

// --- Country helpers ---

const regionNames = new Intl.DisplayNames(["fr"], { type: "region" })

/**
 * Convert an ISO 3166-1 alpha-2 country code to its English name.
 * e.g. "FR" → "France"
 */
export function countryCodeToName(code: string): string {
  try {
    return regionNames.of(code.toUpperCase()) ?? code
  } catch {
    return code
  }
}

// --- String helpers ---

/**
 * Truncate a string to a maximum length, appending "…" if truncated.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + "…"
}
