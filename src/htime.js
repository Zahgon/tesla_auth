const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Wraps a duration in seconds to display it as e.g. `1 day 23 hours 59 minutes`.
 */
export class Duration {
  #secs;

  constructor(secs) {
    this.#secs = secs;
  }

  /** Mirrors `impl From<time::Duration> for Duration`. */
  static fromSecs(secs) {
    return new Duration(Math.max(0, Math.trunc(secs)));
  }

  /** Mirrors `time::Duration::as_secs`. */
  get secs() {
    return this.#secs;
  }

  toString() {
    let remaining = this.#secs;

    if (remaining < MINUTE) {
      return "less than a minute";
    }

    let separator = "";
    let out = "";

    for (const [secs, unit] of [
      [DAY, "day"],
      [HOUR, "hour"],
      [MINUTE, "minute"],
    ]) {
      const units = Math.floor(remaining / secs);
      remaining %= secs;

      if (units === 0) {
        continue;
      }

      const plural = units === 1 ? "" : "s";

      out += `${separator}${units} ${unit}${plural}`;
      separator = " ";
    }

    return out;
  }
}

export function htimeFromSecs(secs) {
  return Duration.fromSecs(secs);
}

export const UNITS = { MINUTE, HOUR, DAY };
