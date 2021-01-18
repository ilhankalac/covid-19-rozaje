import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  dailyStatistics: AngularFireList<any>;

  constructor(private firebase: AngularFireDatabase, private http: HttpClient) {
    this.dailyStatistics = firebase.list('dailyStatistics');
  }

  /* GET FROM FIREBASE */
  getDailyStatistics() {
    this.dailyStatistics = this.firebase.list('dailyStatistics');
    return this.dailyStatistics.snapshotChanges();
  }

  /* INSERT TO FIREBASE */

  insertDailyStatistic(data) {
    this.dailyStatistics.push({
      activeCases: data.Aktivni,
      recovered: data.Oporavljeni,
      deaths: data.Umrli,
      date: data.Datum,
    });
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  fetchData() {
    return this.http.get('http://127.0.0.1:5500/scripts/currentData.json');
  }
}
