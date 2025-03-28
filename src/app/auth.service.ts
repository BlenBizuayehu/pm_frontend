import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // This ensures the service is available throughout the application
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/login'; // URL of your backend API

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const body = { username, password };
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    return this.http.post(this.apiUrl, body, { headers });
  }
}

