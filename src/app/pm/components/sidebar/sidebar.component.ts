import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pm-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class PmSidebarComponent {
  @Input() myProjects: number = 0;
  @Input() completedProjects: number = 0;
  @Input() pendingTasks: number = 0;
  @Input() overdueTasks: number = 0;
}