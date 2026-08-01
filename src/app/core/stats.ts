import {
  DailyStat,
  DailyStatRow,
  RawDailyStatistic,
  Summary,
  Trend,
} from './models';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Prozor kliznog prosjeka, u broju presjeka. */
export const AVERAGE_WINDOW = 7;

/**
 * Baza mješa tipove: rani zapisi su brojevi, kasniji stringovi, a od trenutka
 * kada je ijzcg.me prestao objavljivati oporavljene i umrle stoji "Nepoznato".
 * Sve što nije broj postaje null, da se nigdje ne prikaže kao 0.
 */
export function toNumber(value: number | string | undefined | null): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
}

/** Parsira "08.09.2021." u lokalnu ponoć tog dana. */
export function parseDate(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }
  const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})\.?$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIso(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Sređuje sirove zapise u niz na koji se može računati:
 * odbacuje zapise bez upotrebljivog datuma, spaja duplikate istog dana
 * (baza ih ima — zadržava se posljednji upisani) i sortira hronološki,
 * jer redoslijed Firebase ključeva ne prati datume.
 */
export function normalize(
  entries: Array<{ key: string; value: RawDailyStatistic }>
): DailyStat[] {
  const byDay = new Map<string, DailyStat>();

  entries.forEach(({ key, value }) => {
    const date = parseDate(value && value.date);
    if (!date) {
      return;
    }
    const iso = toIso(date);
    byDay.set(iso, {
      key,
      date,
      dateLabel: (value.date || '').trim(),
      iso,
      activeCases: toNumber(value.activeCases),
      recovered: toNumber(value.recovered),
      deaths: toNumber(value.deaths),
    });
  });

  return Array.from(byDay.values()).sort((a, b) => a.iso.localeCompare(b.iso));
}

/** Klizni prosjek posljednjih `window` vrijednosti; null dok prozor nije pun. */
function movingAverage(values: Array<number | null>, window: number): Array<number | null> {
  return values.map((_, index) => {
    if (index < window - 1) {
      return null;
    }
    const slice = values
      .slice(index - window + 1, index + 1)
      .filter((value): value is number => value !== null);

    return slice.length === window
      ? slice.reduce((sum, value) => sum + value, 0) / window
      : null;
  });
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

/** Dodaje promjenu, razmak u danima i klizni prosjek svakom presjeku. */
export function withDerived(stats: DailyStat[]): DailyStatRow[] {
  const averages = movingAverage(
    stats.map((stat) => stat.activeCases),
    AVERAGE_WINDOW
  );

  // Posljednji viđeni kumulativni zbirovi, koji se prenose kroz presjeke u
  // kojima izvor te podatke nije objavio.
  let lastDeaths: number | null = null;
  let lastRecovered: number | null = null;

  return stats.map((stat, index) => {
    const previous = index > 0 ? stats[index - 1] : null;
    const hasChange =
      previous !== null && previous.activeCases !== null && stat.activeCases !== null;

    // Tekući maksimum, ne posljednja vrijednost: tvrdnja je „najmanje N”, a
    // izvor na par mjesta prijavi manji zbir nego ranije (npr. umrli 11 -> 10
    // u avgustu 2020). Jednom prijavljenih 11 ostaje donja granica.
    if (stat.deaths !== null) {
      lastDeaths = lastDeaths === null ? stat.deaths : Math.max(lastDeaths, stat.deaths);
    }
    if (stat.recovered !== null) {
      lastRecovered =
        lastRecovered === null ? stat.recovered : Math.max(lastRecovered, stat.recovered);
    }

    return {
      ...stat,
      change: hasChange ? stat.activeCases - previous.activeCases : null,
      daysSincePrevious: previous ? daysBetween(previous.date, stat.date) : null,
      average7: averages[index],
      deathsToDate: lastDeaths,
      recoveredToDate: lastRecovered,
      deathsCarried: stat.deaths === null && lastDeaths !== null,
      recoveredCarried: stat.recovered === null && lastRecovered !== null,
    };
  });
}

/** Posljednji presjek na dan `target` ili raniji. */
function rowAtOrBefore(rows: DailyStatRow[], target: Date): DailyStatRow | null {
  for (let index = rows.length - 1; index >= 0; index--) {
    if (rows[index].date.getTime() <= target.getTime()) {
      return rows[index];
    }
  }
  return null;
}

function lastWith(
  rows: DailyStatRow[],
  pick: (row: DailyStatRow) => number | null
): DailyStatRow | null {
  for (let index = rows.length - 1; index >= 0; index--) {
    if (pick(rows[index]) !== null) {
      return rows[index];
    }
  }
  return null;
}

function extremeBy(
  rows: DailyStatRow[],
  pick: (row: DailyStatRow) => number | null,
  better: (candidate: number, current: number) => boolean
): DailyStatRow | null {
  let best: DailyStatRow | null = null;
  let bestValue: number | null = null;

  rows.forEach((row) => {
    const value = pick(row);
    if (value === null) {
      return;
    }
    if (bestValue === null || better(value, bestValue)) {
      best = row;
      bestValue = value;
    }
  });

  return best;
}

/** Sve brojke koje naslovni dio i kartice prikazuju, izračunate jednom. */
export function summarize(rows: DailyStatRow[]): Summary {
  const empty: Summary = {
    latest: null,
    previous: null,
    first: null,
    changeFromPrevious: null,
    change7d: null,
    change7dPercent: null,
    average7: null,
    averageAll: null,
    peak: null,
    low: null,
    totalChange: null,
    percentOfPeak: null,
    biggestRise: null,
    biggestDrop: null,
    lastKnownRecovered: null,
    lastKnownDeaths: null,
    recordCount: 0,
    daysCovered: 0,
    daysSinceUpdate: 0,
  };

  if (!rows.length) {
    return empty;
  }

  const latest = rows[rows.length - 1];
  const previous = rows.length > 1 ? rows[rows.length - 2] : null;
  const first = rows[0];

  const weekAgoTarget = new Date(latest.date.getTime() - 7 * DAY_MS);
  const weekAgo = rowAtOrBefore(rows.slice(0, -1), weekAgoTarget);
  const canCompareWeek =
    weekAgo !== null && weekAgo.activeCases !== null && latest.activeCases !== null;

  const change7d = canCompareWeek ? latest.activeCases - weekAgo.activeCases : null;
  const change7dPercent =
    canCompareWeek && weekAgo.activeCases > 0
      ? (change7d / weekAgo.activeCases) * 100
      : null;

  const peak = extremeBy(rows, (row) => row.activeCases, (a, b) => a > b);
  const low = extremeBy(rows, (row) => row.activeCases, (a, b) => a < b);
  const percentOfPeak =
    peak && peak.activeCases && latest.activeCases !== null
      ? (latest.activeCases / peak.activeCases) * 100
      : null;

  const known = rows
    .map((row) => row.activeCases)
    .filter((value): value is number => value !== null);
  const averageAll = known.length
    ? known.reduce((sum, value) => sum + value, 0) / known.length
    : null;

  const totalChange =
    first.activeCases !== null && latest.activeCases !== null
      ? latest.activeCases - first.activeCases
      : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    latest,
    previous,
    first,
    changeFromPrevious: latest.change,
    change7d,
    change7dPercent,
    average7: latest.average7,
    averageAll,
    peak,
    low,
    totalChange,
    percentOfPeak,
    biggestRise: extremeBy(rows, (row) => row.change, (a, b) => a > b),
    biggestDrop: extremeBy(rows, (row) => row.change, (a, b) => a < b),
    lastKnownRecovered: lastWith(rows, (row) => row.recovered),
    lastKnownDeaths: lastWith(rows, (row) => row.deaths),
    recordCount: rows.length,
    daysCovered: daysBetween(first.date, latest.date) + 1,
    daysSinceUpdate: Math.max(0, daysBetween(latest.date, today)),
  };
}

/** Zadnjih `days` dana podataka, mjereno od posljednjeg presjeka. */
export function sliceByDays(rows: DailyStatRow[], days: number | null): DailyStatRow[] {
  if (days === null || !rows.length) {
    return rows;
  }
  const latest = rows[rows.length - 1].date;
  const cutoff = latest.getTime() - (days - 1) * DAY_MS;
  return rows.filter((row) => row.date.getTime() >= cutoff);
}

/** Mjeseci koji imaju podatke, najnoviji prvi: [{ id: "2021-09", label: "septembar 2021." }] */
const MONTH_NAMES = [
  'januar',
  'februar',
  'mart',
  'april',
  'maj',
  'jun',
  'jul',
  'avgust',
  'septembar',
  'oktobar',
  'novembar',
  'decembar',
];

export function availableMonths(
  rows: DailyStatRow[]
): Array<{ id: string; label: string }> {
  const seen = new Map<string, string>();

  rows.forEach((row) => {
    const id = row.iso.slice(0, 7);
    if (!seen.has(id)) {
      seen.set(id, `${MONTH_NAMES[row.date.getMonth()]} ${row.date.getFullYear()}.`);
    }
  });

  return Array.from(seen.entries())
    .map(([id, label]) => ({ id, label }))
    .reverse();
}

export function filterByMonth(rows: DailyStatRow[], monthId: string): DailyStatRow[] {
  return rows.filter((row) => row.iso.slice(0, 7) === monthId);
}

/* -------------------------------------------------------------------------
   Formatiranje
   ------------------------------------------------------------------------- */

export function trendOf(value: number | null | undefined): Trend {
  if (value === null || value === undefined || value === 0) {
    return 'flat';
  }
  return value > 0 ? 'up' : 'down';
}

/** Predznak se uvijek ispisuje — boja nikad nije jedini nosilac smjera. */
export function formatSigned(value: number | null, digits = 0): string {
  if (value === null || value === undefined) {
    return '—';
  }
  const rounded = Number(value.toFixed(digits));
  const sign = rounded > 0 ? '+' : rounded < 0 ? '−' : '±';
  return `${sign}${formatNumber(Math.abs(rounded), digits)}`;
}

export function formatNumber(value: number | null, digits = 0): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  return value.toLocaleString('sr-Latn-ME', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** "8. septembar 2021." */
export function formatLongDate(date: Date | null | undefined): string {
  if (!date) {
    return '—';
  }
  return `${date.getDate()}. ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}.`;
}

/** Padež uz broj dana: 1 dan, 2 dana, 5 dana. */
export function dayWord(count: number): string {
  return Math.abs(count) === 1 ? 'dan' : 'dana';
}
