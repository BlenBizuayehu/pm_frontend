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
    const loginData = { username: this.username, password: this.password };

    // Make the POST request to the backend
    this.http.post('http://localhost:8080/login', loginData, {
      headers: { 'Content-Type': 'application/json' },  withCredentials: true
    }).subscribe(
      (response: any) => {
        // Decode JWT token and store it in localStorage
        const decoded: any = jwt_decode(response.token);
        localStorage.setItem('token', response.token);

        // Navigate based on the user's role
        if (decoded.role === 'Admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (decoded.role === 'PM') {
          this.router.navigate(['/pm-dashboard']);
        } else if (decoded.role === 'Team') {
          this.router.navigate(['/team-dashboard']);
        } else {
          this.errorMessage = 'Invalid role';
        }
      },
      (error) => {
        // Handle error, e.g., invalid credentials
        this.errorMessage = 'Invalid credentials' ;
      }
    );

    
  }
}
