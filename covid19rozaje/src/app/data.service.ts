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
    this.dailiyStatistics.push({
      test: 'test',
    });
  }
}
