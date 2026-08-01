import { Component } from '@angular/core';

import { Summary } from '../core/models';
import { formatLongDate, formatNumber, formatSigned, trendOf } from '../core/stats';
import { DataService } from '../data.service';

/** Naslovni dio: posljednje poznato stanje. Ne zavisi od izabranog perioda. */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  readonly summary$ = this.dataService.overallSummary$;

  readonly formatNumber = formatNumber;
  readonly formatSigned = formatSigned;
  readonly formatLongDate = formatLongDate;
  readonly trendOf = trendOf;

  constructor(private dataService: DataService) {}

  /**
   * Podaci se ne osvježavaju od septembra 2021. Bez ove napomene velika
   * brojka izgleda kao trenutno stanje, što bi obmanulo čitaoca.
   */
  isStale(summary: Summary): boolean {
    return summary.daysSinceUpdate > 14;
  }

  staleNotice(summary: Summary): string {
    const months = Math.round(summary.daysSinceUpdate / 30);
    if (months >= 12) {
      const years = Math.floor(months / 12);
      return `posljednji presjek je star više od ${years} ${
        years === 1 ? 'godine' : 'godina'
      }`;
    }
    return `posljednji presjek je star ${months} ${months === 1 ? 'mjesec' : 'mjeseci'}`;
  }
}
