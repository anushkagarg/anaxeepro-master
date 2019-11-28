import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopnavbarComponent } from './topnavbar/topnavbar.component';
import { AsidenavbarComponent } from './asidenavbar/asidenavbar.component';
import { FooternavbarComponent } from './footernavbar/footernavbar.component';
import { SettingnavbarComponent } from './settingnavbar/settingnavbar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
// import {UserhomeComponent} from '../userhome/userhome.component';

@NgModule({
  declarations: [TopnavbarComponent, AsidenavbarComponent, FooternavbarComponent,
                  SettingnavbarComponent, DashboardComponent],
  imports: [
    CommonModule
  ],
  exports: [
    TopnavbarComponent,
    AsidenavbarComponent,
    FooternavbarComponent,
    SettingnavbarComponent
]
})
export class LayoutModule { }
