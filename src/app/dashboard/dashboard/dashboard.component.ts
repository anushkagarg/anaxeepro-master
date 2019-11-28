import { Component, OnInit, OnDestroy } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';
import { DatePipe } from '@angular/common';
import * as Moment from 'moment';
import * as Chart from 'chart.js';
import { extendMoment } from 'moment-range';
import { MydialogComponent } from 'src/app/mydialog/mydialog.component';
import {MatDialog} from '@angular/material';
// import moment = require('moment');
// import 'chartjs-plugin-datalabels';


class DateRange {
  startDate: Date;
  endDate: Date;

  constructor() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    this.startDate = date;
    this.endDate = date;
  }
}

export interface Call {
  Activity: string;
  ContactName: string;
  CallLength: number;
  FromNumber: string;
  ToNumber: string;
  User: string;
  Timestamp: number;
  url: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit, OnDestroy {
  callsCol: AngularFirestoreCollection<Call>;
  calls: Observable<Call[]>;
  allCalls: Call[];
  filteredCalls: Call[];
  missedCalls: Call[];
  rejectedCalls: Call[];
  incomingCalls: Call[];
  outgoingCalls: Call[];
  uniqueCalls: Call[];
  uniqueOutgoing: Call[];
  uniqueMissed: Call[];
  uniqueIncoming: Call[];
  uniqueRejected: Call[];
  totalCallLength: string;
  timeString; productive; unique; dayString; inco; miss; outg; rejc; total; query: string;
  uniInco; uniOutg; uniMiss; uniRejc;
  filteredNumber: string[];
  filteredType: string[];
  term; page: number; totalRec;
  filteredUser: string[];
  selectedUser: string[] = [];
  selectedNumber: string;
  selectedType: string;
  selectedDaterange: any = new DateRange();
  showCall: boolean;
  nums: string[];
  dates: any[] = [];
  users: string[] = [];
  types: string[];
  ctx; myBarChart; chart; chartstack; chartoutg; chartdate; chartunique; ab;bc;
  missedCallsDataset: number[];
  rejectedCallsDataset: number[];
  incomingCallsDataset: number[];
  outgoingCallsDataset: number[];

  queryChange = _.debounce(() => {
    // tslint:disable-next-line:variable-name
    this.filteredNumber = this.nums.filter(number => number.includes(this.query));
    if (this.filteredNumber.length) {
      this.selectedNumber = this.filteredNumber[0];
      this.filterData();
    } else {
      this.showCall = false;
    }
  }, 500);
  charttotal: Chart;

  constructor(private afs: AngularFirestore, public dialog: MatDialog) { }

  ngOnInit() {
    window.dispatchEvent(new Event('resize'));
    document.body.className = 'hold-transition skin-blue sidebar-mini';
    this.callsCol = this.afs.collection<Call>('callrecords');
    this.callsCol.valueChanges().subscribe(b => {
      this.allCalls = b;
      this.filterData();
      const fromNums = b.map((nums: Call) => nums.FromNumber);
      const toNums = b.map((nums: Call) => nums.ToNumber);
      this.nums = Array.from(new Set([...fromNums, ...toNums]));
      this.filteredNumber = this.nums;
      
      let set = Array.from(new Set(b.map((users: Call) => users.User)));
      this.users = [...set];
      this.filteredUser = this.users;

      set = Array.from(new Set(b.map((types: Call) => types.Activity)));
      this.types = [...set];
      this.filteredType = this.types;
    });
  }

  filterData() {
    this.filteredCalls = this.selectedUser.length ?
      this.allCalls.filter(call => this.selectedUser.includes(call.User)) : this.allCalls;
    this.filteredCalls = this.selectedNumber ? this.filteredCalls.filter(call =>
      call.FromNumber === this.selectedNumber || call.ToNumber === this.selectedNumber) : this.filteredCalls;
    this.filteredCalls = this.selectedType ? this.filteredCalls.filter(call => call.Activity === this.selectedType) :
      this.filteredCalls;

    this.ab = this.selectedDaterange.endDate;
    const endDate = (this.ab.valueOf() / 1000) + 86399; //timestamp
    this.bc = this.selectedDaterange.startDate;
    const startDate = this.bc.valueOf() / 1000;

    let d: any = JSON.stringify(this.ab);
    d = d.slice(1,11);
    let de: any = JSON.stringify(this.bc);
    de = de.slice(1, 11);

    this.filteredCalls = this.filteredCalls.filter(call => Number(call.Timestamp) >= startDate
      && Number(call.Timestamp) <= endDate);
    
    this.setCallsByType();
    this.setCount();
    this.missGraph();
    this.outgoingGraph();
    this.stackedgraph();
    this.dateGraph();
    this.chartUnique();
    this.chartTotal();
};
  setCount() {
    this.inco = this.incomingCalls.length;
    this.outg = this.outgoingCalls.length;
    console.log(this.inco, this.outg);
    this.miss = this.missedCalls.length;
    this.rejc = this.rejectedCalls.length;
    this.unique = this.uniqueCalls.length;
    this.total = this.inco + this.outg + this.miss + this.rejc;
    this.productive = this.filteredCalls.filter(call => call.CallLength >= 10).length;
    let second = this.filteredCalls.reduce((total, call) => total + Number(call.CallLength), 0);
    console.log(second);
    this.totalCallLength = new Date(second * 1000).toISOString().substr(11, 8);
    this.uniInco = this.uniqueIncoming.length;
    this.uniOutg = this.uniqueOutgoing.length;
    this.uniMiss = this.uniqueMissed.length;
    this.uniRejc = this.uniqueRejected.length;
  }
  setCallsByType() {
    this.incomingCalls = this.filteredCalls.filter(call => call.Activity === 'Incoming');
    this.outgoingCalls = this.filteredCalls.filter(call => call.Activity === 'Outgoing');
    this.missedCalls = this.filteredCalls.filter(call => call.Activity === 'Missed');
    this.rejectedCalls = this.filteredCalls.filter(call => call.Activity === 'Rejected');
    this.uniqueCalls = Array.from(new Set(this.filteredCalls.filter(call => call.ToNumber)));
    this.uniqueOutgoing = this.uniqueCalls.filter(call => call.Activity === 'Outgoing');
    this.uniqueRejected = this.uniqueCalls.filter(call => call.Activity === 'Rejected');
    let uni = Array.from(new Set(this.filteredCalls.filter(call => call.FromNumber)));
    this.uniqueIncoming = uni.filter(call => call.Activity === 'Incoming');
    this.uniqueMissed = uni.filter(call => call.Activity === 'Missed');
  }
  openDialog(post) {
    console.log('called');
    const dialogRef = this.dialog.open(MydialogComponent, {
      width: '600px',
      data: post
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog closed: ${result}`);
      const re = result;
      console.log('heur', re);
    });
  }
  outgoingGraph() {
    if (this.chartoutg) {
      this.chartoutg.destroy();
      }
    const outgoingCount = {};
    this.outgoingCalls.forEach(call => {
      outgoingCount[call.User] = (outgoingCount[call.User] || 0) + 1;
    });
    this.outgoingCallsDataset = this.users.map(User => outgoingCount[User] || 0);

    this.chartoutg = new Chart('canva', {
      type: 'bar',
      data: {
        labels: this.users,
        datasets: [
          {
            data: this.outgoingCallsDataset,
            backgroundColor: '#4287f5',
            label: 'Outgoing'
          },
        ]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  missGraph() {
    if (this.chart) {
      this.chart.destroy();
      }
    const missedCount = {};
    this.missedCalls.forEach(call => {
      missedCount[call.User] = (missedCount[call.User] || 0) + 1;
    });
    this.missedCallsDataset = this.users.map(User => missedCount[User] || 0);

    this.chart = new Chart('canvas', {
      type: 'bar',
      data: {
        labels: this.users,
        datasets: [
          {
            data: this.missedCallsDataset,
            backgroundColor: '#3cba9f',
            label: 'Missed'
          },
        ]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  
  stackedgraph() {
    if (this.chartstack) {
      this.chartstack.destroy();
      }
    const incomingCount = {};
    this.incomingCalls.forEach(call => {
      incomingCount[call.User] = (incomingCount[call.User] || 0) + 1;
    });
    this.incomingCallsDataset = this.users.map(User => incomingCount[User] || 0);

    const rejectedCount = {};
    this.rejectedCalls.forEach(call => {
      rejectedCount[call.User] = (rejectedCount[call.User] || 0) + 1;
    });
    this.rejectedCallsDataset = this.users.map(User => rejectedCount[User] || 0);

    this.chartstack = new Chart('canvass', {
      type: 'bar',
      data: {
        labels: this.users,
        datasets: [
          {
            data: this.incomingCallsDataset,
            backgroundColor: '#3cba9f',
            label: 'Incoming'
          },
          {
            data: this.outgoingCallsDataset,
            backgroundColor: '#ffcc00',
            label: 'Outgoing'
          },
          {
            data: this.missedCallsDataset,
            backgroundColor: '#f403fc',
            label: 'Missed'
          },
          {
            data: this.rejectedCallsDataset,
            backgroundColor: '#ff8214',
            label: 'Rejected'
          },
        ]
      },
      options: {
        scales: {
          xAxes: [{ stacked: true }],
          yAxes: [{ stacked: true }]
        }
      }
    });
  }

  chartUnique() {
    if (this.chartunique) {
      this.chartunique.destroy();
      }
    this.chartunique = new Chart('canvasunique', {
      type: 'bar',
      data: {
        labels: ['Incoming', 'Outgoing', 'Missed', 'Rejected'],
        datasets: [{
          label: 'Total Calls Count',
            data: [this.uniInco, this.uniOutg, this.uniMiss, this.uniRejc],
            backgroundColor: [
                'rgb(204, 51, 153)',
                'rgb(204, 51, 153)',
                'rgb(204, 51, 153)',
                'rgb(204, 51, 153)',
                'rgb(204, 51, 153)',
                'rgb(204, 51, 153)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
      },
      options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
    });
  }
  chartTotal() {
    if (this.charttotal) {
      this.charttotal.destroy();
      }
    this.charttotal = new Chart('canvastotal', {
      type: 'bar',
      data: {
        labels: ['Incoming', 'Outgoing', 'Missed', 'Rejected'],
        datasets: [{
          label: 'Total Calls Count',
            data: [this.inco, this.outg, this.miss, this.rejc],
            backgroundColor: [
                'rgb(204, 51, 153)',
                'rgb(204, 51, 153)',
                'rgb(204, 51, 153)',
                'rgb(204, 51, 153)',
                'rgb(204, 51, 153)',
                'rgb(204, 51, 153)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
      },
      options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
    });
  }

  dateGraph() {
    
    let d: any = JSON.stringify(this.ab);
    d = d.slice(1,11);
    const dateUser: any[] = [];
    let de: any = JSON.stringify(this.bc);
    de = de.slice(1, 11);
    const moment = extendMoment(Moment);
    const range = moment.range(de, d);
    const array : any = Array.from(range.by('days'));
    array.map(m => {
      let dat = m.format('DD/MM/YYYY') ;
      dateUser.push(dat);
    });
    const incomingCount = {};
    this.incomingCalls.forEach(call => {
      const date = this.timestampToDate(Number(call.Timestamp));
      incomingCount[date] = (incomingCount[date]|| 0) + 1;
    });
    this.incomingCallsDataset = dateUser.map(date => incomingCount[date] || 0);

    const outgoingCount = {};
    this.outgoingCalls.forEach(call => {
      const date = this.timestampToDate(Number(call.Timestamp));
      outgoingCount[date] = (outgoingCount[date]|| 0) + 1;
    });
    console.log(outgoingCount);
    this.outgoingCallsDataset = dateUser.map(date => outgoingCount[date] || 0);

    const missedCount = {};
    this.missedCalls.forEach(call => {
         const date = this.timestampToDate(Number(call.Timestamp));
         missedCount[date] = (missedCount[date] || 0) + 1;
       });
    this.missedCallsDataset = dateUser.map(date => missedCount[date] || 0);
   
    if (this.chartdate) {
      this.chartdate.destroy();
      }
    this.chartdate = new Chart('canvasdate', {
      type: 'bar',
      data: {
        labels: dateUser,
        datasets: [
          {
            data: this.incomingCallsDataset,
            backgroundColor: '#1491ff',
            label: 'Incoming'
          },
          {
            data: this.outgoingCallsDataset,
            backgroundColor: '#ec03fc',
            label: 'Outgoing'
          },
          {
            data: this.missedCallsDataset,
            backgroundColor: '#05e7f7',
            label: 'Missed'
          },
        ]
      },
      options: {
        scales: {
          xAxes: [{ stacked: true }],
          yAxes: [{ stacked: true }]
        }
      }
    });
  }
  timestampToDate(timestamp) {
   return Moment.unix(timestamp).format('DD/MM/YYYY');
  }
  ngOnDestroy(): void {
    document.body.className = '';
  }
  // tslint:disable-next-line:member-ordering
}
