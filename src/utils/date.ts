/**
 * Date formatting utilities for consistent date display across the website
 */

import { format } from 'date-fns';

/**
 * Formats a date to short format: "Jan 2024"
 * @param date - Date object or date string
 * @returns Formatted date string
 */
export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM yyyy');
}

/**
 * Formats a date to long format: "January 15, 2024"
 * @param date - Date object or date string
 * @returns Formatted date string
 */
export function formatDateLong(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMMM d, yyyy');
}

/**
 * Formats a date with day in short format: "Jan 15, 2024"
 * @param date - Date object or date string
 * @returns Formatted date string
 */
export function formatDateWithDay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM d, yyyy');
}

