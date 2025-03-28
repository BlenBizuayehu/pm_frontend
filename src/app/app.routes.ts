import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component'; // Admin dashboard
import { LoginComponent } from './login/login.component'; // Import your login component
import { PmDashboardComponent } from './pm-dashboard/pm-dashboard.component'; // PM dashboard
import { TeamDashboardComponent } from './team-dashboard/team-dashboard.component'; // Team dashboard

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'pm-dashboard', component: PmDashboardComponent },
  { path: 'team-dashboard', component: TeamDashboardComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
