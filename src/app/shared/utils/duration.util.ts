import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Helpers for timesheet durations.
 * Stored format (DB / API): "HH:MM:SS". Display format: "1h 30m".
 */
export class DurationUtil {
  static readonly MAX_SECONDS = 24 * 3600;

  /**
   * Parses what a user types into seconds. Accepts:
   *  "1.5" / "1,5"  -> decimal hours
   *  "2"            -> hours
   *  "1:30", "01:30:00"
   *  "1h30", "1h 30m", "45m", "2h"
   * Returns null for empty or unrecognised input.
   */
  static parse(input: string | null | undefined): number | null {
    const value = (input ?? '').toString().trim().toLowerCase().replace(',', '.');
    if (!value) return null;

    // Decimal / whole hours
    if (/^\d+(\.\d+)?$/.test(value)) {
      return Math.round(parseFloat(value) * 3600);
    }

    // h:mm or h:mm:ss
    const clock = value.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
    if (clock) {
      const [, h, m, s] = clock;
      if (+m > 59 || (s && +s > 59)) return null;
      return +h * 3600 + +m * 60 + (s ? +s : 0);
    }

    // 1h30, 1h 30m, 45m, 2h, 1.5h
    const units = value.match(/^(?:(\d+(?:\.\d+)?)\s*h(?:rs?|ours?)?)?\s*(?:(\d+)\s*m(?:in(?:s|utes?)?)?)?$/);
    if (units && (units[1] || units[2])) {
      const hours = units[1] ? parseFloat(units[1]) : 0;
      const minutes = units[2] ? parseInt(units[2], 10) : 0;
      return Math.round(hours * 3600) + minutes * 60;
    }

    return null;
  }

  /** "HH:MM:SS" for the API. */
  static toHms(totalSeconds: number): string {
    const s = Math.max(0, Math.round(totalSeconds));
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  }

  /** "1h 30m", "45m", "2h". Seconds are dropped. */
  static toLabel(totalSeconds: number): string {
    const s = Math.max(0, Math.round(totalSeconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (!h && !m) return '0m';
    if (!h) return `${m}m`;
    return m ? `${h}h ${m.toString().padStart(2, '0')}m` : `${h}h`;
  }

  /** Short editable form of a stored duration: "01:30:00" -> "1:30". */
  static toInput(stored: string | null | undefined): string {
    const seconds = DurationUtil.parse(stored);
    if (!seconds) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  }

  /** Form validator: required, parseable, > 0 and <= 24h. */
  static validator(control: AbstractControl): ValidationErrors | null {
    const raw = control.value;
    if (raw === null || raw === undefined || `${raw}`.trim() === '') return { required: true };
    const seconds = DurationUtil.parse(raw);
    if (seconds === null) return { durationFormat: true };
    if (seconds <= 0) return { durationZero: true };
    if (seconds > DurationUtil.MAX_SECONDS) return { durationMax: true };
    return null;
  }
}
