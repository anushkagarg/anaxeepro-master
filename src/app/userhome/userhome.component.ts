import { Component, OnInit,ViewChild, AfterViewInit } from '@angular/core';
import {ReminderComponent} from '../reminder/reminder.component';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import {AuthService} from '../services/auth.service';
import 'rxjs/add/operator/do';
import {PushNotificationsService} from 'ng-push';
import * as Chart from 'chart.js';
import {MatDialog} from '@angular/material';
import * as _ from 'lodash';
import {MydialogComponent } from '../mydialog/mydialog.component';
import {UserdialogComponent} from '../userdialog/userdialog.component';

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
  Timestamp: string;
  Url: string;
  Reminder: string;
  notes: string;
}

@Component({
  selector: 'app-userhome',
  templateUrl: './userhome.component.html',
  styleUrls: ['./userhome.component.css']
})
export class UserhomeComponent implements AfterViewInit {
  @ViewChild(ReminderComponent, {static: false}) reminder;

  title = 'web notifi!!';
  users: string[]; nums: string[];
  itemsCol: AngularFirestoreCollection<Call>;
  items ;
  allCalls: Call[]; types: string[];
  filteredUser: string[];
  incomingUser; outgoingUser; missedUser; rejected; total; uniqueOutg; uniqueInco; uniqueMiss; uniqueRejc;
  loginUser: string;
  selectedNumber: string;
   productive; unique;
  totalCallLength: string;
  myDate = new Date();
  filteredNumber: string[]; filteredType: string[];
  selectedDaterange: any = new DateRange();
  selectedUser: string[] = [];
  selectedNotes: string;
  filteredCalls: Call[];
  selectedType: string;
  missedCallsDatasetUser: number[];
  rejectedCallsDatasetUser: number[];
  incomingCallsDatasetUser: number[];
  outgoingCallsDatasetUser: number[];
  notesUser: any; remindValue;
  missedCallsUser: Call[];
  rejectedCallsUser: Call[];
  incomingCallsUser: Call[];
  outgoingCallsUser: Call[];
  uniqueCalls: Call[];
  charttotal; chartunique; lastItem; note = []; remindArr = [];

  constructor(private afs: AngularFirestore, private pushnotification: PushNotificationsService,
              private authService: AuthService, public dialog: MatDialog) {
                this.pushnotification.requestPermission();
               }

               ngAfterViewInit() { 
                window.dispatchEvent(new Event('resize'));
                document.body.className = 'hold-transition skin-blue sidebar-mini';
                this.authService.user.subscribe(re => {
      this.loginUser = re.email;
      this.loginUser = this.loginUser.substring(0, this.loginUser.indexOf('@'));

      this.itemsCol = this.afs.collection<Call>('callrecords');
      this.items = this.afs.collection<Call>('callrecords', ref => ref.where('User', '==', this.loginUser).orderBy('Timestamp','desc'))
      .valueChanges().subscribe(b => {

    this.allCalls = b;
    console.log('in user', this.allCalls);
    this.filterData();
    this.note = this.reminder.renum;
    this.monitor(this.note);
    const fromNums = b.map((nums: Call) => nums.FromNumber);
    const toNums = b.map((nums: Call) => nums.ToNumber);
    this.nums = Array.from(new Set([...fromNums, ...toNums]));
    this.filteredNumber = this.nums;

    let set = Array.from(new Set(b.map((types: Call) => types.Activity)));
    this.types = [...set];
    this.filteredType = this.types;
    
    b.forEach(h => {
      if (h.Activity === 'missed') {
      this.notify();
      }
    }); 
    }); 
    });
} 

  notify() {
    const options = {
      body: 'You Have A MISS CALL, Go Take Action On It',
      sticky: false,
      duration: 900000,
      color: 'blue',
      closable: true
    };
    this.pushnotification.create('MISS CALL NOTIFICATION', options).subscribe(
    res => console.log(res),
    // tslint:disable-next-line:no-unused-expression
    err => console.log(err),
    );
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
 
filterData() {
  this.filteredCalls = this.loginUser ?
  this.allCalls.filter(call => this.loginUser.includes(call.User)) : this.allCalls;
  this.filteredCalls = this.selectedNumber ? this.filteredCalls.filter(call =>
  call.FromNumber === this.selectedNumber || call.ToNumber === this.selectedNumber) : this.filteredCalls;
  this.filteredCalls = this.selectedType ? this.filteredCalls.filter(call => call.Activity === this.selectedType) :
  this.filteredCalls;
  
  const ab = this.selectedDaterange.endDate;
  const endDate = (ab.valueOf() / 1000) + 86399;

  const bc = this.selectedDaterange.startDate;
  const startDate = bc.valueOf() / 1000;
  this.filteredCalls = this.filteredCalls.filter(call => Number(call.Timestamp) >= startDate
      && Number(call.Timestamp) <= endDate);

  this.filteredCalls = this.selectedNotes ? this.filteredCalls.filter(call => call.notes) : this.filteredCalls;
  this.setCallsByType();
  this.setCount();
  this.graphuser();
  this.chartUnique();
}
setCount() {
  this.incomingUser = this.incomingCallsUser.length;
  this.outgoingUser = this.outgoingCallsUser.length;
  this.missedUser = this.missedCallsUser.length;
  this.rejected = this.rejectedCallsUser.length;
  this.total = this.incomingUser + this.outgoingUser + this.missedUser + this.rejected;
  this.productive = this.filteredCalls.filter(call => call.CallLength >= 10).length;
  let second = this.filteredCalls.reduce((total, call) => total + Number(call.CallLength), 0);
  this.totalCallLength = new Date(second * 1000).toISOString().substr(11, 8);
}
setCallsByType() {
  this.incomingCallsUser = this.filteredCalls.filter(call => call.Activity === 'Incoming');
  this.outgoingCallsUser = this.filteredCalls.filter(call => call.Activity === 'Outgoing');
  this.missedCallsUser = this.filteredCalls.filter(call => call.Activity === 'Missed');
  this.rejectedCallsUser = this.filteredCalls.filter(call => call.Activity === 'Rejected');
  this.uniqueOutg =  [...new Set(this.outgoingCallsUser.map(call => call.ToNumber))].length;
  this.uniqueInco = [...new Set(this.incomingCallsUser.map(call => call.FromNumber))].length;
  this.uniqueMiss = [...new Set(this.missedCallsUser.map(call => call.FromNumber ))].length;
  this.uniqueRejc = [...new Set(this.rejectedCallsUser.map(call => call.ToNumber))].length;
  console.log('herrr',this.uniqueOutg);
  }

   monitor(ke) {
    let p;
    console.log('called', ke);
    const k = Object.keys(this.allCalls);
    const numbr = this.allCalls[ k[ 0 ] ].ToNumber;
    const act = this.allCalls[ k[ 0 ] ].Activity;
   // tslint:disable-next-line:prefer-for-of
    for(let i=0;i<ke.length;i++){
   if (numbr == ke[i] && act == 'Outgoing') {
     console.log('green');
   } else {
     this.remindArr.push(ke[i]);
     console.log('red', this.remindArr);
   }
   }
 }
 getList() {
  console.log('hereee list');
  const dialogRef = this.dialog.open(UserdialogComponent, {
    width: '600px',
    data: this.remindArr
  });
  dialogRef.afterClosed().subscribe(result => {
    const re = result;
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
        label: 'Total Unique Calls Count',
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
graphuser() {
  if (this.charttotal) {
    this.charttotal.destroy();
    }
  this.charttotal = new Chart('canvastotal', {
    type: 'bar',
    data: {
      labels: ['Incoming', 'Outgoing', 'Missed', 'Rejected'],
      datasets: [
        {
          label: 'Total Calls Count',
          data: [this.incomingUser, this.outgoingUser, this.missedUser, this.rejected],
          backgroundColor: [
            'rgb(204, 51, 153)',
            'rgb(204, 51, 153)',
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
            'rgba(255, 159, 64, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
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
}
