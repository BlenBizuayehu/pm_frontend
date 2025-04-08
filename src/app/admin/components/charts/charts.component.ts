import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

interface StatusData {
  [key: string]: number;
}

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit {
  projectChart: any;
  taskChart: any;
  isLoading = true;
  errorMessage = '';
  
  totalProjects: number = 0;
  totalTasks: number = 0;
  completionRate: number = 0;

  constructor(private http: HttpClient) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.http.get<StatusData>('http://localhost:8080/api/project-status').subscribe({
      next: (projectData) => {
        this.createProjectChart(projectData);
        this.totalProjects = this.calculateTotal(projectData);
        this.checkLoadingComplete();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load project data';
        this.isLoading = false;
      }
    });

    this.http.get<StatusData>('http://localhost:8080/api/task-status').subscribe({
      next: (taskData) => {
        this.createTaskChart(taskData);
        this.totalTasks = this.calculateTotal(taskData);
        this.completionRate = this.calculateCompletionRate(taskData);
        this.checkLoadingComplete();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load task data';
        this.isLoading = false;
      }
    });
  }

  private calculateTotal(data: StatusData): number {
    return Object.values(data).reduce((sum: number, count: number) => sum + count, 0);
  }

  private calculateCompletionRate(taskData: StatusData): number {
    const total = this.calculateTotal(taskData);
    const completed = taskData['Done'] || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  private checkLoadingComplete() {
    if (this.projectChart && this.taskChart) {
      this.isLoading = false;
    }
  }

  private createProjectChart(data: StatusData) {
    const ctx = document.getElementById('projectChart') as HTMLCanvasElement;
    this.projectChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(data),
        datasets: [{
          data: Object.values(data),
          backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e']
        }]
      }
    });
  }

  private createTaskChart(data: StatusData) {
    const ctx = document.getElementById('taskChart') as HTMLCanvasElement;
    this.taskChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Tasks',
          data: Object.values(data),
          backgroundColor: '#36b9cc'
        }]
      }
    });
  }
}