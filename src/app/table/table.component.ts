import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';

import { DailyStatRow, Trend } from '../core/models';
import {
  AVERAGE_WINDOW,
  formatLongDate,
  formatNumber,
  formatSigned,
  trendOf,
} from '../core/stats';
import { DataService } from '../data.service';

/**
 * The table of every snapshot. It doubles as the accessible alternative to the
 * charts — every value on a chart can be read here without hovering.
 */
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) matSort: MatSort;

  readonly displayedColumns = [
    'date',
    'activeCases',
    'change',
    'average7',
    'recovered',
    'deaths',
  ];

  readonly listData = new MatTableDataSource<DailyStatRow>([]);
  readonly averageWindow = AVERAGE_WINDOW;

  searchKey = '';
  isLoading = true;

  readonly formatNumber = formatNumber;
  readonly formatSigned = formatSigned;
  readonly formatLongDate = formatLongDate;

  private readonly subscriptions = new Subscription();

  constructor(private dataService: DataService) {}

  ngAfterViewInit(): void {
    this.listData.paginator = this.paginator;
    this.listData.sort = this.matSort;

    // Sorting by date has to go through the ISO key; the string "08.09.2021."
    // compares wrongly lexicographically.
    this.listData.sortingDataAccessor = (row, column) => {
      switch (column) {
        case 'date':
          return row.iso;
        case 'change':
          return row.change === null ? Number.NEGATIVE_INFINITY : row.change;
        case 'average7':
          return row.average7 === null ? Number.NEGATIVE_INFINITY : row.average7;
        // Sorted by the carried total, so rows without a published value do
        // not sink to the bottom as if they were zero.
        case 'recovered':
          return row.recoveredToDate === null
            ? Number.NEGATIVE_INFINITY
            : row.recoveredToDate;
        case 'deaths':
          return row.deathsToDate === null
            ? Number.NEGATIVE_INFINITY
            : row.deathsToDate;
        default:
          return row.activeCases === null
            ? Number.NEGATIVE_INFINITY
            : row.activeCases;
      }
    };

    this.listData.filterPredicate = (row, filter) =>
      `${row.dateLabel} ${row.iso} ${row.activeCases}`.toLowerCase().includes(filter);

    this.subscriptions.add(
      this.dataService.visibleRows$.subscribe((rows) => {
        // Newest first — the reader wants the latest state before anything else.
        this.listData.data = rows.slice().reverse();
        this.isLoading = false;
        if (this.paginator) {
          this.paginator.firstPage();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  applyFilter(): void {
    this.listData.filter = this.searchKey.trim().toLowerCase();
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  clearFilter(): void {
    this.searchKey = '';
    this.applyFilter();
  }

  trendClass(value: number | null): Trend {
    return trendOf(value);
  }

  /** Explains why a number carries "≥": the total was carried forward, not published. */
  carriedTitle(value: number | null, what: string): string {
    return `Najmanje ${formatNumber(value)} ${what} — posljednji objavljeni zbir. Izvor poslije toga nije objavljivao ovaj podatak, a kumulativni zbir ne može da opadne.`;
  }

  trendIcon(value: number | null): string {
    switch (trendOf(value)) {
      case 'up':
        return 'arrow_upward';
      case 'down':
        return 'arrow_downward';
      default:
        return 'remove';
    }
  }

  /** Exports exactly what is in the table right now, filter and search included. */
  exportCsv(): void {
    const rows = this.listData.sortData(
      this.listData.filteredData,
      this.listData.sort
    );

    // The headers also state the kind of measure: active is the level on the
    // day, recoveries and deaths are cumulative totals, and the change depends
    // on the gap to the previous snapshot — hence the gap as its own column.
    const header = [
      'Datum',
      'Aktivni (na taj dan)',
      'Promjena od prethodnog presjeka',
      'Dana od prethodnog presjeka',
      `Prosjek kroz ${AVERAGE_WINDOW} presjeka`,
      'Oporavljeni (ukupno, objavljeno)',
      'Umrli (ukupno, objavljeno)',
      'Oporavljeni (ukupno, najmanje)',
      'Umrli (ukupno, najmanje)',
    ];

    // Published and carried values go into separate columns: whoever processes
    // the export has to be able to tell what the source actually said from the
    // lower bound we derived.
    const body = rows.map((row) => [
      row.dateLabel,
      csvValue(row.activeCases),
      csvValue(row.change),
      csvValue(row.daysSincePrevious),
      csvValue(row.average7, 1),
      csvValue(row.recovered),
      csvValue(row.deaths),
      csvValue(row.recoveredToDate),
      csvValue(row.deathsToDate),
    ]);

    const csv = [header, ...body]
      .map((line) => line.map(escapeCsv).join(','))
      .join('\r\n');

    // A BOM so Excel detects UTF-8 and renders č, ć, š, ž, đ correctly.
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'covid-19-rozaje.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}

function csvValue(value: number | null, digits = 0): string {
  return value === null || value === undefined ? '' : value.toFixed(digits);
}

function escapeCsv(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
