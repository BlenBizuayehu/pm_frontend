import { CommonModule, Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faProjectDiagram
} from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; // Add this import



@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule,FontAwesomeModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  faArrowLeft=faArrowLeft;
  faProjectDiagram=faProjectDiagram;
  private apiUrl = 'http://localhost:8080/api';
  private modalService = inject(NgbModal); 
  projects: any[] = [];
  tasks: any[] = [];
  projectManagers: any[] = [];
  newProject: any = {
    name: '',
    description: '',
    status: 'Active',
    deadline:'',
    pm_id: null
  };

  successMessage:any;
  
  newTask: any = {
    title: '',
    description: '',
    status: 'Not Started',
    priority: 'Medium',
    due_date: null,
    assigned_to: null,
    project_id: null
  };
  
  editProjectData: any = null;
  statuses = ['Active', 'Completed', 'In Progress'];
  isLoading = false;
  errorMessage = '';
  selectedProject: any = null;
  minDate: string = new Date().toISOString().split('T')[0];

  constructor(
    private location: Location,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {

    const today = new Date();
    this.loadProjectManagers();
    this.loadProjects();
  }

  // Add this method to open modals properly
  openModal(content: any) {
    this.modalService.open(content);
  }

  viewProjectDetails(project: any) {
    this.selectedProject = project;
    if (project.project_id) {
      this.loadTasks(project.project_id);
    }
  }

  loadProjectManagers() {
    this.http.get<any[]>(`${this.apiUrl}/users?role=Project Manager`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => this.projectManagers = data,
      error: (error) => console.error('Error loading PMs:', error)
    });
  }

  loadProjects() {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/projects`, { 
      headers: this.getAuthHeaders() 
    }).subscribe({
      next: (data) => {
        this.projects = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.errorMessage = 'Failed to load projects';
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.location.back(); // Make sure to import Location from '@angular/common'
  }

createProject() {
    // Format the deadline as YYYY-MM-DD string
    const formattedProject = {
      ...this.newProject,
      deadline: this.newProject.deadline ? 
               this.formatDateForBackend(this.newProject.deadline) : 
               null,
      project_manager_id: this.newProject.pm_id || null
    };

    this.isLoading = true;
    this.http.post(`${this.apiUrl}/projects`, formattedProject, { 
      headers: this.getAuthHeaders() 
    }).subscribe({
      next: () => {
        this.loadProjects();
        this.resetNewProjectForm();
        this.modalService.dismissAll();
      },
      error: (error) => {
        console.error('Error creating project:', error);
        this.errorMessage = 'Failed to create project';
        if (error.error?.details) {
          this.errorMessage += ': ' + error.error.details;
        }
        this.isLoading = false;
      }
    });
  }

  startEdit(project: any) {
    this.editProjectData = { 
      ...project,
      // Convert ISO string to date input format (YYYY-MM-DD)
      deadline: project.deadline ? project.deadline.split('T')[0] : ''
    };
  }

  updateProject() {
    if (!this.editProjectData?.project_id) {
      console.error('Project ID is missing');
      return;
    }

    const formattedProject = {
      ...this.editProjectData,
      deadline: this.editProjectData.deadline ? 
                this.formatDateForBackend(this.editProjectData.deadline) : 
                null
    };

    this.isLoading = true;
    this.http.put(`${this.apiUrl}/projects/${this.editProjectData.project_id}`, 
      formattedProject, { 
        headers: this.getAuthHeaders() 
      }).subscribe({
        next: () => {
          this.loadProjects();
          this.cancelEdit();
          this.modalService.dismissAll();
        },
        error: (error) => {
          console.error('Error updating project:', error);
          this.errorMessage = 'Failed to update project';
          if (error.error?.details) {
            this.errorMessage += ': ' + error.error.details;
          }
          this.isLoading = false;
        }
      });
  }

  private formatDateForBackend(dateString: string): string {
    // Ensure the date is in YYYY-MM-DD format
    if (dateString.includes('T')) {
        return dateString.split('T')[0];
    }
    return dateString;
}

  deleteProject(projectId: number) {
    if (!projectId) {
      this.errorMessage = 'Invalid project ID';
      return;
    }

    if (confirm('Are you sure you want to delete this project?')) {
      this.isLoading = true;
      this.http.delete(`${this.apiUrl}/projects/${projectId}`, { 
        headers: this.getAuthHeaders() 
      }).subscribe({
        next: () => {
          this.projects = this.projects.filter(p => p.project_id !== projectId);
          if (this.selectedProject?.project_id === projectId) {
            this.selectedProject = null;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.errorMessage = error.status === 404 
            ? 'Project not found' 
            : 'Delete failed - please try again';
          this.isLoading = false;
        }
      });
    }
  }

  cancelEdit() {
    this.editProjectData = null;
  }

  resetNewProjectForm() {
    this.newProject = {
      name: '',
      description: '',
      status: 'Active',
      start_date: '',
      end_date: '',
      deadline:'',
      pm_id: null
    };
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getPmName(pmId: number): string {
    const pm = this.projectManagers.find(m => m.id === pmId);
    return pm ? pm.full_name : 'Unassigned';
  }

  openAddTaskModal(projectId: number, content: any) {
    this.newTask.project_id = projectId;
    this.modalService.open(content);
  }


  
  createTask() {
    if (!this.newTask.project_id) {
      this.errorMessage = 'Please select a project';
      return;
    }
  
    // Format the date to ISO string (without time)
    const formattedDueDate = this.newTask.due_date ? 
      new Date(this.newTask.due_date).toISOString().split('T')[0] : 
      null;
  
    const taskData = {
      ...this.newTask,
      deadline: formattedDueDate,  // Send as YYYY-MM-DD string
      project_id: Number(this.newTask.project_id),
      assigned_to: this.newTask.assigned_to ? Number(this.newTask.assigned_to) : null
    };
  
    this.isLoading = true;
    this.http.post(`${this.apiUrl}/tasks`, taskData, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => {
        this.loadTasks(this.newTask.project_id);
        this.resetTaskForm();
        this.modalService.dismissAll();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating task:', error);
        this.errorMessage = 'Failed to create task';
        this.isLoading = false;
      }
    });
  }
  resetTaskForm() {
    this.newTask = {
      title: '',
      description: '',
      status: 'Not Started',
      priority: 'Medium',
      due_date: null,
      assigned_to: null,
      project_id: null
    };
  }
  
  loadTasks(projectId: number) {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.http.get<any[]>(`${this.apiUrl}/tasks/${projectId}`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.tasks = data.map(task => ({
          ...task,
          // Format the due date for display if needed
          deadline: task.deadline ? new Date(task.deadline) : null
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.errorMessage = error.status === 404 
          ? 'No tasks found for this project' 
          : 'Failed to load tasks';
        this.tasks = []; // Clear previous tasks on error
        this.isLoading = false;
      }
    });
}

  deleteTask(taskId: number) {
    if (!taskId) {
      this.errorMessage = 'Invalid task ID';
      return;
    }

    if (confirm('Are you sure you want to delete this task?')) {
      this.isLoading = true;
      this.http.delete(`${this.apiUrl}/tasks/${taskId}`, {
        headers: this.getAuthHeaders()
      }).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.task_id !== taskId);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.errorMessage = error.status === 404 
            ? 'Task not found' 
            : 'Delete failed - please try again';
          this.isLoading = false;
        }
      });
    }
  }

  startEditTask(task: any) {
    // Implement task editing logic here
    console.log('Editing task:', task);
    // Example implementation might open an edit modal:
    // this.editTaskData = { ...task };
    // this.openModal(this.editTaskModal);
  }

  navigateToTasks() {
    this.router.navigate(['/tasks']); 
    // Or use: this.router.navigate(['/tasks'], { queryParams: { projectId } });
  }

  showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 5000);
  }
}