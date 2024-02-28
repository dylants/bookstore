import { format } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

export function convertDateToFormInputString(
  date: string | Date,
  timezone: string,
): string {
  return format(zonedTimeToUtc(date, timezone), 'yyyy-MM-dd');
}
