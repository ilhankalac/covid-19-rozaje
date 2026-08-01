import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { DailyStatRow, RangeOption, Summary } from './core/models';
import {
  availableMonths,
  filterByMonth,
  normalize,
  sliceByDays,
  summarize,
  withDerived,
} from './core/stats';

/** Preseti opsega. Mjere se od posljednjeg presjeka, ne od danas — baza je arhiva. */
export const RANGE_OPTIONS: RangeOption[] = [
  { id: '30', label: '30 dana', days: 30 },
  { id: '90', label: '90 dana', days: 90 },
  { id: '365', label: 'Godina', days: 365 },
  { id: 'all', label: 'Sve', days: null },
];

export const DEFAULT_RANGE = 'all';

const REPLAY_ONE = { bufferSize: 1, refCount: false };

@Injectable({
  providedIn: 'root',
})
export class DataService {
  /**
   * Jedan zajednički tok podataka za cijelu aplikaciju. Ranije je svaka
   * komponenta otvarala svoju pretplatu na isti čvor u bazi; shareReplay znači
   * da se podaci povuku jednom i da svi prikazi gledaju identičan niz.
   */
  readonly rows$: Observable<DailyStatRow[]>;

  /** Ukupna slika — ne zavisi od izabranog perioda, hrani naslovni dio. */
  readonly overallSummary$: Observable<Summary>;

  readonly months$: Observable<Array<{ id: string; label: string }>>;

  /** Izabrani period. Filter traka je jedina koja ga mijenja. */
  readonly selection$: Observable<string>;

  /** Isječak koji vide sve kartice, grafikoni i tabela ispod filter trake. */
  readonly visibleRows$: Observable<DailyStatRow[]>;

  readonly summary$: Observable<Summary>;

  private readonly selection = new BehaviorSubject<string>(DEFAULT_RANGE);

  constructor(private firebase: AngularFireDatabase) {
    this.rows$ = this.firebase
      .list('dailyStatistics')
      .snapshotChanges()
      .pipe(
        map((snapshots) =>
          withDerived(
            normalize(
              snapshots.map((snapshot) => ({
                key: snapshot.key,
                value: snapshot.payload.val() as any,
              }))
            )
          )
        ),
        shareReplay(REPLAY_ONE)
      );

    this.overallSummary$ = this.rows$.pipe(map(summarize), shareReplay(REPLAY_ONE));
    this.months$ = this.rows$.pipe(map(availableMonths), shareReplay(REPLAY_ONE));
    this.selection$ = this.selection.asObservable();

    this.visibleRows$ = combineLatest([this.rows$, this.selection$]).pipe(
      map(([rows, selection]) => applySelection(rows, selection)),
      shareReplay(REPLAY_ONE)
    );

    this.summary$ = this.visibleRows$.pipe(map(summarize), shareReplay(REPLAY_ONE));
  }

  select(id: string): void {
    this.selection.next(id);
  }
}

/** Presetni id je broj dana; sve ostalo je id mjeseca oblika "2021-09". */
function applySelection(rows: DailyStatRow[], selection: string): DailyStatRow[] {
  const preset = RANGE_OPTIONS.find((option) => option.id === selection);
  if (preset) {
    return sliceByDays(rows, preset.days);
  }
  return filterByMonth(rows, selection);
}
