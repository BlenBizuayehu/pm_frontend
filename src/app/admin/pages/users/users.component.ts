// users.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule], // Required imports
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  private apiUrl = 'http://localhost:8080/api'; 
  users: any[] = [];
  newUser: any = { full_name: '', email: '', password: '', role: 'Team' };
  editUserData: any = null;
  roles = ['Admin', 'Project Manager', 'Team Member'];
  isLoading = false;
  errorMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/users`, { headers: this.getAuthHeaders() })
    
      .subscribe({
        next: (data) => {
          this.users = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.errorMessage = 'Failed to load users';
          this.isLoading = false;
        }
      });
  }

  createUser() {
    this.isLoading = true;
    this.http.post(`${this.apiUrl}/users`, this.newUser, { headers: this.getAuthHeaders() })
    .subscribe({
        next: () => {
          this.loadUsers();
          this.newUser = { full_name: '', email: '', password: '', role: 'Team' };
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.errorMessage = 'Failed to create user';
          this.isLoading = false;
        }
      });
  }

  startEdit(user: any) {
    this.editUserData = { ...user };
  }
// users.component.ts
updateUser() {
  if (!this.editUserData?.user_id) {
    console.error('User ID is missing');
    return;
  }

  this.isLoading = true;
  // Use apiUrl consistently
  this.http.put(`${this.apiUrl}/users/${this.editUserData.user_id}`, this.editUserData, { 
    headers: this.getAuthHeaders() 
  }).subscribe({
    next: () => {
      this.loadUsers();
      this.editUserData = null;
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error updating user:', error);
      this.errorMessage = 'Failed to update user';
      this.isLoading = false;
    }
  });
}

deleteUser(userId: number) {
  if (!userId) {
    this.errorMessage = 'Invalid user ID';
    return;
  }

  if (confirm('Are you sure you want to delete this user?')) {
    this.isLoading = true;
    this.http.delete(`${this.apiUrl}/users/${userId}`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.user_id !== userId);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Delete error:', error);
        this.isLoading = false;
        
        if (error.status === 404) {
          this.errorMessage = 'User not found';
        } 
        else if (error.status === 500) {
          // Show the actual error message from backend if available
          this.errorMessage = error.error?.message || 'Database operation failed';
        }
        else {
          this.errorMessage = 'Delete failed - please try again';
        }
      }
    });
  }
}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}