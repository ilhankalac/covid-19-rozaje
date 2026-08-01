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
 * Tabela svih presjeka. Ujedno je i pristupačna alternativa grafikonima —
 * svaka vrijednost sa grafikona ovdje se može pročitati bez prelaska mišem.
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

    // Sortiranje po datumu mora ići preko ISO ključa; string "08.09.2021."
    // se leksikografski poredi pogrešno.
    this.listData.sortingDataAccessor = (row, column) => {
      switch (column) {
        case 'date':
          return row.iso;
        case 'change':
          return row.change === null ? Number.NEGATIVE_INFINITY : row.change;
        case 'average7':
          return row.average7 === null ? Number.NEGATIVE_INFINITY : row.average7;
        // Sortira se po prenesenom zbiru, da redovi bez objavljenog podatka
        // ne padnu na dno kao da su nula.
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
        // Najnovije prvo — čitaoca prvo zanima posljednje stanje.
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

  /** Objašnjava zašto uz broj stoji „≥”: zbir je prenesen, nije objavljen. */
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

  /** Izvozi tačno ono što je trenutno u tabeli, uključujući filter i pretragu. */
  exportCsv(): void {
    const rows = this.listData.sortData(
      this.listData.filteredData,
      this.listData.sort
    );

    // Zaglavlja govore i vrstu mjere: aktivni su stanje na dan, oporavljeni i
    // umrli su kumulativni zbirovi, a promjena zavisi od razmaka do prethodnog
    // presjeka — zato razmak ide kao zasebna kolona.
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

    // Objavljena i prenesena vrijednost idu u zasebne kolone: ko obrađuje
    // izvoz mora moći da razlikuje šta je izvor stvarno rekao od donje granice
    // koju smo izveli.
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

    // BOM da Excel prepozna UTF-8 i ispravno prikaže č, ć, š, ž, đ.
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
