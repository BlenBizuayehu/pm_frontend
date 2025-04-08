import { CommonModule, DatePipe, Location, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faBan,
  faBook,
  faCalendarDay,
  faChevronDown,
  faChevronUp,
  faCircleCheck,
  faClock,
  faEdit,
  faEllipsisV,
  faEye,
  faFlag,
  faListCheck,
  faPlus,
  faSave,
  faSpinner,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, NgClass, DatePipe, FontAwesomeModule, FormsModule],
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.css']
})
export class MyTasksComponent implements OnInit {
  faArrowLeft = faArrowLeft;
  faListCheck = faListCheck;
  faPlus = faPlus;
  faClock = faClock;
  faFlag = faFlag;
  faCircleCheck = faCircleCheck;
  faSpinner = faSpinner;
  faBan = faBan;
  faCalendarDay = faCalendarDay;
  faEllipsisV=faEllipsisV;
  faEdit = faEdit;
  faEye = faEye;
  faSave = faSave;
  faChevronUp=faChevronUp;
  faChevronDown=faChevronDown;
  faTimesCircle = faTimesCircle;
  faBook=faBook;

  tasks: any[] = [];
  isLoading = false;
  username:string='';
  errorMessage = '';
  debugInfo: any = {};
  editingTaskId: string | null = null;
selectedTask: any = null;
statusOptions = ['To Do', 'In Progress', 'Done'];
  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private location: Location
  ) {}

  goBack() {
    this.location.back(); // Make sure to import Location from '@angular/common'
  }

  ngOnInit() {
    this.debugInfo['init_start'] = new Date();
     this.username = localStorage.getItem('currentUser') || '';
     this.debugInfo['username_from_storage'] = this.username;




    if (!this.username) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadTasks(); }

    viewTaskDetails(task: any) {
      this.selectedTask = task;
    }
    
    closeTaskDetails() {
      this.selectedTask = null;
    }
    
    startEditing(task: any) {
      this.editingTaskId = task.id;
    }
    
    cancelEditing() {
      this.editingTaskId = null;
    }

    toggleTaskExpand(task: any): void {
      task.expanded = !task.expanded;
  }

  getUserRole(task: any): string {
    // Implement logic based on your data structure
    return task.assigned_role || task.user_role || 'Assignee';
}

    

   // In your component
updateTaskStatus(task: any): void {
  // Validate task has an ID
  if (!task?.task_id) {
    this.errorMessage = 'Cannot update task - missing ID';
    return;
  }

  // Validate status is one of allowed values
  const allowedStatuses = ['To Do', 'In Progress', 'Done'];
  if (!allowedStatuses.includes(task.status)) {
    this.errorMessage = 'Invalid task status';
    return;
  }

  const updateUrl = `${this.apiUrl}/tasks/${task.task_id}/status`;
  console.log('Making request to:', updateUrl);

  this.http.patch(updateUrl, { status: task.status }).subscribe({
    next: () => {
      // Success - exit editing mode
      this.editingTaskId = null;
      console.log('Status updated successfully');
      // Optional: Show success message
      this.errorMessage = '';
    },
    error: (err) => {
      console.error('Error updating task status', err);
      this.isLoading = false;
      
      // Handle different error cases
      if (err.status === 404) {
        this.errorMessage = 'Task not found';
      } else if (err.status === 400) {
        this.errorMessage = 'Invalid status value';
      } else {
        this.errorMessage = 'Failed to update task status';
      }
    }
  });
}


    loadTasks() {
      
      this.debugInfo['load_start'] = new Date();
      const url = `http://localhost:8080/api/user-tasks?username=${this.username}`;
      this.debugInfo['request_url'] = url;

      // No token needed (session cookie is sent automatically)
      this.http.get<any[]>(url)
        .subscribe({
          next: (tasks) => {
            // Ensure all tasks have consistent field names
            this.tasks = tasks.map(task => ({
              ...task,
              id: task.task_id // Add id alias if needed elsewhere
            }));
            console.log('Processed tasks:', this.tasks);
          },
          error: (err) => {
        this.errorMessage = `Failed to load tasks: ${err.statusText}`;
            this.router.navigate(['/login']);

            if (err.status === 401) {
              this.authService.logout(); // Redirect to login if unauthorized
            }
          }

          
        });
    }

    showDebugInfo() {
      console.log('DEBUG INFO:', this.debugInfo);
      alert(JSON.stringify(this.debugInfo, null, 2));
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
      case 'To Do': return 'bg-secondary';
      case 'In Progress': return 'bg-primary';
      case 'Done': return 'bg-success';
      case 'Blocked': return 'bg-danger';
      default: return 'bg-light text-dark';
    }
  }

 
}