import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataService } from '../data.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit {
  dataFromDatabase: any[] = [];
  showDeletedMessage: boolean;
  searchText: string = '';
  listData: MatTableDataSource<any>;
  isLoading = true;
  displayedColumns: string[] = ['Date', 'Active', 'Recovered', 'Deaths'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) matSort: MatSort;
  searchKey = '';
  clickedClear = 'clicked';
  sumOfTotalPills: number = 0;
  sumOfTotalPrices: number = 0;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.getDailyStatistics().subscribe((list) => {
      this.dataFromDatabase = list
        .map((item) => {
          return {
            $key: item.key,
            ...item.payload.val(),
          };
        })
        .reverse();
      this.listData = new MatTableDataSource(this.dataFromDatabase);
      this.listData.sort = this.matSort;
      // this.matSort.sort({id: 'Name', start: 'asc', disableClear: true })
      this.listData.paginator = this.paginator;
      this.isLoading = false;
    });
  }

  applyFilter() {
    this.listData.filter = this.searchKey.trim().toLowerCase();
  }
}
