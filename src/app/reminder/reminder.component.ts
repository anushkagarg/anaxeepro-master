import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';

export interface Reminder {
  feNumber: string;
  user: string;
  timestamp: string;
  expiryTimestamp: string;
  note: string;
}
@Component({
  selector: 'app-reminder',
  templateUrl: './reminder.component.html',
  styleUrls: ['./reminder.component.css']
})
export class ReminderComponent implements OnInit {

  reminderCol: AngularFirestoreCollection<Reminder>;
  notes; remindNumber;
  allReminder: Reminder[];
  items; renum = [];

  constructor(private afs: AngularFirestore, private toastr: ToastrService) { }

  ngOnInit() {
    this.reminderCol = this.afs.collection<Reminder>('reminders');
    this.items = this.afs.collection<Reminder>('reminders', ref => ref.where('user', '==', 'support9'))
.valueChanges().subscribe(b => {
        this.allReminder = b;
        this.filteredReminder();
  });
  }
  filteredReminder() {
    console.log('called');
    const ab = this.allReminder.filter(f => f.expiryTimestamp);
    ab.forEach(k => {
      const rem = (Number(k.expiryTimestamp) - moment().unix() * 1000) ;
      if (rem > 5000) {
      this.notes = k.note;
      this.remindNumber = k.feNumber;
      setTimeout(() => {
       if (this.toastr) {
                this.toastr.success( this.notes, this.remindNumber, {closeButton: true, disableTimeOut:true});
        }
}, rem);
}
      console.log(this.remindNumber);
      this.renum.push(this.remindNumber);
    });
   }
}
