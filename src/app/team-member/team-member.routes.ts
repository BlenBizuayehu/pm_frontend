import { Routes } from '@angular/router';
import { TeamDashboardComponent } from './pages/dashboard/dashboard.component';
import { MyTasksComponent } from './pages/my-tasks/my-tasks.component';
import { MyTeamsComponent } from './pages/my-teams/my-teams.component';

export const TEAM_ROUTES: Routes = [
  { path: '', component: TeamDashboardComponent },
  { path: 'dashboard', component: TeamDashboardComponent },
  { path: 'my-tasks', component: MyTasksComponent },
  { path: 'my-teams', component: MyTeamsComponent }
];