/** A single snapshot, exactly as it is stored in the Firebase database. */
export interface RawDailyStatistic {
  activeCases?: number | string;
  recovered?: number | string;
  deaths?: number | string;
  date?: string;
}

/** Normalized snapshot — the date is a real Date, numbers are numbers or null. */
export interface DailyStat {
  key: string;
  /** Local midnight of the day the snapshot refers to. */
  date: Date;
  /** The original from the database, e.g. "08.09.2021." */
  dateLabel: string;
  /** Sortable key, e.g. "2021-09-08". */
  iso: string;
  activeCases: number | null;
  recovered: number | null;
  deaths: number | null;
}

/** A snapshot enriched with values derived across the whole series. */
export interface DailyStatRow extends DailyStat {
  /** Change in active cases against the previous snapshot. */
  change: number | null;
  /** Days between this and the previous snapshot (the database has gaps). */
  daysSincePrevious: number | null;
  /** Rolling average of active cases across 7 snapshots. */
  average7: number | null;

  /**
   * Deaths and recoveries are cumulative totals, so they cannot fall. Once the
   * source stops publishing them, the last known total still holds as a lower
   * bound — which is why it is carried forward instead of shown as unknown.
   */
  deathsToDate: number | null;
  recoveredToDate: number | null;
  /** True when the value was not published that day but carried from an earlier one. */
  deathsCarried: boolean;
  recoveredCarried: boolean;
}

export type Trend = 'up' | 'down' | 'flat';

/** Everything the hero section and the cards display, computed once. */
export interface Summary {
  latest: DailyStatRow | null;
  previous: DailyStatRow | null;
  first: DailyStatRow | null;

  /** Change in active cases against the previous snapshot. */
  changeFromPrevious: number | null;
  /** Change in active cases against the snapshot from roughly 7 days earlier. */
  change7d: number | null;
  change7dPercent: number | null;

  average7: number | null;
  /** Average of active cases across every snapshot in the range. */
  averageAll: number | null;

  peak: DailyStatRow | null;
  /** Lowest level recorded within the range. */
  low: DailyStatRow | null;
  /** Level at the end of the range against the level at its start. */
  totalChange: number | null;
  /** Level at the end of the range as a percentage of the peak. */
  percentOfPeak: number | null;

  /** Largest recorded rise and fall between two consecutive snapshots. */
  biggestRise: DailyStatRow | null;
  biggestDrop: DailyStatRow | null;

  /** Last snapshot in which recoveries/deaths were still being published. */
  lastKnownRecovered: DailyStatRow | null;
  lastKnownDeaths: DailyStatRow | null;

  recordCount: number;
  daysCovered: number;
  /** Days from the last snapshot until today — archive or live data. */
  daysSinceUpdate: number;
}

/** The range the filter bar imposes on every view below it. */
export interface RangeOption {
  id: string;
  label: string;
  /** Days back from the last snapshot; null means the whole period. */
  days: number | null;
}
