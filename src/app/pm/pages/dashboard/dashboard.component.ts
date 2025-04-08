import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBan,
  faBars,
  faCalendarDay,
  faChartLine,
  faCircleCheck,
  faClock,
  faFlag,
  faListCheck,
  faPlus,
  faPlusCircle,
  faSpinner,
  faTimes,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { Chart, ChartConfiguration, registerables, TooltipItem } from 'chart.js';
import { AuthService } from '../../../auth.service';
import { ProjectStatsChartComponent } from '../../components/charts/charts.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { OverviewCardsComponent } from '../../components/overview-cards/overview-cards.component';

Chart.register(...registerables);

@Component({
  selector: 'app-pm-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    NavbarComponent,
    OverviewCardsComponent,
    ProjectStatsChartComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class PmDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('statusChart') statusChartRef!: ElementRef;
  statusChart!: Chart;

  
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  get progressMetrics() {
    return [
      { value: this.activeProjectsCount, label: 'Active' },
      { value: this.behindScheduleProjectsCount, label: 'Behind Schedule' },
      { value: this.highRiskProjectsCount, label: 'High Risk' }
    ];
  }
  
  // FontAwesome icons
  faListCheck = faListCheck;
  faPlus = faPlus;
  faClock = faClock;
  faFlag = faFlag;
  faBars = faBars;
  faCircleCheck = faCircleCheck;
  faSpinner = faSpinner;
  faTimes = faTimes;
  faPlusCircle = faPlusCircle;
  faChartLine = faChartLine;
  faUsers = faUsers;
  faCalendarDay = faCalendarDay;
  faBan = faBan;

  // Dashboard metrics
  totalProjectsCount = 0;
  activeProjectsCount = 0;
  completedProjectsCount = 0;
  behindScheduleProjectsCount = 0;
  highRiskProjectsCount = 0;
  managedTeamsCount = 0;
  totalTeamMembers = 0;
  
  // Task metrics (added these missing properties)
  totalTasksCount = 0;
  todoTasksCount = 0;
  inProgressTasksCount = 0;
  completedTasksCount = 0;
  overdueTasksCount = 0;

  // Data
  projectManagers: any[] = [];
  projects: any[] = [];
  teams: any[] = [];
  tasks: any[] = [];
  users: any[] = []; // Added missing users array
  recentProjects: any[] = [];
  statusDistribution: any = {};
  isLoading = false;
  errorMessage = '';
  username = '';
  userId = 0;
  private apiUrl = 'http://localhost:8080/api';

  newProject: any = {
    name: '',
    description: '',
    status: 'Active',
    start_date: '',
    end_date: '',
    pm_id: null
  };
  
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
  selectedProject: any = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();  // This loads projects
    this.loadTasks();     // This loads tasks
    this.username = localStorage.getItem('currentUser') || '';
    this.userId = Number(localStorage.getItem('userId')) || 0;

  
    this.loadDashboardData();  // This ALSO loads projects and teams
    
  }

  ngAfterViewInit(): void {
    this.renderStatusChart();
  }

  
  

  loadProjects() {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/projects`, { 
      headers: this.getAuthHeaders() 
    }).subscribe({
      next: (data) => {
        this.projects = data;
        this.countProjectsByStatus();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.errorMessage = 'Failed to load projects';
        this.isLoading = false;
      }
    });
  }
  isOverdue(deadline: string): boolean {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  }
  countProjectsByStatus() {
    this.totalProjectsCount = this.projects.length;
    this.activeProjectsCount = this.projects.filter(p => p.status === 'Active').length;
    this.completedProjectsCount = this.projects.filter(p => p.status === 'Completed').length;
    this.behindScheduleProjectsCount = this.projects.filter(p => this.isProjectBehindSchedule(p)).length;
    this.highRiskProjectsCount = this.projects.filter(p => p.risk_level === 'High').length;
  }

  private isProjectBehindSchedule(project: any): boolean {
    if (project.status === 'Completed') return false;
    if (!project.deadline) return false;
    
    const deadline = new Date(project.deadline);
    const today = new Date();
    
    const timeDiff = deadline.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    const elapsedPercentage = (project.elapsed_days / project.planned_duration) * 100;
    const completionPercentage = project.completion_percentage || 0;
    
    return daysRemaining < 0 || (elapsedPercentage > completionPercentage + 20);
  }

  loadTasks() {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/tasks`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.countTasksByStatus();
        this.renderStatusChart();
        this.isLoading = false;
        
        // Optional: Log loaded tasks for debugging
        console.log('Loaded tasks:', tasks);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.errorMessage = 'Failed to load tasks';
        this.isLoading = false;
        
        // Handle unauthorized error
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
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



  getCompletionPercentage(): number {
    if (this.totalTasksCount === 0) return 0;
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

  loadTeams() {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/teams`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.teams = data.map(team => ({
          ...team,
          members: []
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.log(error);
        this.isLoading = false;
      }
    });
  }

  loadUsers() {
    this.http.get<any[]>(`${this.apiUrl}/users`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => this.users = data,
      error: (error) => console.error('Error loading users:', error)
    });
  }

  

  loadDashboardData() {
    this.isLoading = true;
    
    this.http.get<any[]>(`${this.apiUrl}/projects?pm=${this.userId}`).subscribe({
      next: (projects) => {
        this.projects = projects;
        this.recentProjects = projects.slice(0, 3);
        this.countProjectsByStatus();
        
        this.http.get<any>(`${this.apiUrl}/projects/status`).subscribe({
          next: (statusData) => {
            this.statusDistribution = statusData;
            this.initStatusChart();
          },
          error: (err) => this.handleError(err)
        });

        this.http.get<any[]>(`${this.apiUrl}/teams?pm=${this.userId}`).subscribe({
          next: (teams) => {
            this.teams = teams;
            this.calculateTeamStats();
          },
          error: (err) => this.handleError(err)
        });
      },
      error: (err) => this.handleError(err)
    });
  }

 
  calculateTeamStats() {
    this.managedTeamsCount = this.teams.length;
  }

  initStatusChart() {
    if (this.statusChart) {
        this.statusChart.destroy();
    }

    const ctx = this.statusChartRef.nativeElement.getContext('2d');
    const labels = Object.keys(this.statusDistribution);
    
    // Ensure all values are numbers
    const data = Object.values(this.statusDistribution).map(val => {
        const num = Number(val);
        return isNaN(num) ? 0 : num;
    });

    this.statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#4e73df', // Active
                    '#1cc88a', // Completed
                    '#f6c23e', // On Hold
                    '#e74a3b', // Cancelled
                    '#858796'  // Other
                ],
                hoverBackgroundColor: [
                    '#2e59d9',
                    '#17a673',
                    '#dda20a',
                    '#be2617',
                    '#6c757d'
                ],
                hoverBorderColor: "rgba(234, 236, 244, 1)",
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = Number(context.raw) || 0;
                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

 getOverallCompletionPercentage(): number {
    const totalProjects = this.projects.length;
    const completedProjects = this.projects.filter(project => project.status === 'Completed').length;

    if (totalProjects === 0) return 0; // Avoid division by zero

    return (completedProjects / totalProjects) * 100;
  }

  getStatusClass(status: string): string {
    switch(status.toLowerCase()) {
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      case 'on hold': return 'status-on-hold';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  }

  createProject() {
    this.router.navigate(['/projects/create']);
  }

  manageTeams() {
    this.router.navigate(['/teams/manage']);
  }

  private handleError(err: any) {
    this.isLoading = false;
    this.errorMessage = `Error loading data: ${err.statusText || 'Unknown error'}`;
    
    if (err.status === 401) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  renderStatusChart(): void {
    if (this.statusChart) {
      this.statusChart.destroy();
    }

    const data = {
      labels: ['To Do', 'In Progress', 'Completed', 'Overdue'],
      datasets: [{
        label: 'Task Status',
        data: [
          this.todoTasksCount,
          this.inProgressTasksCount,
          this.completedTasksCount,
          this.overdueTasksCount
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };

    const config: ChartConfiguration<'radar'> = {
      type: 'radar',
      data: data,
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: (context: TooltipItem<'radar'>) =>
                `${context.label}: ${context.formattedValue}`
            }
          }
        },
        scales: {
          r: {
            angleLines: {
              display: true
            },
            suggestedMin: 0
          }
        }
      }
    };

    this.statusChart = new Chart(this.statusChartRef.nativeElement, config);
  }
}

