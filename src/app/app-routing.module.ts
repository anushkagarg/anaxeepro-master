import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthGuard} from '../app/services/auth.guard';
import {DashboardComponent} from '../app/dashboard/dashboard/dashboard.component';
const routes: Routes = [
   {path: '', redirectTo: 'signin', pathMatch: 'full'},

   {
    path: 'dashboard',
    canLoad: [AuthGuard],
    component: DashboardComponent
},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
