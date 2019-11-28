import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutModule } from '../layout/layout.module';
import { MatButtonModule, MatCardModule, MatIconModule, MatTableModule, MatFormFieldModule, MatOptionModule  } from '@angular/material';
import {MatSelectModule} from '@angular/material/select';
import {FormsModule} from '@angular/forms';
import {DatePipe} from '@angular/common';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import {NgxPaginationModule} from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import {MydialogComponent} from '../mydialog/mydialog.component';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
  declarations: [DashboardComponent, MydialogComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    NgxPaginationModule,
    AngularFontAwesomeModule,
    DashboardRoutingModule,
    LayoutModule,
    Ng2SearchPipeModule,
    NgxDaterangepickerMd.forRoot(),
    FormsModule,
    BrowserAnimationsModule,
   MatButtonModule, MatCardModule, MatIconModule, MatTableModule,
       MatFormFieldModule, MatOptionModule, MatSelectModule
  ],
  entryComponents: [MydialogComponent],
  providers: [DatePipe]
})
export class DashboardModule { }
