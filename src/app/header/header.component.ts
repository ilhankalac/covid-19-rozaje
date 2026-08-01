import { Component } from '@angular/core';

import { formatLongDate } from '../core/stats';
import { DataService } from '../data.service';

/**
 * Zaglavlje nosi samo identitet i obuhvaćeni period. Namjerno bez istaknute
 * brojke: podaci se ne ažuriraju od 2021, pa bi svaka velika cifra ovdje
 * bila pročitana kao trenutno stanje.
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
