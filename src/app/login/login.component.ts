import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';

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

      const password = this.password.trim();
      console.log('Sending password:', JSON.stringify(password)); // Shows exact characters
      

  
    console.log('Attempting login with:', loginData);
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
  
    this.http.post('http://localhost:8080/login', loginData, { 
      headers,
      observe: 'response' // This will give us full response access
    }).subscribe({
      next: (response: any) => {
        console.log('Full response:', response);
        
        if (response.body?.token) {
          try {
            const decoded: any = jwt_decode(response.body.token);
            console.log('Decoded token:', decoded);
            
            localStorage.setItem('token', response.body.token);
            
            const roleRoutes: {[key: string]: string} = {
              'Admin': '/admin-dashboard',
              'PM': '/pm-dashboard',
              'Team': '/team-dashboard'
            };
            
            const redirectRoute = roleRoutes[decoded.role] || '/default';
            console.log('Navigating to:', redirectRoute);
            this.router.navigate([redirectRoute]);
          } catch (e) {
            console.error('Token error:', e);
            this.errorMessage = 'Invalid token received';
          }
        } else {
          console.error('No token in response:', response);
          this.errorMessage = 'Authentication failed (no token)';
        }
      },
      error: (error) => {
        console.group('Login Error');
        console.error('Full error:', error);
        console.log('Status:', error.status);
        console.log('Status Text:', error.statusText);
        console.log('Error Message:', error.message);
        console.log('Error Body:', error.error);
        console.groupEnd();
        
        this.errorMessage = error.error?.error || 
                           error.statusText || 
                           'Login failed. Please try again.';
      }
    });
  }
}
