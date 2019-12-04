
import { Component, OnInit, Inject, Optional } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import * as Moment from 'moment';

export interface Post {
  notes: string[];
  }
@Component({
  selector: 'app-userdialog',
  templateUrl: './userdialog.component.html',
  styleUrls: ['./userdialog.component.css']
})
export class UserdialogComponent implements OnInit {

  constructor(@Optional() public thisDialogRef: MatDialogRef<UserdialogComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    console.log('in here', this.data);
  }
  onCloseCancel() {
    this.thisDialogRef.close('Cancel');
  }
}
