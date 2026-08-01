import { Component } from '@angular/core';

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
}
