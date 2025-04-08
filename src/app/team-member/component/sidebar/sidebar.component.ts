import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-team-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class TeamSidebarComponent {
  @Input() assignedTasks: number = 0;
  @Input() completedTasks: number = 0;
  @Input() pendingReviews: number = 0;
  @Input() overdueTasks: number = 0;
}