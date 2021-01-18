import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataService } from '../data.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnChanges {
  @Input() dataFromDatabase: any[] = [];
  showDeletedMessage: boolean;
  searchText: string = '';
  listData: MatTableDataSource<any>;
  isLoading = true;
  displayedColumns: string[] = ['Date', 'activeCases', 'recovered', 'deaths'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) matSort: MatSort;
  searchKey = '';
  clickedClear = 'clicked';

  constructor(private dataService: DataService) {}

  ngOnChanges(): void {
    this.listData = new MatTableDataSource(this.dataFromDatabase.reverse());
    this.listData.sort = this.matSort;
    // this.matSort.sort({id: 'Name', start: 'asc', disableClear: true })
    this.listData.paginator = this.paginator;
    this.isLoading = false;
  }

  applyFilter() {
    this.listData.filter = this.searchKey.trim().toLowerCase();
  }
}
