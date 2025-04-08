import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  private apiUrl = 'http://localhost:8080/api';
  reports: any[] = [];
  projects: any[] = [];
  users: any[] = [];
  selectedReport: any = null;
  
  newReport: any = {
    project_id: null,
    generated_by: null,
    report_type: 'Progress',
    report_data: ''
  };
  
  editReportData: any = null;
  reportTypes = ['Progress', 'Performance'];
  isLoading = false;
  errorMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadProjects();
    this.loadUsers();
    this.loadReports();
  }

  viewReportDetails(report: any) {
    this.selectedReport = report;
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

  loadReports() {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/reports`, { 
      headers: this.getAuthHeaders() 
    }).subscribe({
      next: (data) => {
        this.reports = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.errorMessage = 'Failed to load reports';
        this.isLoading = false;
      }
    });
  }

  createReport() {
    this.isLoading = true;
    const payload = {
      ...this.newReport,
      project_id: this.newReport.project_id ? Number(this.newReport.project_id) : null,
      generated_by: this.newReport.generated_by ? Number(this.newReport.generated_by) : null
    };
    
    this.http.post(`${this.apiUrl}/reports`, payload, { 
      headers: this.getAuthHeaders() 
    }).subscribe({
      next: () => {
        this.loadReports();
        this.resetNewReportForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating report:', error);
        this.errorMessage = 'Failed to create report';
        this.isLoading = false;
      }
    });
  }

  startEdit(report: any) {
    this.editReportData = { ...report };
  }

  updateReport() {
    if (!this.editReportData?.id) {
      console.error('Report ID is missing');
      return;
    }

    this.isLoading = true;
    const payload = {
      ...this.editReportData,
      project_id: this.editReportData.project_id ? Number(this.editReportData.project_id) : null,
      generated_by: this.editReportData.generated_by ? Number(this.editReportData.generated_by) : null
    };

    this.http.put(`${this.apiUrl}/reports/${this.editReportData.id}`, 
      payload, { 
        headers: this.getAuthHeaders() 
      }).subscribe({
        next: () => {
          this.loadReports();
          this.cancelEdit();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating report:', error);
          this.errorMessage = 'Failed to update report';
          this.isLoading = false;
        }
      });
  }

  deleteReport(reportId: number) {
    if (!reportId) {
      this.errorMessage = 'Invalid report ID';
      return;
    }

    if (confirm('Are you sure you want to delete this report?')) {
      this.isLoading = true;
      this.http.delete(`${this.apiUrl}/reports/${reportId}`, { 
        headers: this.getAuthHeaders() 
      }).subscribe({
        next: () => {
          this.reports = this.reports.filter(r => r.id !== reportId);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.errorMessage = error.status === 404 
            ? 'Report not found' 
            : 'Delete failed - please try again';
          this.isLoading = false;
        }
      });
    }
  }

  cancelEdit() {
    this.editReportData = null;
  }

  resetNewReportForm() {
    this.newReport = {
      project_id: null,
      generated_by: null,
      report_type: 'Progress',
      report_data: ''
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
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.name : 'Unassigned';
  }

  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.full_name : 'System';
  }

  formatDate(dateString: string): string {
    return dateString ? new Date(dateString).toLocaleString() : 'Not available';
  }
}