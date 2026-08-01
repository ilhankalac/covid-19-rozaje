import { Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { formatLongDate, formatNumber } from '../core/stats';
import { DataService, RANGE_OPTIONS } from '../data.service';

/**
 * One row of filters above everything it filters. Cards, charts and table all
 * look at the same slice, so the figures never drift apart.
 */
@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.css'],
})
export class FilterBarComponent {
  readonly ranges = RANGE_OPTIONS;
  readonly months$ = this.dataService.months$;
  readonly selection$ = this.dataService.selection$;

  /** The span of the selected slice — tells the reader exactly what they are looking at. */
  readonly scope$ = combineLatest([
    this.dataService.visibleRows$,
    this.dataService.selection$,
  ]).pipe(
    map(([rows, selection]) => ({
      count: rows.length,
      from: rows.length ? rows[0].date : null,
      to: rows.length ? rows[rows.length - 1].date : null,
      isPreset: this.ranges.some((range) => range.id === selection),
    }))
  );

  readonly formatLongDate = formatLongDate;
  readonly formatNumber = formatNumber;

  constructor(private dataService: DataService) {}

  select(id: string): void {
    this.dataService.select(id);
  }

  onMonthChange(id: string): void {
    if (id) {
      this.select(id);
    }
  }

  /** The month picker's value is empty while a preset is active. */
  monthValue(selection: string): string {
    return this.ranges.some((range) => range.id === selection) ? '' : selection;
  }
}
