import { Component } from '@angular/core';

import { DailyStatRow, Summary } from '../core/models';
import { formatLongDate, formatNumber, formatSigned } from '../core/stats';
import { DataService } from '../data.service';

/**
 * The story of the whole period. Deliberately does not listen to the filter
 * bar — these are figures that do not depend on which slice the reader picked.
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
   * Deaths and recoveries are totals since tracking began, not daily figures:
   * 41 deaths is the total across eight months, rising by one in 30 of 220
   * snapshots. The note has to say both "total" and how far the total holds.
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
