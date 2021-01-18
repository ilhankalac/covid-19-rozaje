import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  latestElement: any;
  totalCases: number = 0;
  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getLatestDataKey().subscribe((item) =>
      this.dataService.getLatestElement(item[0].key).subscribe((el) => {
        this.latestElement = el;
        this.totalCases += Number(el.activeCases);
        this.totalCases += Number(el.recovered);
        this.totalCases += Number(el.deaths);
      })
    );
  }
}
