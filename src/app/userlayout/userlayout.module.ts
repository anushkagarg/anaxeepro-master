import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserlayoutRoutingModule } from './userlayout-routing.module';
import { UsertopnavbarComponent } from './usertopnavbar/usertopnavbar.component';
import { UsersidenavComponent } from './usersidenav/usersidenav.component';


@NgModule({
  declarations: [UsertopnavbarComponent, UsersidenavComponent],
  imports: [
    CommonModule,
    UserlayoutRoutingModule
  ],
  exports: [
    UsertopnavbarComponent,
    UsersidenavComponent,
    
]
})
export class UserlayoutModule { }
