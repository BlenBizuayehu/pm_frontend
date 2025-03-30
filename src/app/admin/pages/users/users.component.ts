import { CommonModule } from '@angular/common'; // Import CommonModule for *ngFor
import { Component } from '@angular/core';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule], // Import CommonModule here
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  // Sample users data
  users = [
    { id: 1, name: 'User 1', role: 'Admin' },
    { id: 2, name: 'User 2', role: 'PM' },
    { id: 3, name: 'User 3', role: 'Team' }
  ];

  // Method to edit a user
  editUser(userId: number) {
    // Logic to edit a user (e.g., open a form with user details)
    console.log(`Editing user with ID: ${userId}`);
    // Implement your edit logic here
  }

  // Method to delete a user
  deleteUser(userId: number) {
    // Logic to delete a user from the list
    this.users = this.users.filter(user => user.id !== userId);
    console.log(`Deleted user with ID: ${userId}`);
  }

  // Method to add a user (you can expand this logic to open a form, etc.)
  addUser() {
    // Logic to add a user (e.g., show a form to add a new user)
    const newUser = { id: this.users.length + 1, name: `User ${this.users.length + 1}`, role: 'Team' };
    this.users.push(newUser);
    console.log(`Added user: ${newUser.name}`);
  }
}
