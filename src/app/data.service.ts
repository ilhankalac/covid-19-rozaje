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

  /*collectedData() {
    //TO 8 TH SEPTEMBER

    this.dailyStatistics.push({
      activeCases: 1,
      recovered: 0,
      deaths: 0,
      date: '18.06.2020.',
    });
    this.dailyStatistics.push({
      activeCases: 14,
      recovered: 0,
      deaths: 0,
      date: '19.06.2020.',
    });
    this.dailyStatistics.push({
      activeCases: 14,
      recovered: 0,
      deaths: 0,
      date: '20.06.2020.',
    });
    this.dailyStatistics.push({
      activeCases: 14,
      recovered: 0,
      deaths: 0,
      date: '21.06.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 16,
      recovered: 0,
      deaths: 0,
      date: '22.06.2020.',
    });
    this.dailyStatistics.push({
      activeCases: 19,
      recovered: 0,
      deaths: 0,
      date: '23.06.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 28,
      recovered: 0,
      deaths: 0,
      date: '24.06.2020.',
    });
    this.dailyStatistics.push({
      activeCases: 35,
      recovered: 0,
      deaths: 0,
      date: '25.06.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 41,
      recovered: 0,
      deaths: 0,
      date: '26.06.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 54,
      recovered: 0,
      deaths: 0,
      date: '27.06.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 58,
      recovered: 0,
      deaths: 0,
      date: '28.06.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 59,
      recovered: 0,
      deaths: 0,
      date: '29.06.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 76,
      recovered: 0,
      deaths: 0,
      date: '30.06.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 76,
      recovered: 0,
      deaths: 0,
      date: '01.07.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 78,
      recovered: 0,
      deaths: 0,
      date: '02.07.2020.',
    });
    this.dailyStatistics.push({
      activeCases: 94,
      recovered: 0,
      deaths: 0,
      date: '03.07.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 96,
      recovered: 0,
      deaths: 0,
      date: '04.07.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 126,
      recovered: 0,
      deaths: 0,
      date: '05.07.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 129,
      recovered: 0,
      deaths: 0,
      date: '06.07.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 96,
      recovered: 0,
      deaths: 0,
      date: '07.07.2020.', // ovo mi je upitan datum
    });

    this.dailyStatistics.push({
      activeCases: 149,
      recovered: 0,
      deaths: 0,
      date: '10.07.2020.',
    });
    this.dailyStatistics.push({
      activeCases: 152,
      recovered: 0,
      deaths: 0,
      date: '11.07.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 229,
      recovered: 0,
      deaths: 7,
      date: '17.07.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 231,
      recovered: 0,
      deaths: 0,
      date: '18.07.2020.',
    });
    this.dailyStatistics.push({
      activeCases: 235,
      recovered: 0,
      deaths: 0,
      date: '19.07.2020.',
    });
    this.dailyStatistics.push({
      activeCases: 234,
      recovered: 7,
      deaths: 0,
      date: '21.07.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 185,
      recovered: 55,
      deaths: 8,
      date: '22.07.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 184,
      recovered: 59,
      deaths: 8,
      date: '23.07.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 171,
      recovered: 74,
      deaths: 8,
      date: '24.07.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 173,
      recovered: 74,
      deaths: 8,
      date: '25.07.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 157,
      recovered: 90,
      deaths: 8,
      date: '26.07.2020.',
    });
    this.dailyStatistics.push({
      activeCases: 120,
      recovered: 130,
      deaths: 8,
      date: '27.07.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 119,
      recovered: 131,
      deaths: 8,
      date: '28.07.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 97,
      recovered: 154,
      deaths: 9,
      date: '29.07.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 87,
      recovered: 166,
      deaths: 9,
      date: '30.07.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 87,
      recovered: 167,
      deaths: 9,
      date: '31.07.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 17,
      recovered: 237,
      deaths: 9,
      date: '01.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 17,
      recovered: 237,
      deaths: 9,
      date: '02.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 21,
      recovered: 237,
      deaths: 9,
      date: '03.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 21,
      recovered: 237,
      deaths: 9,
      date: '04.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 1,
      recovered: 259,
      deaths: 9,
      date: '05.08.2020.',
    });
    this.dailyStatistics.push({
      activeCases: 15,
      recovered: 244,
      deaths: 10,
      date: '06.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 22,
      recovered: 248,
      deaths: 10,
      date: '07.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 22,
      recovered: 248,
      deaths: 10,
      date: '08.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 22,
      recovered: 248,
      deaths: 10,
      date: '09.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 21,
      recovered: 248,
      deaths: 11,
      date: '10.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 22,
      recovered: 248,
      deaths: 11,
      date: '07.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 29,
      recovered: 248,
      deaths: 11,
      date: '07.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 28,
      recovered: 257,
      deaths: 11,
      date: '12.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 27,
      recovered: 258,
      deaths: 11,
      date: '13.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 37,
      recovered: 258,
      deaths: 11,
      date: '14.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 42,
      recovered: 258,
      deaths: 11,
      date: '15.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 46,
      recovered: 259,
      deaths: 11,
      date: '16.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 42,
      recovered: 259,
      deaths: 11,
      date: '17.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 54,
      recovered: 259,
      deaths: 11,
      date: '18.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 58,
      recovered: 259,
      deaths: 11,
      date: '19.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 58,
      recovered: 260,
      deaths: 11,
      date: '20.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 58,
      recovered: 260,
      deaths: 11,
      date: '21.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 62,
      recovered: 260,
      deaths: 11,
      date: '22.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 62,
      recovered: 260,
      deaths: 11,
      date: '23.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 59,
      recovered: 282,
      deaths: 11,
      date: '24.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 59,
      recovered: 282,
      deaths: 11,
      date: '24.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 59,
      recovered: 282,
      deaths: 11,
      date: '25.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 62,
      recovered: 282,
      deaths: 11,
      date: '26.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 63,
      recovered: 282,
      deaths: 11,
      date: '27.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 86,
      recovered: 282,
      deaths: 11,
      date: '28.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 99,
      recovered: 282,
      deaths: 11,
      date: '29.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 97,
      recovered: 283,
      deaths: 12,
      date: '30.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 75,
      recovered: 308,
      deaths: 12,
      date: '31.08.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 80,
      recovered: 308,
      deaths: 13,
      date: '01.09.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 96,
      recovered: 312,
      deaths: 13,
      date: '02.09.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 100,
      recovered: 314,
      deaths: 13,
      date: '03.09.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 115,
      recovered: 314,
      deaths: 14,
      date: '04.09.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 116,
      recovered: 314,
      deaths: 14,
      date: '05.09.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 120,
      recovered: 314,
      deaths: 14,
      date: '06.09.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 113,
      recovered: 334,
      deaths: 14,
      date: '07.09.2020.',
    });

    this.dailyStatistics.push({
      activeCases: 124,
      recovered: 336,
      deaths: 14,
      date: '08.09.2020.',
    });
  } */
}
