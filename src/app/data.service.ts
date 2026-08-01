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

/** Range presets. Measured from the last snapshot, not today — the database is an archive. */
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
   * One shared data stream for the whole application. Each component used to
   * open its own subscription to the same database node; shareReplay means the
   * data is fetched once and every view looks at an identical series.
   */
  readonly rows$: Observable<DailyStatRow[]>;

  /** The overall picture — independent of the selected period, feeds the hero section. */
  readonly overallSummary$: Observable<Summary>;

  readonly months$: Observable<Array<{ id: string; label: string }>>;

  /** The selected period. The filter bar is the only thing that changes it. */
  readonly selection$: Observable<string>;

  /** The slice seen by every card, chart and table below the filter bar. */
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

/** A preset id is a day count; anything else is a month id shaped like "2021-09". */
function applySelection(rows: DailyStatRow[], selection: string): DailyStatRow[] {
  const preset = RANGE_OPTIONS.find((option) => option.id === selection);
  if (preset) {
    return sliceByDays(rows, preset.days);
  }
  return filterByMonth(rows, selection);
}
