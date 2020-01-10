import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { SigninRoutingModule } from './signin-routing.module';
import { SigninComponent } from './signin/signin.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';


@NgModule({
  declarations: [SigninComponent],
  imports: [
    CommonModule,
    SigninRoutingModule,
    SlickCarouselModule,
    FormsModule, ReactiveFormsModule
  ]
})
export class SigninModule { }
