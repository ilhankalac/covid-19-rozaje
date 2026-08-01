/** Jedan presjek stanja, onako kako stoji u Firebase bazi. */
export interface RawDailyStatistic {
  activeCases?: number | string;
  recovered?: number | string;
  deaths?: number | string;
  date?: string;
}

/** Normalizovan presjek — datum je pravi Date, brojevi su brojevi ili null. */
export interface DailyStat {
  key: string;
  /** Ponoć lokalnog dana na koji se presjek odnosi. */
  date: Date;
  /** Original iz baze, npr. "08.09.2021." */
  dateLabel: string;
  /** Sortabilni ključ, npr. "2021-09-08". */
  iso: string;
  activeCases: number | null;
  recovered: number | null;
  deaths: number | null;
}

/** Presjek obogaćen izvedenim vrijednostima koje se računaju nad cijelim nizom. */
export interface DailyStatRow extends DailyStat {
  /** Promjena aktivnih u odnosu na prethodni presjek. */
  change: number | null;
  /** Broj dana između ovog i prethodnog presjeka (baza ima rupe). */
  daysSincePrevious: number | null;
  /** Klizni prosjek aktivnih kroz 7 presjeka. */
  average7: number | null;

  /**
   * Umrli i oporavljeni su kumulativni zbirovi, pa ne mogu pasti. Kad izvor
   * prestane da ih objavljuje, posljednji poznati zbir i dalje važi kao donja
   * granica — zato se prenosi naprijed umjesto da se prikaže kao nepoznat.
   */
  deathsToDate: number | null;
  recoveredToDate: number | null;
  /** true kad vrijednost nije objavljena za taj dan nego prenesena iz ranijeg. */
  deathsCarried: boolean;
  recoveredCarried: boolean;
}

export type Trend = 'up' | 'down' | 'flat';

/** Sve što naslovni dio i kartice prikazuju, izračunato jednom. */
export interface Summary {
  latest: DailyStatRow | null;
  previous: DailyStatRow | null;
  first: DailyStatRow | null;

  /** Promjena aktivnih u odnosu na prethodni presjek. */
  changeFromPrevious: number | null;
  /** Promjena aktivnih u odnosu na presjek od prije ~7 dana. */
  change7d: number | null;
  change7dPercent: number | null;

  average7: number | null;
  /** Prosjek aktivnih kroz sve presjeke u opsegu. */
  averageAll: number | null;

  peak: DailyStatRow | null;
  /** Najniže zabilježeno stanje u opsegu. */
  low: DailyStatRow | null;
  /** Stanje na kraju opsega u odnosu na stanje na početku. */
  totalChange: number | null;
  /** Stanje na kraju opsega kao procenat vrhunca. */
  percentOfPeak: number | null;

  /** Najveći zabilježeni skok i pad između dva uzastopna presjeka. */
  biggestRise: DailyStatRow | null;
  biggestDrop: DailyStatRow | null;

  /** Posljednji presjek u kojem su oporavljeni/umrli još objavljivani. */
  lastKnownRecovered: DailyStatRow | null;
  lastKnownDeaths: DailyStatRow | null;

  recordCount: number;
  daysCovered: number;
  /** Dana od posljednjeg presjeka do danas — arhiva ili živi podaci. */
  daysSinceUpdate: number;
}

/** Opseg koji filter traka postavlja nad svim prikazima ispod nje. */
export interface RangeOption {
  id: string;
  label: string;
  /** Broj dana unazad od posljednjeg presjeka; null znači cijeli period. */
  days: number | null;
}
