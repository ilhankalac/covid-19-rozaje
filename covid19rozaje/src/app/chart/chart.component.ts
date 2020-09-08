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
      this.dataFromFirebase.forEach((el) => {
        this.dates.push(el.date);
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
      data: {
        labels: this.dates,
        datasets: [
          {
            label: 'Aktivni slučajevi',
            data: this.activeCases,
            backgroundColor: ['rgba(255, 99, 132, 0.2)'],
            borderColor: ['rgb(89, 191, 63)'],
            borderWidth: 1,
            responsive: true,
            fill: true,
          },
          {
            label: 'Izliječeni',
            data: this.recovered,
            backgroundColor: ['rgb(63, 89, 191)'],
            borderColor: ['rgb(63, 89, 191)'],
            borderWidth: 1,
            responsive: true,
            fill: false,
          },
          {
            label: 'Umrli',
            data: this.deaths,
            backgroundColor: ['rgb(63, 8, 83)'],
            borderColor: ['rgb(63, 8, 83)'],
            borderWidth: 1,
            responsive: true,
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
  }
}
