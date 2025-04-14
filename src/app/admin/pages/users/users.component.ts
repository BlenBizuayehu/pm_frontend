import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faCalendarAlt,
  faCog,
  faEdit,
  faEnvelope,
  faExclamationCircle,
  faIdCard,
  faList,
  faLock,
  faSave,
  faSearch,
  faSignature,
  faTimes,
  faTrashAlt,
  faUser,
  faUserEdit,
  faUserFriends,
  faUserPlus,
  faUserShield,
  faUserTag,
  faUserTie,
  faUsers,
  faUsersCog,
} from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../../services/users.service'; // Import UserService

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  errorMessage = '';
  successMessage = '';
  
  // FontAwesome icons
  faArrowLeft = faArrowLeft;
  faUsersCog = faUsersCog;
  faUserFriends = faUserFriends;
  faUserShield = faUserShield;
  faUserTie = faUserTie;
  faUsers = faUsers;
  faUserPlus = faUserPlus;
  faSearch = faSearch;
  faList = faList;
  faIdCard = faIdCard;
  faUser = faUser;
  faEnvelope = faEnvelope;
  faUserTag = faUserTag;
  faCalendarAlt = faCalendarAlt;
  faCog = faCog;
  faEdit = faEdit;
  faTrashAlt = faTrashAlt;
  faUserEdit = faUserEdit;
  faTimes = faTimes;
  faSave = faSave;
  faExclamationCircle = faExclamationCircle;
  faSignature = faSignature;
  faLock = faLock;

  users: any[] = [];
  filteredUsers: any[] = [];
  currentUser: any = { full_name: '', email: '', password: '', role: 'Team Member' };
  editingUser: boolean = false;
  showModal: boolean = false;
  searchQuery: string = '';

  totalUsers: number = 0;
  adminCount: number = 0;
  managerCount: number = 0;
  memberCount: number = 0;

  roles = ['Admin', 'Project Manager', 'Team Member'];
  isLoading = false;

  constructor(private location: Location, private userService: UserService) {} // Use UserService

  ngOnInit() {
    this.loadUsers();
  }

  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => (this.errorMessage = ''), 5000);
  }

  showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => (this.successMessage = ''), 5000);
  }

  goBack() {
    this.location.back();
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = [...this.users];
        this.updateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users';
        this.isLoading = false;
      },
    });
  }

  updateStats() {
    this.totalUsers = this.users.length;
    this.adminCount = this.users.filter((u) => u.role === 'Admin').length;
    this.managerCount = this.users.filter((u) => u.role === 'Project Manager').length;
    this.memberCount = this.users.filter((u) => u.role === 'Team Member').length;
  }

  openAddUserModal() {
    this.currentUser = { full_name: '', email: '', password: '', role: 'Team Member' };
    this.editingUser = false;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingUser = false;
  }

  editUser(user: any) {
    this.currentUser = { ...user };
    this.editingUser = true;
    this.showModal = true;
  }

  confirmDelete(user: any) {
    if (confirm(`Are you sure you want to delete ${user.full_name}?`)) {
      this.deleteUser(user.user_id);
    }
  }

  deleteUser(userId: number) {
    this.isLoading = true;
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.user_id !== userId);
        this.filterUsers();
        this.updateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Delete error:', error);
        this.errorMessage = 'Delete failed';
        this.isLoading = false;
      },
    });
  }

  submitUserForm() {
    if (this.editingUser) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser() {
    this.userService.createUser(this.currentUser).subscribe({
      next: () => {
        this.loadUsers();
        this.showModal = false;
      },
      error: (error) => {
        console.error('Create error:', error);
        this.errorMessage = 'Failed to create user';
      },
    });
  }

  updateUser() {
    const userId = this.currentUser.user_id;
    if (!userId) {
      console.error('Missing user ID');
      return;
    }

    this.userService.updateUser(userId, this.currentUser).subscribe({
      next: () => {
        this.loadUsers();
        this.showModal = false;
        this.editingUser = false;
      },
      error: (error) => {
        console.error('Update error:', error);
        this.errorMessage = 'Failed to update user';
      },
    });
  }

  filterUsers() {
    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(
      (user) =>
        user.full_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
    );
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'Admin':
        return 'fas fa-user-shield';
      case 'Project Manager':
        return 'fas fa-user-tie';
      case 'Team Member':
      default:
        return 'fas fa-users';
    }
  }
}