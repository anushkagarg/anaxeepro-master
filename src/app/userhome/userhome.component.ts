import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import {AuthService} from '../services/auth.service';
import 'rxjs/add/operator/do';
import {PushNotificationsService} from 'ng-push';
import * as Chart from 'chart.js';
import { DatePipe } from '@angular/common';
import { getMatFormFieldPlaceholderConflictError } from '@angular/material';
import { database } from 'firebase';
import {MatDialog} from '@angular/material';
import {MydialogComponent } from '../mydialog/mydialog.component';


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
export interface Post {
  Activity: string;
  ContactName: string;
  CallLength: number;
  FromNumber: string;
  ToNumber: string;
  User: string;
  Timestamp: string;
  Url: string;
  notes: string;
}

@Component({
  selector: 'app-userhome',
  templateUrl: './userhome.component.html',
  styleUrls: ['./userhome.component.css']
})
export class UserhomeComponent implements OnInit {
  title = 'web notifi!!';
  users: string[]; nums: string[];
  itemsCol: AngularFirestoreCollection<Post>;
  items ;
  allCalls: Post[]; types: string[];
  filteredUser: string[];
  incomingUser; outgoingUser; missedUser; rejected; total;
  loginUser: string; timeString;
  selectedNumber: string;
  test: string; productive; unique;
  totalCallLength: number;
  myDate = new Date();
  filteredNumber: string[]; filteredType: string[];
  selectedDaterange: any = new DateRange();
  selectedUser: string[] = [];
  selectedNotes: string;
  filteredCalls: Post[];
  selectedType: string;
  missedCallsDatasetUser: number[];
  rejectedCallsDatasetUser: number[];
  incomingCallsDatasetUser: number[];
  outgoingCallsDatasetUser: number[];
  notesUser: any;
  missedCallsUser: Post[];
  rejectedCallsUser: Post[];
  incomingCallsUser: Post[];
  outgoingCallsUser: Post[];
  uniqueCalls: Post[];
  chart; 

  constructor(private afs: AngularFirestore, private datePipe: DatePipe,
              private pushnotification: PushNotificationsService,
              private authService: AuthService, public dialog: MatDialog) {
                this.pushnotification.requestPermission();
               }

  ngOnInit() {
    console.log('here user');
    window.dispatchEvent(new Event('resize'));
    document.body.className = 'hold-transition skin-blue sidebar-mini';
    this.authService.user.subscribe(re => {
      this.loginUser = re.email;
      this.loginUser = this.loginUser.substring(0, this.loginUser.indexOf('@'));

      this.itemsCol = this.afs.collection<Post>('calllogs');
      this.items = this.afs.collection<Post>('calllogs', ref => ref.where('User', '==', this.loginUser))
      .valueChanges().subscribe(b => {

    this.allCalls = b;
    this.filterData();
    const fromNums = b.map((nums: Post) => nums.FromNumber);
    const toNums = b.map((nums: Post) => nums.ToNumber);
    this.nums = Array.from(new Set([...fromNums, ...toNums]));
    this.filteredNumber = this.nums;

    let set = Array.from(new Set(b.map((types: Post) => types.Activity)));
    this.types = [...set];
    this.filteredType = this.types;
    console.log(this.filteredNumber);

    let len = b.map((notess: Post) => notess.notes);

    this.notesUser = len.map((l) => Array.isArray(l) ? l.length : undefined);
    
    console.log(this.notesUser);

    //let ab: any =  len.filter(item => !!item).map(array => array.length);
    //this.notesUser = ab - 1;
    //console.log(this.notesUser);
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
 openDialog() {
  console.log('called');
  const dialogRef = this.dialog.open(MydialogComponent, {
    width: '600px',
    data: this.filteredCalls
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
  console.log('dfj', this.filteredCalls);
  this.setCallsByType();
  this.setCount();
  this.graphuser();
}
setCount() {
  this.incomingUser = this.incomingCallsUser.length;
  this.outgoingUser = this.outgoingCallsUser.length;
  this.missedUser = this.missedCallsUser.length;
  this.rejected = this.rejectedCallsUser.length;
  this.unique = this.uniqueCalls.length;
  this.total = this.incomingUser + this.outgoingUser + this.missedUser + this.rejected;
  this.productive = this.filteredCalls.filter(call => call.CallLength >= 10).length;
  this.totalCallLength = this.filteredCalls.reduce((total, call) => total + Number(call.CallLength), 0);
}
setCallsByType() {
  this.incomingCallsUser = this.filteredCalls.filter(call => call.Activity === 'incoming');
  this.outgoingCallsUser = this.filteredCalls.filter(call => call.Activity === 'outgoing');
  this.missedCallsUser = this.filteredCalls.filter(call => call.Activity === 'missed');
  this.rejectedCallsUser = this.filteredCalls.filter(call => call.Activity === 'rejected');
  this.uniqueCalls = Array.from(new Set(this.filteredCalls.filter(call => call.ToNumber)));
  this.notesUser = this.filteredCalls.filter(call => call.notes);
  // console.log(this.notesUser);
  }
graphuser() {
  this.chart = new Chart('canvas', {
    type: 'bar',
    data: {
      labels: ['incoming', 'outgoing', 'missed', 'rejected'],
      datasets: [
        {
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