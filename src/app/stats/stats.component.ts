import { Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { DailyStatRow, Summary } from '../core/models';
import {
  AVERAGE_WINDOW,
  formatLongDate,
  formatNumber,
  formatSigned,
} from '../core/stats';
import { DataService } from '../data.service';

const SPARK_POINTS = 30;

interface StatsView {
  summary: Summary;
  spark: number[];
  hasRows: boolean;
}

/** Red kartica sa ključnim brojkama za trenutno izabrani period. */
@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css'],
})
export class StatsComponent {
  readonly view$ = combineLatest([
    this.dataService.summary$,
    this.dataService.visibleRows$,
  ]).pipe(map(([summary, rows]) => this.toView(summary, rows)));

  readonly averageWindow = AVERAGE_WINDOW;
  readonly formatNumber = formatNumber;
  readonly formatSigned = formatSigned;
  readonly formatLongDate = formatLongDate;

  constructor(private dataService: DataService) {}

  percentText(value: number | null): string {
    return value === null ? '' : `${formatSigned(value, 1)} %`;
  }

  private toView(summary: Summary, rows: DailyStatRow[]): StatsView {
    return {
      summary,
      hasRows: rows.length > 0,
      spark: rows
        .slice(-SPARK_POINTS)
        .map((row) => row.activeCases)
        .filter((value): value is number => value !== null),
    };
  }
}
