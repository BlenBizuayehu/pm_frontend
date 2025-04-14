import { CommonModule, Location } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faAlignLeft,
  faArrowLeft,
  faBan,
  faCalendarDay,
  faCheckCircle,
  faClipboardCheck,
  faClipboardList,
  faDownload,
  faEdit,
  faExclamationTriangle,
  faEye,
  faFile,
  faFlag,
  faHeading,
  faListOl,
  faListUl,
  faPlusCircle,
  faProjectDiagram,
  faSave,
  faSearch,
  faSpinner,
  faTasks,
  faTimes,
  faTrashAlt,
  faUserTag
} from '@fortawesome/free-solid-svg-icons';
import { DocumentViewerComponent } from '../../../components/document-viewer/document-viewer.component';
import { DocumentService } from '../../../services/document-service.service';
import { TasksService } from '../../../services/task.service'; // Import the service
@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, DocumentViewerComponent],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})


export class TasksComponent implements OnInit {
documentPaths: {[taskId: number]: string | null} = {};  // FontAwesome icons
  faArrowLeft = faArrowLeft;
  faEye=faEye;
  faDownload=faDownload;
  faTasks = faTasks;
  faListOl = faListOl;
  faCheckCircle = faCheckCircle;
  faClipboardList = faClipboardList;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;
  faPlusCircle = faPlusCircle;
  faSearch = faSearch;
  faFile=faFile;
  faEdit = faEdit;
  faTrashAlt = faTrashAlt;
  faHeading = faHeading;
  faClipboardCheck = faClipboardCheck;
  faFlag = faFlag;
  faAlignLeft = faAlignLeft;
  faCalendarDay = faCalendarDay;
  faProjectDiagram = faProjectDiagram;
  faUserTag = faUserTag;
  faListUl = faListUl;
  faBan = faBan;
  faTimes = faTimes;
  faSave = faSave;

  tasks: any[] = [];
  filteredTasks: any[] = [];
  projects: any[] = [];
  users: any[] = [];
  selectedTask: any = null;
  showTaskForm = false;
  tasksWithDocuments: any[] = [];
  
  // Task metrics
  totalTasks = 0;
  completedTasksCount = 0;
  inProgressTasksCount = 0;
  overdueTasksCount = 0;
  
  newTask: any = {
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    deadline: null,
    project_id: null,
    assigned_to: null
  };
  
  editTaskData: any = null;
  statuses = ['To Do', 'In Progress', 'Done', 'Blocked'];
  priorities = ['Low', 'Medium', 'High', 'Critical'];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  // Add to your component class
  taskDocuments: any[] = [];
  documentLoading = false;
  selectedFile: File | null = null;
  uploading = false;
  uploadProgress = 0;

  constructor(
    private documentService: DocumentService,
    private taskService: TasksService, // Inject the service
    private location: Location
  ) {}

  ngOnInit() {
    this.loadProjects();
    this.loadUsers();
    this.loadTasks();
  }

  
 

  loadProjects() {
    this.taskService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.errorMessage = 'Failed to load projects';
      }
    });
  }

  loadUsers() {
    this.taskService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users';
      }
    });
  }


// Add to your component


// Or for direct download:

getFileType(filename: string): string {
  if (!filename) return 'Unknown';
  const ext = filename.split('.').pop()?.toLowerCase();
  switch(ext) {
    case 'pdf': return 'PDF Document';
    case 'doc': case 'docx': return 'Word Document';
    case 'xls': case 'xlsx': return 'Excel Document';
    default: return ext ? ext.toUpperCase() + ' File' : 'Document';
  }
}

  loadTasks() {
    this.isLoading = true;
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.filteredTasks = [...data];
        this.updateTaskStats();
        this.isLoading = false;
        
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.errorMessage = 'Failed to load tasks';
        this.isLoading = false;
      }
    });
  }

  updateTaskStats() {
    this.totalTasks = this.tasks.length;
    this.completedTasksCount = this.tasks.filter(t => t.status === 'Done').length;
    this.inProgressTasksCount = this.tasks.filter(t => t.status === 'In Progress').length;
    this.overdueTasksCount = this.tasks.filter(t => this.isOverdue(t.deadline)).length;
  }

  createTask() {
    this.isLoading = true;
    const formattedDeadline = this.newTask.deadline ? 
      new Date(this.newTask.deadline).toISOString().split('T')[0] : 
      null;
    
    const payload = {
      ...this.newTask,
      deadline: formattedDeadline,
      project_id: this.newTask.project_id ? Number(this.newTask.project_id) : null,
      assigned_to: this.newTask.assigned_to ? Number(this.newTask.assigned_to) : null
    };
    
    this.taskService.createTask(payload).subscribe({
      next: () => {
        this.loadTasks();
        this.resetNewTaskForm();
        this.showTaskForm = false;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating task:', error);
        this.errorMessage = 'Failed to create task';
        this.isLoading = false;
      }
    });
  }

  startEdit(task: any) {
    this.editTaskData = { ...task };
    this.showTaskForm = true;
  }

  updateTask() {
    if (!this.editTaskData?.task_id) {
      console.error('Task ID is missing');
      return;
    }
  
    this.isLoading = true;
    
    const formattedDeadline = this.editTaskData.deadline ? 
      new Date(this.editTaskData.deadline).toISOString().split('T')[0] : 
      null;
  
    const payload = {
      ...this.editTaskData,
      deadline: formattedDeadline,
      project_id: this.editTaskData.project_id ? Number(this.editTaskData.project_id) : null,
      assigned_to: this.editTaskData.assigned_to ? Number(this.editTaskData.assigned_to) : null
    };
  
    delete payload.task_id;
  
    this.taskService.updateTask(this.editTaskData.task_id, payload).subscribe({
      next: () => {
        this.loadTasks();
        this.cancelEdit();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating task:', error);
        this.errorMessage = error.error?.message || 'Failed to update task';
        this.isLoading = false;
      }
    });
  }
  
  deleteTask(taskId: number) {
    if (!taskId || isNaN(taskId)) {
      this.errorMessage = 'Invalid task ID';
      return;
    }
  
    const taskToDelete = this.tasks.find(t => t.task_id === taskId);
    const taskName = taskToDelete?.title || 'this task';
  
    if (confirm(`Are you sure you want to delete "${taskName}"? This action cannot be undone.`)) {
      this.isLoading = true;
      this.errorMessage = '';
  
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.task_id !== taskId);
          this.filteredTasks = this.filteredTasks.filter(t => t.task_id !== taskId);
          this.updateTaskStats();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Delete error:', error);
          
          switch (error.status) {
            case 404:
              this.errorMessage = 'Task not found - it may have already been deleted';
              this.tasks = this.tasks.filter(t => t.task_id !== taskId);
              this.filteredTasks = this.filteredTasks.filter(t => t.task_id !== taskId);
              this.updateTaskStats();
              break;
            case 403:
              this.errorMessage = 'You are not authorized to delete this task';
              break;
            case 409:
              this.errorMessage = 'Cannot delete task - it may be linked to other records';
              break;
            default:
              this.errorMessage = 'Delete failed. Please try again later.';
          }
          
          this.isLoading = false;
        }
      });
    }
  }
  
  // All other methods remain exactly the same
  cancelEdit() {
    this.editTaskData = null;
    this.showTaskForm = false;
  }

  resetNewTaskForm() {
    this.newTask = {
      title: '',
      description: '',
      status: 'To Do',
      priority: 'Medium',
      deadline: null,
      project_id: null,
      assigned_to: null
    };
  }

  getProjectName(projectId: number): string {
    const project = this.projects.find(p => p.project_id === projectId);
    return project ? project.name : 'Unassigned';
  }

  getUserName(userId: number): string {
    const user = this.users.find(u => u.user_id === userId);
    return user ? user.full_name : 'Unassigned';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Not set';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  getStatusIcon(status: string): string {
    switch(status.toLowerCase()) {
      case 'to do': return 'far fa-circle';
      case 'in progress': return 'fas fa-spinner';
      case 'done': return 'fas fa-check-circle';
      case 'blocked': return 'fas fa-ban';
      default: return 'fas fa-tasks';
    }
  }

  isOverdue(deadline: string): boolean {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  }

  filterTasks(): void {
    if (!this.searchQuery) {
      this.filteredTasks = [...this.tasks];
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.filteredTasks = this.tasks.filter(task => 
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query)) ||
      task.status.toLowerCase().includes(query) ||
      task.priority.toLowerCase().includes(query) ||
      this.getProjectName(task.project_id)?.toLowerCase().includes(query) ||
      this.getUserName(task.assigned_to)?.toLowerCase().includes(query)
    );
  }

  goBack() {
    this.location.back();
  }

  loadDocumentPaths() {
    this.tasks.forEach(task => {
      if (task.task_id) {
        this.taskService.getDocumentPath(task.task_id).subscribe({
          next: (docInfo) => {
            if (docInfo?.exists) {
              task.documentPath = docInfo.path;
              task.hasDocument = true;
            } else {
              task.hasDocument = false;
            }
          },
          error: (err) => {
            console.error('Error loading document path:', err);
            task.hasDocument = false;
          }
        });
      }
    });
  }

  // In your component class
documentStatus: any = {}; // Object to store document statuses

checkDocumentStatus(taskId: number) {
  this.taskService.getDocumentInfo(taskId).subscribe({
    next: (result) => {
      this.documentStatus[taskId] = {
        exists: result.exists,
        path: result.path,
        error: result.error,
        loading: false
      };
    },
    error: (err) => {
      this.documentStatus[taskId] = {
        exists: false,
        path: null,
        error: err.message,
        loading: false
      };
    }
  });
}

// Call this for each task when loading
loadDocumentStatuses() {
  this.tasks.forEach(task => {
    if (task.task_id) {
      this.documentStatus[task.task_id] = { loading: true };
      this.checkDocumentStatus(task.task_id);
    }
  });
}

loadTaskDocuments(taskId: number): void {
  console.log('Loading documents for task:', taskId); // Debug
  this.documentLoading = true;
  this.taskDocuments = [];
  
  this.taskService.getTaskDocuments(taskId).subscribe({
    next: (docs) => {
      console.log('Received documents:', docs); // Debug
      this.taskDocuments = docs || [];
      this.documentLoading = false;
      console.log('Documents loaded:', docs);
    },
    error: (err) => {
      console.error('Error loading documents:', err);
      this.taskDocuments = [];
      this.documentLoading = false;
    },
    complete: () => {
      console.log('Document load complete'); // Debug
    }
  });
}

taskDocument: any = null;
documentError: string | null = null;


loadDocumentInfo(taskId: number): void {
  this.documentLoading = true;
  this.documentError = null;
  this.taskDocument = null;

  this.taskService.getDocumentInfo(taskId).subscribe({
    next: (docInfo) => {
      this.taskDocument = docInfo;
      this.documentLoading = false;
    },
    error: (err) => {
      this.documentError = err.message;
      this.documentLoading = false;
    }
  });
}

viewTaskDetails(task: any): void {
  this.selectedTask = task;
  this.loadTaskDocuments(task.task_id);
}

formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

onFileSelected(event: any): void {
  this.selectedFile = event.target.files[0];
}


downloadDocument(doc: any): void {
  if (!doc?.download_url || !doc?.document_path) {
    console.error('Missing required document properties');
    return;
  }

  this.taskService.getTaskDocument(doc.download_url).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.document_path.split('/').pop() || `document-${Date.now()}`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Error downloading document:', err);
      this.errorMessage = 'Failed to download document. Please try again.';
    }
  });
}}