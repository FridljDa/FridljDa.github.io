/**
 * Date formatting utilities for consistent date display across the website
 */

/**
 * Formats a date to short format: "Jan 2024"
 * @param date - Date object or date string
 * @returns Formatted date string
 */
export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Formats a date to long format: "January 15, 2024"
 * @param date - Date object or date string
 * @returns Formatted date string
 */
export function formatDateLong(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats a date with day in short format: "Jan 15, 2024"
 * @param date - Date object or date string
 * @returns Formatted date string
 */
export function formatDateWithDay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

