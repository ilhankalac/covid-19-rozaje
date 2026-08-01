import { Component } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { formatLongDate, formatNumber } from '../core/stats';
import { DataService, RANGE_OPTIONS } from '../data.service';

/**
 * Jedan red filtera iznad svega što filtrira. Kartice, grafikoni i tabela
 * gledaju isti isječak, pa se brojke nikad ne razilaze.
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

  /** Opseg izabranog isječka — čitaocu govori šta tačno gleda. */
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

  /** Vrijednost mjesečnog izbornika je prazna dok je aktivan neki preset. */
  monthValue(selection: string): string {
    return this.ranges.some((range) => range.id === selection) ? '' : selection;
  }
}
