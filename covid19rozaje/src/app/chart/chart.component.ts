import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';
import { DataService } from '../data.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent implements OnInit {
  constructor(private dataService: DataService) {}
  ctx;
  myChart;

  dataFromFirebase: any = [];

  dates: any = [];
  activeCases: any = [];
  recovered: any = [];
  deaths: any = [];

  ngOnInit(): void {
    // this.dataService.insertDailyStatistic('');

    // this.dataService.collectedData();

    this.dataService.getDailyStatistics().subscribe((list) => {
      this.dataFromFirebase = list.map((item) => {
        return {
          $key: item.key,
          ...item.payload.val(),
        };
      });

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

      this.generateMyChart();
    });
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
            label: 'Izliječeni',
            data: this.recovered,
            backgroundColor: ['rgb(50, 168, 127, 0.2)'],
            borderColor: ['rgb(50, 168, 127)'],
            borderWidth: 1,
            responsive: true,
            fill: true,
          },
          {
            label: 'Umrli',
            data: this.deaths,
            backgroundColor: ['rgb(63, 8, 83, 0.2)'],
            borderColor: ['rgb(63, 8, 83)'],
            borderWidth: 1,
            responsive: true,
            fill: true,
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
            },
          ],
        },
        animation: {
          duration: 2000,
        },
      },
    });
  }

  filterByMonth() {
    this.dataFromFirebase.forEach((element) => {
      console.log(element.date.substring(3, 10));
    });

    this.dataFromFirebase = this.dataFromFirebase.filter(
      (item) => item.date.substring(3, 10) === '06.2020'
    );
  }
}
