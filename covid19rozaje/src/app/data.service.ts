import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  dailiyStatistics: AngularFireList<any>;

  constructor(private firebase: AngularFireDatabase) {
    this.dailiyStatistics = firebase.list('dailyStatistics');
  }

  /* GET FROM FIREBASE */
  getDailyStatistics() {
    this.dailiyStatistics = this.firebase.list('dailyStatistics');
    return this.dailiyStatistics.snapshotChanges();
  }

  /* INSERT TO FIREBASE */

  insertDailyStatistic(formData) {
    for (let i = 0; i < 200; i++) {
      this.dailiyStatistics.push({
        activeCases: this.getRandomInt(200),
        recovered: this.getRandomInt(100),
        deaths: this.getRandomInt(5),
        date: this.getRandomInt(31) + '.' + this.getRandomInt(12) + '.',
      });
    }
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
}
