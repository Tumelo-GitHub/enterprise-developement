import * as moment from 'moment';

/** Period presets shared by the My Timesheet and Company Report tabs. Weeks start on Monday. */
export type Period = 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom';

export const PERIODS: { key: Period, label: string }[] = [
  { key: 'this_week', label: 'This week' },
  { key: 'last_week', label: 'Last week' },
  { key: 'this_month', label: 'This month' },
  { key: 'last_month', label: 'Last month' },
  { key: 'custom', label: 'Custom' },
];

/** Start/end ('YYYY-MM-DD') for a preset period. */
export function periodRange(period: Exclude<Period, 'custom'>): { start: string, end: string } {
  const now = moment();
  const ranges: Record<Exclude<Period, 'custom'>, [moment.Moment, moment.Moment]> = {
    this_week: [now.clone().startOf('isoWeek'), now.clone().endOf('isoWeek')],
    last_week: [now.clone().subtract(1, 'week').startOf('isoWeek'), now.clone().subtract(1, 'week').endOf('isoWeek')],
    this_month: [now.clone().startOf('month'), now.clone().endOf('month')],
    last_month: [now.clone().subtract(1, 'month').startOf('month'), now.clone().subtract(1, 'month').endOf('month')],
  };
  const [start, end] = ranges[period];
  return { start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') };
}

/** Human label for a range, e.g. "1 – 30 Nov 2026" or "28 Oct – 3 Nov 2026". */
export function formatRange(startDate: string | null, endDate: string | null): string {
  if (!startDate || !endDate) return '';
  const start = moment(startDate);
  const end = moment(endDate);
  if (start.isSame(end, 'day')) return end.format('D MMM YYYY');
  if (start.isSame(end, 'year')) {
    return start.isSame(end, 'month')
      ? `${start.format('D')} – ${end.format('D MMM YYYY')}`
      : `${start.format('D MMM')} – ${end.format('D MMM YYYY')}`;
  }
  return `${start.format('D MMM YYYY')} – ${end.format('D MMM YYYY')}`;
}

export function toIsoDate(value: Date | string): string {
  return moment(value).format('YYYY-MM-DD');
}
