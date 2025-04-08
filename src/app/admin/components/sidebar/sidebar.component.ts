import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() ongoingProjects: number = 0;
  @Input() completedProjects: number = 0;
  @Input() pendingReports: number = 0;
  @Input() completedReports: number = 0;
}