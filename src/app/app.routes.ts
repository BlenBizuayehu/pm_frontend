import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin/pages/dashboard/dashboard.component'; // Admin dashboard
import { ProjectsComponent } from './admin/pages/projects/projects.component';
import { TasksComponent } from './admin/pages/tasks/tasks.component';
import { UsersComponent } from './admin/pages/users/users.component';
import { LoginComponent } from './login/login.component'; // Import your login component
import { PmDashboardComponent } from './pm/pages/dashboard/dashboard.component'; // PM dashboard
import { TeamsComponent } from './pm/pages/teams/teams.component';
import { TeamDashboardComponent } from './team-member/pages/dashboard/dashboard.component'; // Team dashboard
import { MyTasksComponent } from './team-member/pages/my-tasks/my-tasks.component';
import { MyTeamsComponent } from './team-member/pages/my-teams/my-teams.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'pm-dashboard', component: PmDashboardComponent },
  { path: 'team-dashboard', component: TeamDashboardComponent },
  { path: 'users', component: UsersComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'teams',  component: TeamsComponent},
  { path: 'my-teams', component: MyTeamsComponent},
  { path: 'my-tasks', component: MyTasksComponent},
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
