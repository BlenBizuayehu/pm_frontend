import { CommonModule, DatePipe, Location, NgClass } from '@angular/common';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FaIconComponent, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faBan,
  faBook,
  faCalendarDay,
  faChevronDown,
  faChevronUp,
  faCircleCheck,
  faClipboardCheck,
  faClock,
  faDownload,
  faEdit,
  faEllipsisV,
  faExclamationTriangle,
  faEye,
  faFile,
  faFlag,
  faListCheck,
  faPlus,
  faSave,
  faSpinner,
  faTimesCircle,
  faUpload
} from '@fortawesome/free-solid-svg-icons';
import { TasksService } from '../../../services/task.service';
@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, NgClass,FaIconComponent, DatePipe, FontAwesomeModule, FormsModule],
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.css']
})
export class MyTasksComponent implements OnInit {
  faArrowLeft = faArrowLeft;
  faListCheck = faListCheck;
  faClipboardCheck=faClipboardCheck;
  faPlus = faPlus;
  faDownload=faDownload;
  faUpload=faUpload;
  faExclamationTriangle=faExclamationTriangle;
  faClock = faClock;
  faFlag = faFlag;
  faCircleCheck = faCircleCheck;
  faSpinner = faSpinner;
  faBan = faBan;
  faFile=faFile;
  faCalendarDay = faCalendarDay;
  faEllipsisV=faEllipsisV;
  faEdit = faEdit;
  faEye = faEye;
  faSave = faSave;
  faChevronUp=faChevronUp;
  faChevronDown=faChevronDown;
  faTimesCircle = faTimesCircle;
  faBook=faBook;
  

  selectedTaskForUpload: number | null = null;
  uploadInProgress = false;
  tasks: any[] = [];
  isLoading = false;
  errorMessage = '';
  editingTaskId: number | null = null;
  selectedTask: any = null;
  selectedFile: File | null = null;
  uploadProgress = 0;
  uploadError = '';
  username:string='';
  debugInfo: any = {};
statusOptions = ['To Do', 'In Progress', 'Done'];
  private apiUrl = 'http://localhost:8080/api';

  // Add these properties to your component class
uploadState = {
  inProgress: false,
  progress: 0,
  error: '',
  success: false,
  currentTaskId: null as number | null
};

  constructor(
    private tasksService:TasksService,
    private http: HttpClient,
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
    


    toggleTaskExpand(task: any): void {
      task.expanded = !task.expanded;
  }

  getUserRole(task: any): string {
    // Implement logic based on your data structure
    return task.assigned_role || task.user_role || 'Assignee';
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


  startEditing(task: any): void {
    this.editingTaskId = task.task_id;
    this.selectedFile = null;
    this.uploadProgress = 0;
    this.uploadError = '';
  }

  cancelEditing(): void {
    this.editingTaskId = null;
    this.selectedFile = null;
  }

  onStatusChange(task: any): void {
    // Reset file selection when status changes
    if (task.status !== 'Done') {
      this.selectedFile = null;
    }
  }

 

  
 

  updateTaskStatus(task: any): void {
    if (task.status === 'Done' && !this.selectedFile) {
      this.uploadError = 'Please upload a deliverable document';
      return;
    }

    const updates: any = {
      status: task.status
    };

    // Update dates based on status changes
    if (task.status === 'To Do' && !task.start_date) {
      updates.start_date = new Date();
    } else if (task.status === 'Done' && !task.end_date) {
      updates.end_date = new Date();
    }

    // If status is Done and there's a file to upload
    if (task.status === 'Done' && this.selectedFile) {
      this.uploadDocument();
    } else {
      this.saveTaskUpdates(task, updates);
    }
  }
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.uploadError = '';
  }
  

  uploadDocument(): void {
    if (!this.selectedTaskForUpload || !this.selectedFile) {
      this.uploadState.error = 'Please select both a task and a file';
      return;
    }
  
    this.uploadState = {
      inProgress: true,
      progress: 0,
      error: '',
      success: false,
      currentTaskId: this.selectedTaskForUpload
    };
  
    const formData = new FormData();
    formData.append('document', this.selectedFile);
  
    this.http.post(`${this.apiUrl}/tasks/${this.selectedTaskForUpload}/document`, formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadState.progress = Math.round(100 * (event.loaded / (event.total || 1)));
        } else if (event instanceof HttpResponse) {
          // Type assertion and proper checking
          this.loadTasks();
          const response = event.body as any; // Use type assertion
          if (response && typeof response === 'object' && 'task_id' in response) {
            this.uploadState.success = true;
            this.uploadState.inProgress = false;
            
            const updatedTask = response;
            const index = this.tasks.findIndex(t => t.task_id === updatedTask.task_id);
            if (index >= 0) {
              this.tasks[index] = updatedTask;
            }
            
            setTimeout(() => {
              this.resetUploadState();
            }, 3000);
          } else {
            this.uploadState.error = 'Invalid response format from server';
            this.uploadState.inProgress = false;
          }
        }
      },
      error: (err) => {
        this.uploadState.error = err.error?.message || 'Upload failed';
        this.uploadState.inProgress = false;
      }
    });
  }
  
  resetUploadState(): void {
    this.uploadState = {
      inProgress: false,
      progress: 0,
      error: '',
      success: false,
      currentTaskId: null
    };
    this.selectedFile = null;
    this.selectedTaskForUpload = null;
  }
  
 // Add to your component
viewDocument(taskId: number) {
  const taskIdStr = taskId.toString();
  this.tasksService.getTaskDocument(taskIdStr).subscribe({
    next: (blob) => {
      // Create a blob URL and open in new tab
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Alternatively, implement a proper document viewer
      // this.openDocumentViewer(blob);
    },
    error: (err) => {
      console.error('Error loading document:', err);
      this.errorMessage = 'Failed to load document';
    }
  });
}

// Or for direct download:
downloadDocument(taskId: number) {
   const taskIdStr = taskId.toString();
  this.tasksService.getTaskDocument(taskIdStr).subscribe({
    next: (blob) => {
      const a = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = `task-${taskId}-document.pdf`; // or get filename from headers
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Error downloading document:', err);
      this.errorMessage = 'Failed to download document';
    }
  });
}

  saveTaskUpdates(task: any, updates: any): void {
    this.tasksService.updateTask(task.task_id, updates).subscribe({
      next: (updatedTask) => {
        // Update the local task data
        Object.assign(task, updatedTask);
        this.editingTaskId = null;
        this.selectedFile = null;
        this.uploadProgress = 0;
      },
      error: (err) => {
        this.errorMessage = 'Failed to update task. Please try again.';
        console.error(err);
      }
    });
  }

}