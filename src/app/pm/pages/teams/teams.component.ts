import { CommonModule, Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft, faPeopleGroup
} from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {
  faPeopleGroup=faPeopleGroup;
  private apiUrl = 'http://localhost:8080/api';
  teams: any[] = [];
  projects: any[] = [];
  users: any[] = [];
  

  
  // Team creation
  showCreateForm = false;
  newTeam = {
    name: '',
    project_id: null
  };
  faArrowLeft=faArrowLeft;
  editTeamData: any = null;
  isEditMode = false;

  startEdit(team: any) {
    this.editTeamData = { ...team };
    this.isEditMode = true;
    this.showCreateForm = true; // Reuse the create form for editing
  }
  
  // Team management
  selectedTeamForMembers: any = null;
  availableUsers: any[] = [];
  
  // Member addition
  newMember = {
    user_id: null,
    role: 'Member' // Default role
  };
  
  // UI states
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  roles = ['Member', 'Lead', 'Manager']; // Available roles

  constructor(
    private location: Location,
    private http: HttpClient,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.loadUsers();

    this.loadTeams();
    this.loadProjects();
  }

  // Load all necessary data
  loadTeams() {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/teams`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.teams = data.map(team => ({
          ...team,
          members: [] // Initialize empty members array
        }));
        // Load members for each team
        this.teams.forEach(team => this.loadTeamMembers(team));
        this.isLoading = false;
      },
      error: (error) => {
        this.showError('Failed to load teams');
        this.isLoading = false;
      }
    });
  }

  loadProjects() {
    this.http.get<any[]>(`${this.apiUrl}/projects`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => this.projects = data,
      error: () => this.showError('Failed to load projects')
    });
  }

  loadUsers() {
    this.http.get<any[]>(`${this.apiUrl}/users`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => this.users = data,
      error: () => this.showError('Failed to load users')
    });
  }

  loadTeamMembers(team: any) {
    this.http.get<any[]>(`${this.apiUrl}/teams/${team.team_id}/members`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (members) => {
        team.members = members;
      },
      error: (err) => this.showError('Failed to load team members')
    });
  }

  // Team CRUD operations
  createTeam() {
    if (!this.newTeam.name) {
      this.showError('Team name is required');
      return;
    }

    this.isLoading = true;
    this.http.post(`${this.apiUrl}/teams`, this.newTeam, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => {
        this.showSuccess('Team created successfully');
        this.loadTeams();
        this.resetNewTeamForm();
        this.isLoading = false;
      },
      error: (error) => {
        this.showError(error.error?.message || 'Failed to create team');
        this.isLoading = false;
      }
    });
  }

  updateTeam() {
    if (!this.editTeamData?.team_id) {
      this.showError('No team selected for editing');
      return;
    }

    this.isLoading = true;
    const payload = {
      name: this.editTeamData.name,
      project_id: this.editTeamData.project_id
    };

    this.http.put(`${this.apiUrl}/teams/${this.editTeamData.team_id}`, payload, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => {
        this.showSuccess('Team updated successfully');
        this.loadTeams();
        this.cancelEdit();
        this.isLoading = false;
      },
      error: (error) => {
        this.showError(error.error?.message || 'Failed to update team');
        this.isLoading = false;
      }
    });
  }
  
  cancelEdit() {
    this.editTeamData = null;
    this.isEditMode = false;
    this.showCreateForm = false;
    this.resetNewTeamForm();
  }

  deleteTeam(teamId: number) {
    if (confirm('Are you sure you want to delete this team?')) {
      this.isLoading = true;
      this.http.delete(`${this.apiUrl}/teams/${teamId}`, {
        headers: this.getAuthHeaders()
      }).subscribe({
        next: () => {
          this.showSuccess('Team deleted successfully');
          this.teams = this.teams.filter(t => t.team_id !== teamId);
          this.isLoading = false;
        },
        error: (error) => {
          this.showError(error.error?.message || 'Failed to delete team');
          this.isLoading = false;
        }
      });
    }
  }

  // Member management
  openAddMemberModal(content: any, team: any) {
    this.selectedTeamForMembers = team;
    this.newMember = { user_id: null, role: 'Member' };
    this.updateAvailableUsers();
    this.modalService.open(content, { backdrop: 'static', keyboard: false });
  }

  addMember() {
    if (!this.selectedTeamForMembers || !this.newMember.user_id) {
      this.showError('Please select a user to add');
      return;
    }

    this.isLoading = true;
    this.http.post(
      `${this.apiUrl}/teams/${this.selectedTeamForMembers.team_id}/members`,
      this.newMember,
      { headers: this.getAuthHeaders() }
    ).subscribe({
      next: () => {
        this.showSuccess('Member added successfully');
        this.loadTeamMembers(this.selectedTeamForMembers);
        this.modalService.dismissAll();
        this.isLoading = false;
      },
      error: (error) => {
        this.showError(error.error?.message || 'Failed to add member');
        this.isLoading = false;
      }
    });
  }

  async removeMember(team: any, userId: number) {
    // Debug logging
    console.log('Remove member called with:', { team, userId, users: this.users });
    
    // Validation
    if (!team) {
        this.showError('Team not specified');
        return;
    }
    
    const teamId = team.team_id || team.id; // Handle both possible property names
    if (!teamId) {
        console.error('Team object missing ID:', team);
        this.showError('Invalid team data');
        return;
    }
    
    if (!userId) {
        this.showError('User not specified');
        return;
    }

    // Confirm with user name
    const userName = this.getUserName(userId);
    if (!confirm(`Remove ${userName} from the team?`)) {
        return;
    }

    this.isLoading = true;
    try {
        // Convert observable to promise with await
        await this.http.delete(
            `${this.apiUrl}/teams/${teamId}/members/${userId}`,
            { headers: this.getAuthHeaders() }
        ).toPromise();
        
        this.showSuccess(`${userName} removed successfully`);
        await this.loadTeamMembers(team);
    } catch (error) {
        console.error('Removal error:', error);
    } finally {
        this.isLoading = false;
    }
}

  // Helper methods
  updateAvailableUsers() {
    if (!this.selectedTeamForMembers) return;
    const memberIds = this.selectedTeamForMembers.members.map((m: any) => m.user_id);
    this.availableUsers = this.users.filter(
      user => !memberIds.includes(user.user_id)
    );
  }

  getProjectName(projectId: number): string {
    const project = this.projects.find(p => p.project_id === projectId);
    return project ? project.name : 'No project';
  }

  getUserName(userId: number | undefined): string {
    if (userId === undefined || userId === null) {
        console.warn('getUserName called with undefined userId');
        return 'Unknown User';
    }
    
    if (!this.users || this.users.length === 0) {
        console.warn('Users array not loaded');
        return 'Loading...';
    }
    
    // Check all possible ID fields
    const user = this.users.find(u => 
        u.user_id === userId || 
        u.id === userId ||
        u.userId === userId
    );
    
    if (!user) {
        console.warn(`User with ID ${userId} not found in:`, this.users);
        return 'Unknown User';
    }
    
    return user.full_name || user.name || user.username || 'Unnamed User';
}


  resetNewTeamForm() {
    this.newTeam = {
      name: '',
      project_id: null
    };
    this.showCreateForm = false;
  }

  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 5000);
  }

  showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 5000);
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  goBack() {
    this.location.back(); // Make sure to import Location from '@angular/common'
  }
}