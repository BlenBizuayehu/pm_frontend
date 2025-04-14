import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Teams
  getTeams(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/teams`, {
      headers: this.getAuthHeaders()
    });
  }

  createTeam(teamData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/teams`, teamData, {
      headers: this.getAuthHeaders()
    });
  }

  updateTeam(teamId: number, teamData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/teams/${teamId}`, teamData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteTeam(teamId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/teams/${teamId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Members
  getTeamMembers(teamId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/teams/${teamId}/members`, {
      headers: this.getAuthHeaders()
    });
  }

  addTeamMember(teamId: number, memberData: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/teams/${teamId}/members`,
      memberData,
      { headers: this.getAuthHeaders() }
    );
  }

  removeTeamMember(teamId: number, userId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/teams/${teamId}/members/${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Supporting data
  getProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/projects`, {
      headers: this.getAuthHeaders()
    });
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`, {
      headers: this.getAuthHeaders()
    });
  }
}