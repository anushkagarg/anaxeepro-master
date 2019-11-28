import { Component, OnInit, Inject, Optional } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import * as Moment from 'moment';

export interface Post {
notes: string[];
}
@Component({
  selector: 'app-mydialog',
  templateUrl: './mydialog.component.html',
  styleUrls: ['./mydialog.component.css']
})

export class MydialogComponent implements OnInit {
  date: any;
  constructor(@Optional() public thisDialogRef: MatDialogRef<MydialogComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    console.log('in here', this.data);
    this.data.forEach(k => {
      this.date = this.timestampToDate(Number(k.timest));
      console.log(this.date);
    });
  }
  timestampToDate(da) {
    const ts = new Date(da * 1000);
    const l = ts.toISOString();
    const ourdate = new Date(l);
    return Moment(ourdate).fromNow();
   }
  onCloseCancel() {
    this.thisDialogRef.close('Cancel');
  }
}
