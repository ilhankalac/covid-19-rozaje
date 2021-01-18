import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.css'],
})
export class ContainerComponent implements OnInit {
  dataFromFirebase: any = [];
  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getDailyStatistics().subscribe((list) => {
      this.dataFromFirebase = list.map((item) => {
        return {
          $key: item.key,
          ...item.payload.val(),
        };
      });
    });
  }
}
