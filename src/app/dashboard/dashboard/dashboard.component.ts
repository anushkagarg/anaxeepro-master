import { Component, OnInit, OnDestroy } from '@angular/core';
import 'rxjs/add/observable/of';
import { HttpResponse, HttpClient } from '@angular/common/http';
import { Http } from '@angular/http';
import * as _ from 'lodash';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';
import * as Chart from 'chart.js';
import { MydialogComponent } from 'src/app/mydialog/mydialog.component';
import {MatDialog} from '@angular/material';
import { Subscription, Subject } from 'rxjs';
import { extendMoment } from 'moment-range';
import { take, takeUntil } from 'rxjs/operators';

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

export interface Data {
  call_status: string;
  partner_mobile: string;
  user_mobile: string;
  created_at: string;
  call_ended_at: string;
  call_started_at: string;
  user_id: string;
}
interface Filter {
  call_status?: string;
  partner_mobile?: string;
  user_mobile?: string;
  created_at?: string;
  call_ended_at?: string;
  call_started_at?: string;
  user_id?: string;
}
interface Response {
  data: Data[];
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit, OnDestroy {
  filters: Filter = {};
  userList: Data[];
  filteredUsers = []; selectedUser: any;
  filteredNumber: string[]; selectedNumber: any;
  subscription: Subscription;
  allUser; term; nom;
  users: any[]; 
  page: any = 0; filterData;
  pageNumber; query: string;
  pageSize; selectedType: string;  filteredType = [];
  selectedDaterange: any = new DateRange();
  localNumber: any; ab; bc; localUser: any;
  incomingCount; outgoingCount; missedCount; totalCount; rejectedCount; charttotal;
  incomingCalls; chartdate; outgoingCalls; chartoutg; missedCalls; rejectedCalls;
  chartmiss; chartstack;
  outgoingCallsDataset;
  missedCallsDataset;
  num: string[]; showCall: boolean;
  uniqueInco; uniqueOutg; uniqueMiss; uniqueRejc; chartunique;

  constructor(private httpClient: HttpClient, public dialog: MatDialog) { }
  queryChange = _.debounce(() => {
    // tslint:disable-next-line:variable-name
    console.log('called');
    this.filteredNumber = this.num.filter(number => number.includes(this.query));
    if (this.filteredNumber.length) {
      this.selectedNumber = this.filteredNumber[0];
      this.filterData();
    } else {
      this.showCall = false;
    }
  }, 500);


  ngOnInit() {
    window.dispatchEvent(new Event('resize'));
    document.body.className = 'hold-transition skin-blue sidebar-mini';
    this.defaultData();
    this.filteredType = ['Incoming', 'Outgoing', 'Missed'];
  }
    
  defaultData() {
    let date: any = new Date();
    date = moment(date).format('YYYY-MM-DD');
    this.httpClient.get('https://crm.anaxee.com:3000/call_log', {
      params: {
        filter: '[["call_started_at",">","' + date + '"]]',
        pageNumber: this.page,
        pageSize: '300'
      },
      observe: 'response'
    }).subscribe((res: HttpResponse<Response>) => {
      this.filterData = res.body.data;
      this.setCallsByStatus();
      this.setCallsByStatusCount();
    });
  }

  setCallsByStatusCount() {
    this.outgoingCount = this.outgoingCalls.length;
    this.incomingCount = this.incomingCalls.length;
    this.missedCount = this.missedCalls.length;
    this.rejectedCount = this.rejectedCalls.length;
    this.totalCount = this.outgoingCount + this.incomingCount + this.missedCount + this.rejectedCount;
    this.uniqueOutg =  [...new Set(this.outgoingCalls.map(call => call.partner_mobile))].length;
    this.uniqueInco = [...new Set(this.incomingCalls.map(call => call.partner_mobile))].length;
    this.uniqueMiss = [...new Set(this.missedCalls.map(call => call.partner_mobile))].length;
    this.uniqueRejc =  [...new Set(this.rejectedCalls.map(call => call.partner_mobile))].length;
  }
  setCallsByStatus() {
    this.incomingCalls = this.filterData.filter(a => a.call_status == 'Incoming');
    this.outgoingCalls = this.filterData.filter(a => a.call_status == 'Outgoing');
    this.missedCalls = this.filterData.filter(a => a.call_status == 'Missed');
    this.rejectedCalls = this.filterData.filter(a => a.call_status == 'Rejected');
    // let calllength = this.filterData.filter(a => a.call_started_at.split('T'));
  
    this.chartTotal();
    this.chartUnique();
    this.outgoingGraph();
    this.missGraph();
    this.stackedGraph();
  }
  doApiCall() {
    const filter = this.convertFilterToParam();
    this.httpClient.get('https://crm.anaxee.com:3000/call_log', {
      params: {
        filter,
        pageNumber: this.page,
        pageSize: '300',
      },
      observe: 'response'
    }).subscribe((res: HttpResponse<Response>) => {
      this.filterData = res.body.data;
      this.getData();
      this.setCallsByStatusCount();
      this.setCallsByStatus();
    });
  }
  doFilterApiCall() {
    const filter = this.convertFilterToParam();
    this.httpClient.get('https://crm.anaxee.com:3000/call_log', {
      params: {
        // filter: '[["partner_mobile","=","' + this.selectedUser + '"]]',
        filter,
        pageNumber: this.page,
        pageSize: '300',
      },
      observe: 'response'
    }).subscribe((res: HttpResponse<Response>) => {
      this.filterData = res.body.data;
      this.setCallsByStatusCount();
      this.setCallsByStatus();
    });
  }
  handleSelectedTypeChange() {
    this.filters.call_status = `"=","${this.selectedType}"`;
    this.doFilterApiCall();
  }
  handleSelectedUserChange() {
    this.filters.user_id = `"=","${this.selectedUser}"`;
    this.doFilterApiCall();
  }
handleSelectedNumberChange() {
  this.filters.partner_mobile = `"in",["${this.selectedNumber.join('","')}"]`;
  this.doFilterApiCall();
}
getData() {
  const numbers: string = this.filterData.map(a => a.partner_mobile);
  this.num = [...new Set(numbers)];
  this.filteredNumber = this.num.filter(Number);
  localStorage.setItem('dataSource', JSON.stringify(this.filteredNumber));
  // // tslint:disable-next-line:no-non-null-assertion
  this.localNumber = JSON.parse(localStorage.getItem('dataSource'));

  const users = this.filterData.map(a => a.user_id);
  this.filteredUsers = [...new Set(users)];
  localStorage.setItem('userlist', JSON.stringify(this.filteredUsers));
  this.localUser = JSON.parse(localStorage.getItem('userlist'));
}

handleSelectedDateChange() {
  this.bc = this.selectedDaterange.startDate;
  const startDate = moment(this.bc).format('YYYY-MM-DD');
  this.ab = this.selectedDaterange.endDate;
  const endDate = moment(this.ab).format('YYYY-MM-DD');
  this.filters.call_started_at = `">","${startDate}"`;
  this.filters.call_ended_at = `"<","${endDate}T23:00:00.00Z"`;
  this.doApiCall();
}
  convertFilterToParam() {
    const { filters } = this;
    return '[' + Object.keys(filters).map(key => `["${key}", ${filters[key]}]`).toString() + ']';
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
    });
  } 
  outgoingGraph() {
    if (this.chartoutg) {
      this.chartoutg.destroy();
      }
    const outgoingCount = {};
    this.outgoingCalls.forEach(call => {
      outgoingCount[call.user_id] = (outgoingCount[call.user_id] || 0) + 1;
    });
    this.outgoingCallsDataset = this.filteredUsers.map(us => outgoingCount[us] || 0);
    this.chartoutg = new Chart('canva', {
      type: 'bar',
      data: {
        labels: this.localUser,
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
    if (this.chartmiss) {
      this.chartmiss.destroy();
      }
    const missedCount = {};
    this.missedCalls.forEach(call => {
      missedCount[call.user_id] = (missedCount[call.user_id] || 0) + 1;
    });
    this.missedCallsDataset = this.filteredUsers.map(s => missedCount[s] || 0);

    this.chartmiss = new Chart('canvasmiss', {
      type: 'bar',
      data: {
        labels: this.filteredUsers,
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

  stackedGraph() {
    if (this.chartstack) {
      this.chartstack.destroy();
      }
    const incomingCount = {};
    this.incomingCalls.forEach(call => {
      incomingCount[call.user_id] = (incomingCount[call.user_id] || 0) + 1;
    });
    const incomingCallsDataset = this.filteredUsers.map(User => incomingCount[User] || 0);

    const rejectedCount = {};
    this.rejectedCalls.forEach(call => {
      rejectedCount[call.user_id] = (rejectedCount[call.user_id] || 0) + 1;
    });
    const rejectedCallsDataset = this.filteredUsers.map(User => rejectedCount[User] || 0);

    this.chartstack = new Chart('canvasstack', {
      type: 'bar',
      data: {
        labels: this.filteredUsers,
        datasets: [
          {
            data: incomingCallsDataset,
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
            data: rejectedCallsDataset,
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
            data: [this.uniqueInco, this.uniqueOutg, this.uniqueMiss, this.uniqueRejc],
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
            data: [this.incomingCount, this.outgoingCount, this.missedCount, this.rejectedCount],
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
    let firstDate: any = JSON.stringify(this.ab);
    firstDate = firstDate.slice(1,11);
    const dateUser: any[] = [];
    let secondDate: any = JSON.stringify(this.bc);
    secondDate = secondDate.slice(1, 11);
    const momen = extendMoment(moment);
    const range = momen.range(secondDate, firstDate);
    console.log('datess', range);
    const array: any = Array.from(range.by('days'));
    array.map(m => {
      let dat = m.format('DD/MM/YYYY') ;
      dateUser.push(dat);
    });
    const incomingCount = {};
    this.incomingCalls.forEach(call => {
      const date = this.timestampToDate(Number(call.call_started_at));
      incomingCount[date] = (incomingCount[date] || 0) + 1;
    });
    const incomingCallsDataset = dateUser.map(date => incomingCount[date] || 0);
   
    if (this.chartdate) {
      this.chartdate.destroy();
      }
    this.chartdate = new Chart('canvasdate', {
      type: 'bar',
      data: {
        labels: dateUser,
        datasets: [
          {
            data: incomingCallsDataset,
            backgroundColor: '#1491ff',
            label: 'Incoming'
          },
          // {
          //   data: this.outgoingCallsDataset,
          //   backgroundColor: '#ec03fc',
          //   label: 'Outgoing'
          // },
          // {
          //   data: this.missedCallsDataset,
          //   backgroundColor: '#05e7f7',
          //   label: 'Missed'
          // },
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
   return moment(timestamp).format('DD/MM/YYYY');
  }

  ngOnDestroy(): void {
    document.body.className = '';
  }
  // tslint:disable-next-line:member-ordering
}
