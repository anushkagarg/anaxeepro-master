import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserhomeRoutingModule } from './userhome-routing.module';
// import { UserhomeComponent} from './userhome.component'
import { MatButtonModule, MatCardModule, MatIconModule, MatTableModule, MatFormFieldModule, MatOptionModule  } from '@angular/material';
import {MatSelectModule} from '@angular/material/select';
import {FormsModule} from '@angular/forms';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { ModalModule } from 'ngx-bootstrap';
import {UserlayoutModule } from '../userlayout/userlayout.module';
import { LayoutModule} from '../layout/layout.module';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DatePipe} from '@angular/common';


@NgModule({
  // declarations: [],
  imports: [
    CommonModule,
    UserhomeRoutingModule,
    UserlayoutModule,
    MatButtonModule, MatCardModule, MatIconModule, MatTableModule, MatFormFieldModule, MatOptionModule ,
    MatSelectModule,
    FormsModule,
    ModalModule,
    LayoutModule,
    NgxDaterangepickerMd,
    AngularFontAwesomeModule,
    BrowserAnimationsModule
  ],
  providers: [DatePipe]
})
export class UserhomeModule { }
