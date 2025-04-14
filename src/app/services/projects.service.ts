// project.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Project methods
  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/projects`, { 
      headers: this.getAuthHeaders() 
    });
  }

  createProject(projectData: any): Observable<any> {
    const formattedProject = {
      ...projectData,
      deadline: projectData.deadline ? this.formatDateForBackend(projectData.deadline) : null,
      project_manager_id: projectData.pm_id || null
    };
    return this.http.post(`${this.apiUrl}/projects`, formattedProject, { 
      headers: this.getAuthHeaders() 
    });
  }

  updateProject(projectId: number, projectData: any): Observable<any> {
    const formattedProject = {
      ...projectData,
      deadline: projectData.deadline ? this.formatDateForBackend(projectData.deadline) : null
    };
    return this.http.put(`${this.apiUrl}/projects/${projectId}`, formattedProject, { 
      headers: this.getAuthHeaders() 
    });
  }

  deleteProject(projectId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // Project Manager methods
  getProjectManagers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users?role=Project Manager`, {
      headers: this.getAuthHeaders()
    });
  }

  // Task methods
  getTasks(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tasks/${projectId}`, {
      headers: this.getAuthHeaders()
    });
  }

  createTask(taskData: any): Observable<any> {
    const formattedTask = {
      ...taskData,
      deadline: taskData.due_date ? new Date(taskData.due_date).toISOString().split('T')[0] : null,
      project_id: Number(taskData.project_id),
      assigned_to: taskData.assigned_to ? Number(taskData.assigned_to) : null
    };
    return this.http.post(`${this.apiUrl}/tasks`, formattedTask, {
      headers: this.getAuthHeaders()
    });
  }

  deleteTask(taskId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tasks/${taskId}`, {
      headers: this.getAuthHeaders()
    });
  }

  private formatDateForBackend(dateString: string): string {
    return dateString.includes('T') ? dateString.split('T')[0] : dateString;
  }
}