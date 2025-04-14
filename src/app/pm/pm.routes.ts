import { Routes } from '@angular/router';
import { ProjectsComponent } from '../admin/pages/projects/projects.component';
import { TasksComponent } from '../admin/pages/tasks/tasks.component';
import { PmDashboardComponent } from './pages/dashboard/dashboard.component';
import { TeamsComponent } from './pages/teams/teams.component';

export const PM_ROUTES: Routes = [
  { path: '', component: PmDashboardComponent },
  { path: 'dashboard', component: PmDashboardComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'teams', component: TeamsComponent }
];