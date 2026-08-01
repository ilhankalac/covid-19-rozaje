import { Component } from '@angular/core';

import { DailyStatRow, Summary } from '../core/models';
import { formatLongDate, formatNumber, formatSigned } from '../core/stats';
import { DataService } from '../data.service';

/**
 * Priča o cijelom periodu. Namjerno ne sluša filter traku — ovo su brojke
 * koje ne zavise od toga koji je isječak čitalac izabrao.
 */
@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
})
export class OverviewComponent {
  readonly summary$ = this.dataService.overallSummary$;

  readonly formatNumber = formatNumber;
  readonly formatSigned = formatSigned;
  readonly formatLongDate = formatLongDate;

  constructor(private dataService: DataService) {}

  /**
   * Umrli i oporavljeni su zbirovi od početka praćenja, a ne dnevne brojke:
   * 41 umrli je ukupno kroz osam mjeseci, uz porast od po jedan u 30 od 220
   * presjeka. Napomena mora reći i „ukupno” i do kad zbir važi.
   */
  cumulativeNote(summary: Summary, last: DailyStatRow | null): string {
    if (!last || !summary.first) {
      return 'Podatak nikad nije objavljen.';
    }
    return `Zbir od ${formatLongDate(summary.first.date)} do ${formatLongDate(
      last.date
    )}. Poslije toga nije objavljivan.`;
  }
}
