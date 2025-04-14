import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faPeopleGroup } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TeamsService } from '../../../services/teams.service';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit {
  // Icons
  faPeopleGroup = faPeopleGroup;
  faArrowLeft = faArrowLeft;

  // Data
  teams: any[] = [];
  projects: any[] = [];
  users: any[] = [];
  
  // Team creation
  showCreateForm = false;
  newTeam = { name: '', project_id: null };
  editTeamData: any = null;
  isEditMode = false;

  // Member management
  selectedTeamForMembers: any = null;
  availableUsers: any[] = [];
  newMember = { user_id: null, role: 'Member' };
  roles = ['Member', 'Lead', 'Manager'];

  // UI states
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Services
  private teamsService = inject(TeamsService);
  private location = inject(Location);
  private modalService = inject(NgbModal);

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.isLoading = true;
    
    this.teamsService.getTeams().subscribe({
      next: (teams) => {
        this.teams = teams.map(team => ({ ...team, members: [] }));
        this.teams.forEach(team => this.loadTeamMembers(team));
        this.loadSupportingData();
      },
      error: (error) => this.handleError('Failed to load teams', error)
    });
  }

  loadSupportingData() {
    this.teamsService.getProjects().subscribe({
      next: (projects) => this.projects = projects,
      error: (error) => this.handleError('Failed to load projects', error)
    });

    this.teamsService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => this.handleError('Failed to load users', error)
    });
  }

  loadTeamMembers(team: any) {
    this.teamsService.getTeamMembers(team.team_id).subscribe({
      next: (members) => team.members = members,
      error: (error) => this.handleError('Failed to load team members', error)
    });
  }

  // Team CRUD operations
  createTeam() {
    if (!this.newTeam.name) {
      this.showError('Team name is required');
      return;
    }

    this.isLoading = true;
    this.teamsService.createTeam(this.newTeam).subscribe({
      next: () => this.handleTeamSuccess('Team created successfully'),
      error: (error) => this.handleError('Failed to create team', error)
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

    this.teamsService.updateTeam(this.editTeamData.team_id, payload).subscribe({
      next: () => this.handleTeamSuccess('Team updated successfully'),
      error: (error) => this.handleError('Failed to update team', error)
    });
  }

  deleteTeam(teamId: number) {
    if (confirm('Are you sure you want to delete this team?')) {
      this.isLoading = true;
      this.teamsService.deleteTeam(teamId).subscribe({
        next: () => {
          this.showSuccess('Team deleted successfully');
          this.teams = this.teams.filter(t => t.team_id !== teamId);
          this.isLoading = false;
        },
        error: (error) => this.handleError('Failed to delete team', error)
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
    this.teamsService.addTeamMember(
      this.selectedTeamForMembers.team_id,
      this.newMember
    ).subscribe({
      next: () => {
        this.showSuccess('Member added successfully');
        this.loadTeamMembers(this.selectedTeamForMembers);
        this.modalService.dismissAll();
        this.isLoading = false;
      },
      error: (error) => this.handleError('Failed to add member', error)
    });
  }

  removeMember(team: any, userId: number) {
    const userName = this.getUserName(userId);
    if (!confirm(`Remove ${userName} from the team?`)) return;

    this.isLoading = true;
    this.teamsService.removeTeamMember(team.team_id, userId).subscribe({
      next: () => {
        this.showSuccess(`${userName} removed successfully`);
        this.loadTeamMembers(this.selectedTeamForMembers);
      },
      error: (error) => this.handleError('Failed to remove member', error),
      complete: () => this.isLoading = false
    });
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

  getUserName(userId: number): string {
    const user = this.users.find(u => 
      u.user_id === userId || u.id === userId || u.userId === userId
    );
    return user ? (user.full_name || user.name || user.username || 'Unnamed User') : 'Unknown User';
  }

  // UI helpers
  startEdit(team: any) {
    this.editTeamData = { ...team };
    this.isEditMode = true;
    this.showCreateForm = true;
  }

  cancelEdit() {
    this.editTeamData = null;
    this.isEditMode = false;
    this.showCreateForm = false;
    this.resetNewTeamForm();
  }

  resetNewTeamForm() {
    this.newTeam = { name: '', project_id: null };
    this.showCreateForm = false;
  }

  // Message handlers
  private handleTeamSuccess(message: string) {
    this.showSuccess(message);
    this.loadInitialData();
    this.cancelEdit();
  }

  private handleError(message: string, error: any) {
    console.error(error);
    this.showError(message + (error.error?.message ? ': ' + error.error.message : ''));
    this.isLoading = false;
  }

  showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = '', 5000);
  }

  showSuccess(message: string) {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 5000);
  }

  goBack() {
    this.location.back();
  }
}