import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AuthGuard} from '../app/services/auth.guard';
import {DashboardComponent} from '../app/dashboard/dashboard/dashboard.component';
import {UserhomeComponent} from '../app/userhome/userhome.component';
const routes: Routes = [
   {path: '', redirectTo: 'signin', pathMatch: 'full'},

   {
    path: 'dashboard',
    canActivate: [AuthGuard],
    component: DashboardComponent
},
{
  path: 'userhome',
  canActivate: [AuthGuard],
  component: UserhomeComponent
},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
