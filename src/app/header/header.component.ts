import { Component } from '@angular/core';

import { formatLongDate } from '../core/stats';
import { DataService } from '../data.service';

/**
 * The header carries only identity and the period covered. Deliberately without
 * a headline figure: the data has not been updated since 2021, so any large
 * number here would be read as the current situation.
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  readonly summary$ = this.dataService.overallSummary$;
  readonly formatLongDate = formatLongDate;

  constructor(private dataService: DataService) {}
}
