import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function formatDate(dateStr: string): string {
  return dayjs(dateStr).fromNow();
}
