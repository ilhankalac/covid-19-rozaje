import { OnChanges } from '@angular/core';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import Chart from 'chart.js';
import { DataService } from '../data.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements OnChanges {
  isLoading = true;
  @Input() dataFromFirebase: any = [];

  dates: any = [];
  activeCases: any = [];
  recovered: any = [];
  deaths: any = [];

  today = new Date();
  public now: Date = new Date();
  constructor(private dataService: DataService) {
    setInterval(() => {
      this.now = new Date();
    }, 1);
  }
  ctx;
  myChart;

  ngOnChanges(): void {
    this.generatingDataToLabels();
    this.generateMyChart();
    this.existingMonths();
    this.isLoading = false;
  }

  generateMyChart() {
    this.ctx = <HTMLCanvasElement>document.getElementById('myChart');
    this.myChart = new Chart(this.ctx, {
      type: 'line',
      responsive: true,
      data: {
        labels: this.dates,
        datasets: [
          {
            label: 'Aktivni slučajevi',
            data: this.activeCases,
            backgroundColor: ['rgba(255, 99, 132, 0.4)'],
            borderColor: ['rgb(89, 191, 63)'],
            borderWidth: 1,
            responsive: true,
            fill: true,
          },
          {
            label: 'Oporavljeni',
            data: this.recovered,
            backgroundColor: ['rgb(50, 168, 127, 0.2)'],
            borderColor: ['rgb(50, 168, 127)'],
            borderWidth: 1,
            responsive: true,
            fill: false,
            pointRadius: 0,
          },
          {
            label: 'Umrli',
            data: this.deaths,
            backgroundColor: ['rgb(63, 8, 83, 0.2)'],
            borderColor: ['rgb(63, 8, 83)'],
            borderWidth: 1,
            responsive: true,
            fill: true,
            pointRadius: 2,
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                stacked: true,
              },
              gridLines: {
                display: false,
              },
            },
          ],
        },
        animation: {
          duration: 2500,
        },
      },
    });
  }

  tempData: any = [];
  filterByMonth(event) {
    this.tempData = this.dataFromFirebase;

    if (event.source.value !== 'Sve') {
      this.dataFromFirebase = this.dataFromFirebase.filter(
        (item) => item.date.substring(3, 11) === event.source.value
      );
      this.generatingDataToLabels();

      this.myChart.data.labels = this.dates;
      this.myChart.data.datasets[0].data = this.activeCases;
      this.myChart.data.datasets[1].data = this.recovered;
      this.myChart.data.datasets[2].data = this.deaths;
    } else {
      this.generatingDataToLabels();

      this.myChart.data.labels = this.dates;
      this.myChart.data.datasets[0].data = this.activeCases;
      this.myChart.data.datasets[1].data = this.recovered;
      this.myChart.data.datasets[2].data = this.deaths;
    }
    this.myChart.update();
    this.dataFromFirebase = this.tempData;
  }

  generatingDataToLabels() {
    this.dates = [];
    this.activeCases = [];
    this.recovered = [];
    this.deaths = [];

    this.dataFromFirebase.forEach((el) => {
      this.dates.push(el.date.substring(0, 5));
      this.activeCases.push(el.activeCases);
      this.recovered.push(el.recovered);
      this.deaths.push(el.deaths);
    });
  }

  monthsAvailable: any = [];

  existingMonths() {
    this.dataFromFirebase.forEach((el) => {
      this.monthsAvailable.push(el.date.substring(3, 11));
    });

    //ALL MONTHS THAT HAVE THE DATA, array distinction
    this.monthsAvailable = this.monthsAvailable.filter(
      (n, i) => this.monthsAvailable.indexOf(n) === i
    );
  }

  insertNewData() {
    this.dataService
      .fetchData()
      .subscribe((item) => this.dataService.insertDailyStatistic(item));
  }
}
