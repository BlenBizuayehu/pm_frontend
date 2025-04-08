import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBan,
  faBars,
  faCalendarDay,
  faCircleCheck,
  faClock,
  faEllipsisV,
  faFlag,
  faListCheck,
  faPlus,
  faPlusCircle,
  faSpinner,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../auth.service'; // Adjust path as needed
import { TaskStatusChartComponent } from '../../component/charts/charts.component';
import { NavbarComponent } from '../../component/navbar/navbar.component';
import { OverviewCardsComponent } from '../../component/overview-cards/overview-cards.component';

@Component({
  selector: 'app-team-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    NavbarComponent,
    OverviewCardsComponent,
    TaskStatusChartComponent 
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class TeamDashboardComponent implements OnInit {
  // FontAwesome icons
  faListCheck = faListCheck;
  faPlus = faPlus;
  faClock = faClock;
  faFlag = faFlag;
  faBars = faBars;
  faCircleCheck = faCircleCheck;
  faSpinner = faSpinner;
  faBan = faBan;
  faTimes = faTimes;
  faCalendarDay = faCalendarDay;
  faPlusCircle = faPlusCircle;
  faEllipsisV = faEllipsisV;

  // Dashboard metrics
  assignedTasksCount = 0;
  completedTasksCount = 0;
  pendingReviewsCount = 0;
  overdueTasksCount = 0;
  totalTasksCount = 0;
  todoTasksCount = 0;
  inProgressTasksCount = 0;

  // Task list data
  tasks: any[] = [];
  isLoading = false;
  errorMessage = '';
  debugInfo: any = {};
  username = '';
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.debugInfo['init_start'] = new Date();
    this.username = localStorage.getItem('currentUser') || '';
    this.debugInfo['username_from_storage'] = this.username;

    if (!this.username) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadTasks();
  }

 
  loadTasks() {
    this.debugInfo['load_start'] = new Date();
    const url = `http://localhost:8080/api/user-tasks?username=${this.username}`;
    this.debugInfo['request_url'] = url;
    this.isLoading = true;
  
    this.http.get<any[]>(url).subscribe({
      next: (tasks) => {
        this.debugInfo['response_data'] = tasks;
        this.debugInfo['response_time'] = new Date();
        this.tasks = tasks;
        
        // Count tasks by status
        this.countTasksByStatus();
        
        // Update dashboard metrics based on tasks
        this.updateDashboardMetrics();
        
        this.isLoading = false;
      },
      error: (err) => {
        this.debugInfo['error'] = {
          message: err.message,
          status: err.status,
          url: err.url,
          time: new Date()
        };
        this.isLoading = false;
        this.errorMessage = `Failed to load tasks: ${err.statusText}`;
        this.router.navigate(['/login']);
  
        if (err.status === 401) {
          this.authService.logout();
        }
      }
    });
  }
  
  countTasksByStatus() {
    if (!this.tasks || this.tasks.length === 0) {
      this.todoTasksCount = 0;
      this.inProgressTasksCount = 0;
      this.completedTasksCount = 0;
      this.overdueTasksCount = 0;
      this.totalTasksCount = 0;
      return;
    }
  
    this.totalTasksCount = this.tasks.length;
    this.todoTasksCount = this.tasks.filter(t => t.status === 'To Do').length;
    this.inProgressTasksCount = this.tasks.filter(t => t.status === 'In Progress').length;
    this.completedTasksCount = this.tasks.filter(t => t.status === 'Done').length;
    this.overdueTasksCount = this.tasks.filter(t => this.isOverdue(t.deadline)).length;
  }

  isOverdue(deadline: string): boolean {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  }

  
  updateDashboardMetrics() {
    // Update the metrics used in your dashboard
    this.assignedTasksCount = this.tasks.length;
    this.pendingReviewsCount = this.tasks.filter(task => 
      task.status === 'In Review'
    ).length;
  }

  private isTaskOverdue(task: any): boolean {
    // Skip completed tasks
    if (task.status === 'Done') return false;
    
    // Check if task has a due date
    if (!task.dueDate) return false;
    
    // Create date objects for comparison
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    
    // Reset time portions for accurate date-only comparison
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  }
  

  getCompletionPercentage(): number {
    if (this.totalTasksCount === 0) return 0; // Prevent division by zero
    return Math.round((this.completedTasksCount / this.totalTasksCount) * 100);
  }
  

  getStatusIcon(status: string): any {
    switch(status) {
      case 'To Do': return this.faListCheck;
      case 'In Progress': return this.faSpinner;
      case 'Done': return this.faCircleCheck;
      case 'Blocked': return this.faBan;
      default: return this.faFlag;
    }
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'To Do': return 'status-todo';
      case 'In Progress': return 'status-in-progress';
      case 'Done': return 'status-done';
      case 'Blocked': return 'status-blocked';
      default: return 'status-default';
    }
  }

  onCardClick(status: string) {
    this.router.navigate(['/tasks'], { 
      queryParams: { filter: status.toLowerCase() } 
    });
  }
}