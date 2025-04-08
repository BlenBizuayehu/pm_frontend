import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../services/login.service'; // Adjust path as needed

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  private loginService = inject(LoginService);

  login(): void {
    this.errorMessage = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Username and password are required';
      return;
    }

    const credentials = {
      full_name: this.username.trim(),
      password: this.password.trim(),
    };

    this.loginService.login(credentials).subscribe({
      next: () => {
        // Handled by service
      },
      error: (err) => {
        this.errorMessage = err.message || 'Login failed.';
      },
    });
  }
}
