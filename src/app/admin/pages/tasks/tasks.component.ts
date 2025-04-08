import { CommonModule, Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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
  faEdit,
  faExclamationTriangle,
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

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  // FontAwesome icons
  faArrowLeft = faArrowLeft;
  faTasks = faTasks;
  faListOl = faListOl;
  faCheckCircle = faCheckCircle;
  faClipboardList=faClipboardList;
  faSpinner = faSpinner;
  faExclamationTriangle = faExclamationTriangle;
  faPlusCircle = faPlusCircle;
  faSearch = faSearch;
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

  private apiUrl = 'http://localhost:8080/api';
  tasks: any[] = [];
  filteredTasks: any[] = [];
  projects: any[] = [];
  users: any[] = [];
  selectedTask: any = null;
  showTaskForm = false;
  
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

  constructor(
    private http: HttpClient,
    private location: Location
  ) {}

  ngOnInit() {
    this.loadProjects();
    this.loadUsers();
    this.loadTasks();
  }

  viewTaskDetails(task: any) {
    this.selectedTask = task;
  }

  loadProjects() {
    this.http.get<any[]>(`${this.apiUrl}/projects`, {
      headers: this.getAuthHeaders()
    }).subscribe({
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
    this.http.get<any[]>(`${this.apiUrl}/users`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users';
      }
    });
  }

  loadTasks() {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/tasks`, { 
      headers: this.getAuthHeaders() 
    }).subscribe({
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
    
    this.http.post(`${this.apiUrl}/tasks`, payload, { 
      headers: this.getAuthHeaders() 
    }).subscribe({
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
  
    this.http.put(`${this.apiUrl}/tasks/${this.editTaskData.task_id}`, 
      payload, { 
        headers: this.getAuthHeaders() 
      }).subscribe({
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
  
      this.http.delete(`${this.apiUrl}/tasks/${taskId}`, { 
        headers: this.getAuthHeaders(),
        observe: 'response'
      }).subscribe({
        next: (response) => {
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

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
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
}