// import { Component, Input } from '@angular/core';

// @Component({
//   selector: 'app-overview-cards',
//   templateUrl: './overview-cards.component.html',
//   styleUrls: ['./overview-cards.component.css']
// })
// export class OverviewCardsComponent {
//   @Input() totalProjects: number = 0;
//   @Input() totalUsers: number = 0;
//   @Input() completedProjects: number = 0;
//   @Input() pendingTasks: number = 0;
//   @Input() overdueTasks: number = 0;
//   @Input() teamsCount: number = 0;       // Add this line
// }

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
  faProjectDiagram,
  faSpinner,
  faUsers
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
faUsers=faUsers;
faFlag=faFlag;
faSpinner=faSpinner;
faProjectDiagram=faProjectDiagram;
faListCheck=faListCheck;

@Input() totalProjects: number = 0;
@Input() totalUsers: number = 0;
@Input() completedProjects: number = 0;
@Input() pendingTasks: number = 0;
@Input() overdueTasks: number = 0;
@Input() teamsCount: number = 0;   

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