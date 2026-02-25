import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function timeAgo(dateStr: string): string {
  return dayjs(dateStr).fromNow();
}

export function formatDate(dateStr: string, format = 'MMM D, YYYY'): string {
  return dayjs(dateStr).format(format);
}

export function formatCount(n: number): string {
  if (n === 0) return '';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}
