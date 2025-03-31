import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Correct import
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],  // Ensure HttpClientModule is in the imports array
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  private router = inject(Router); // Dependency injection for Router
  private http = inject(HttpClient); // Dependency injection for HttpClient
  private authService = inject(AuthService); // Inject AuthService correctly

  // Method to handle login
  login() {
    const loginData = { full_name: this.username, password: this.password };
    
    this.http.post('http://localhost:8080/login', loginData, {
      headers: { 'Content-Type': 'application/json' },
    }).subscribe({
      next: (response: any) => {
        const decoded: any = jwt_decode(response.token);
        localStorage.setItem('token', response.token);
        
        // Role-based navigation
        const roleRoutes: {[key: string]: string} = {
          'Admin': '/admin-dashboard',
          'PM': '/pm-dashboard',
          'Team': '/team-dashboard'
        };
        
        this.router.navigate([roleRoutes[decoded.role] || '/login']);
      },
      error: (error) => {
        console.error('Full error:', error);
        this.errorMessage = error.error?.error || 'Login failed. Check console for details.';
      }
    });
  }}