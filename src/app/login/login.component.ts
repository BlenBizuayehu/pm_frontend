import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  private router = inject(Router);
  private http = inject(HttpClient);

  login() {
    this.errorMessage = '';
    
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Username and password are required';
      return;
    }

    const loginData = { 
      full_name: this.username.trim(),
      password: this.password.trim() 
    };

    console.log('Attempting login with:', loginData);
  
    this.http.post('http://localhost:8080/login', loginData, { 
      withCredentials: true, // Essential for session cookies
      observe: 'response'
    }).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
        
        // Check if login was successful (adjust based on your API response)
        if (response.status === 200) {
          // Get user role from response or make another request if needed
          this.getUserRoleAndRedirect();
        } else {
          this.errorMessage = 'Authentication failed';
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = error.error?.error || 
                          error.statusText || 
                          'Login failed. Please try again.';
      }
    });
  }

  private getUserRoleAndRedirect() {
    // Make request to get user info (since we're not using JWT)
    this.http.get('http://localhost:8080/api/current-user', {
      withCredentials: true
    }).subscribe({
      next: (user: any) => {
        const roleRoutes: {[key: string]: string} = {
          'Admin': '/admin-dashboard',
          'PM': '/pm-dashboard',
          'Team': '/team-dashboard'
        };
        
        const redirectRoute = roleRoutes[user.role] || '/default';
        console.log('Navigating to:', redirectRoute);
        this.router.navigate([redirectRoute]);
      },
      error: (err) => {
        console.error('Failed to get user role:', err);
        this.errorMessage = 'Failed to determine user role';
      }
    });
  }
}