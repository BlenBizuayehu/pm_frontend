import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin/pages/dashboard/dashboard.component'; // Admin dashboard
import { ProjectsComponent } from './admin/pages/projects/projects.component';
import { ReportsComponent } from './admin/pages/reports/reports.component';
import { TasksComponent } from './admin/pages/tasks/tasks.component';
import { UsersComponent } from './admin/pages/users/users.component';
import { LoginComponent } from './login/login.component'; // Import your login component
import { PmDashboardComponent } from './pm-dashboard/pm-dashboard.component'; // PM dashboard
import { TeamDashboardComponent } from './team-dashboard/team-dashboard.component'; // Team dashboard


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'pm-dashboard', component: PmDashboardComponent },
  { path: 'team-dashboard', component: TeamDashboardComponent },
  { path: 'users', component: UsersComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'reports', component: ReportsComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
