import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Fetch all tasks
  getTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tasks`, { headers: this.getAuthHeaders() });
  }

  // Fetch all projects
  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/projects`, { headers: this.getAuthHeaders() });
  }

  // Fetch all users
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`, { headers: this.getAuthHeaders() });
  }

  // Create a new task
  createTask(task: any): Observable<any> {
    const formattedDeadline = task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : null;
    const payload = { ...task, deadline: formattedDeadline };

    return this.http.post<any>(`${this.apiUrl}/tasks`, payload, { headers: this.getAuthHeaders() });
  }

  // Update a task
  updateTask(taskId: number, task: any): Observable<any> {
    const formattedDeadline = task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : null;
    const payload = { ...task, deadline: formattedDeadline };

    return this.http.put<any>(`${this.apiUrl}/tasks/${taskId}`, payload, { headers: this.getAuthHeaders() });
  }

  // Delete a task
  deleteTask(taskId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/tasks/${taskId}`, { headers: this.getAuthHeaders() });
  }
}
