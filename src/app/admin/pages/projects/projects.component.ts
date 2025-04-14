import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from '../../../services/projects.service'; // Import the service

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  faArrowLeft = faArrowLeft;
  faProjectDiagram = faProjectDiagram;
  private modalService = inject(NgbModal);
  private projectService = inject(ProjectService); // Inject the service

  // All your existing properties remain the same
  projects: any[] = [];
  tasks: any[] = [];
  projectManagers: any[] = [];
  newProject: any = {
    name: '',
    description: '',
    status: 'Active',
    deadline: '',
    pm_id: null
  };
  successMessage: any;
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
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProjectManagers();
    this.loadProjects();
  }

  // Modal handling remains the same
  openModal(content: any) {
    this.modalService.open(content);
  }

  viewProjectDetails(project: any) {
    this.selectedProject = project;
    if (project.project_id) {
      this.loadTasks(project.project_id);
    }
  }

  // Updated methods using the service
  loadProjectManagers() {
    this.projectService.getProjectManagers().subscribe({
      next: (data) => this.projectManagers = data,
      error: (error) => console.error('Error loading PMs:', error)
    });
  }

  loadProjects() {
    this.isLoading = true;
    this.projectService.getProjects().subscribe({
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
    this.location.back();
  }

  createProject() {
    this.isLoading = true;
    this.projectService.createProject(this.newProject).subscribe({
      next: () => {
        this.loadProjects();
        this.resetNewProjectForm();
        this.modalService.dismissAll();
        this.isLoading = false;
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
      deadline: project.deadline ? project.deadline.split('T')[0] : ''
    };
  }

  updateProject() {
    if (!this.editProjectData?.project_id) {
      console.error('Project ID is missing');
      return;
    }

    this.isLoading = true;
    this.projectService.updateProject(this.editProjectData.project_id, this.editProjectData)
      .subscribe({
        next: () => {
          this.loadProjects();
          this.cancelEdit();
          this.modalService.dismissAll();
          this.isLoading = false;
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

  deleteProject(projectId: number) {
    if (!projectId) {
      this.errorMessage = 'Invalid project ID';
      return;
    }

    if (confirm('Are you sure you want to delete this project?')) {
      this.isLoading = true;
      this.projectService.deleteProject(projectId).subscribe({
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

  // Rest of your methods remain the same (they don't need changes)
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
      deadline: '',
      pm_id: null
    };
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

    this.isLoading = true;
    this.projectService.createTask(this.newTask).subscribe({
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
    
    this.projectService.getTasks(projectId).subscribe({
      next: (data) => {
        this.tasks = data.map(task => ({
          ...task,
          deadline: task.deadline ? new Date(task.deadline) : null
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.errorMessage = error.status === 404 
          ? 'No tasks found for this project' 
          : 'Failed to load tasks';
        this.tasks = [];
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
      this.projectService.deleteTask(taskId).subscribe({
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
    console.log('Editing task:', task);
  }

  navigateToTasks() {
    this.router.navigate(['/tasks']);
  }

  showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 5000);
  }
}