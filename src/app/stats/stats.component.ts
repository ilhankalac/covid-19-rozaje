import { Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { DailyStatRow, Summary } from '../core/models';
import { formatLongDate, formatNumber, formatSigned } from '../core/stats';
import { DataService } from '../data.service';

const SPARK_POINTS = 30;

interface StatsView {
  summary: Summary;
  spark: number[];
  hasRows: boolean;
}

/** Kartice za isječak koji je izabran u filter traci iznad. */
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

  readonly formatNumber = formatNumber;
  readonly formatSigned = formatSigned;
  readonly formatLongDate = formatLongDate;

  constructor(private dataService: DataService) {}

  /** "142 → 330" — pokazuje odakle dokle je period išao. */
  periodEndpoints(summary: Summary): string {
    if (!summary.first || !summary.latest) {
      return '';
    }
    return `${formatNumber(summary.first.activeCases)} → ${formatNumber(
      summary.latest.activeCases
    )}`;
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
