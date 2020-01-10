import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import 'firebase/firestore';
import {MatDialogModule} from '@angular/material/dialog';
import { environment } from '../environments/environment';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestore, AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import {AuthService} from '../app/services/auth.service';
import {AuthGuard} from '../app/services/auth.guard';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SigninModule } from './signin/signin.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { MatButtonModule, MatCardModule, MatIconModule, MatTableModule, MatFormFieldModule, MatOptionModule  } from '@angular/material';
import {MatSelectModule} from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import {PushNotificationsModule} from 'ng-push';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { ReminderComponent } from './reminder/reminder.component';
import {ToastrModule} from 'ngx-toastr';
import {NgxPaginationModule} from 'ngx-pagination';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { HttpModule} from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
@NgModule({
  declarations: [
    AppComponent,
    ReminderComponent,
  ],
  imports: [
    BrowserModule,
    ToastrModule.forRoot(),
    AngularFontAwesomeModule,
    NgxMatSelectSearchModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpModule,
    MatDialogModule,
    AppRoutingModule,
    SigninModule,
    NgxPaginationModule,
    Ng2SearchPipeModule,
    NgxDaterangepickerMd.forRoot(),
   MatButtonModule, MatCardModule, MatIconModule, MatTableModule,
   MatFormFieldModule, MatOptionModule, MatSelectModule,
    DashboardModule,
    SlickCarouselModule,
    FormsModule,
    AngularFirestoreModule,
    AngularFireModule.initializeApp(environment.firebase, 'angular-auth firebase'),
    AngularFireAuthModule,
    BrowserAnimationsModule,
    PushNotificationsModule,
  ],
  providers: [AuthService, AngularFirestore],
  bootstrap: [AppComponent]
})
export class AppModule { }
