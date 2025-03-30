import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-overview-cards',
  standalone: true,
  imports: [],
  templateUrl: './overview-cards.component.html',
  styleUrls: ['./overview-cards.component.css']
})
export class OverviewCardsComponent {
  @Input() totalUsers: number = 0;
  @Input() totalProjects: number = 0;
  @Input() totalTasks: number = 0;
  @Input() activeUsers: number = 0;
}
