import { formatDistanceToNow, parseISO, format } from 'date-fns';

export function parseTwitterDate(dateString: string): Date {
  // Parse Twitter's date format: "Sun Jul 20 18:05:44 +0000 2025"
  return new Date(dateString);
}

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatExactTime(date: Date): string {
  return format(date, 'PPp');
}

export function formatFilename(id: string, date: Date = new Date()): string {
  const timestamp = format(date, 'yyyyMMdd-HHmm');
  return `tweelyzer-${id}-${timestamp}`;
}