import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import {
  faBan,
  faChartLine,
  faCheckCircle,
  faCircleCheck,
  faClipboardList,
  faExclamationTriangle,
  faFlag,
  faListCheck,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-overview-cards',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './overview-cards.component.html',
  styleUrls: ['./overview-cards.component.css']
})
export class OverviewCardsComponent {

  faClipboardList = faClipboardList;
faCheckCircle = faCheckCircle;
faExclamationTriangle = faExclamationTriangle;
faChartLine = faChartLine;
faCircleCheck=faCircleCheck;
faBan=faBan;
faFlag=faFlag;
faSpinner=faSpinner;
faListCheck=faListCheck;

  @Input() totalTasks: number = 0;
  @Input() todoTasks: number = 0;
  @Input() inProgressTasks: number = 0;
  @Input() completedTasks: number = 0;
  @Input() overdueTasks: number = 0;
  @Input() completionRate: number = 0;

  getStatusIcon(status: string): any {
    switch(status) {
      case 'To Do': return this.faClipboardList;
      case 'In Progress': return this.faSpinner;
      case 'Done': return this.faCircleCheck;
      case 'Blocked': return this.faBan;
      default: return this.faFlag;
    }
  }

  
}