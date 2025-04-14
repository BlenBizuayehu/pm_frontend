import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import {
  faArrowLeft,
  faCheckCircle,
  faChevronRight,
  faCrown,
  faEllipsisV,
  faEnvelope,
  faPlus,
  faProjectDiagram,
  faTimes,
  faUser,
  faUserEdit,
  faUserFriends,
  faUserGear,
  faUsers,
  faUserShield,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-my-teams',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './my-teams.component.html',
  styleUrls: ['./my-teams.component.css']
})


export class MyTeamsComponent implements OnInit {
  // FontAwesome icons
  faCheckCircle = faCheckCircle;
  faChevronRight = faChevronRight;
  faCrown = faCrown;
  faEllipsisV = faEllipsisV;
  faPlus = faPlus;
  faProjectDiagram = faProjectDiagram;
  faUser = faUser;
  faUserFriends = faUserFriends;
  faUserShield = faUserShield;
faUsers = faUsers;
faEnvelope = faEnvelope;
faTimes = faTimes;
faUserGear=faUserGear;
faUserTie=faUserTie;
faUserEdit=faUserEdit;
faArrowLeft=faArrowLeft;

  // Component state (unchanged)
  teams: any[] = [];
  isLoading = false;
  username: string = '';
  errorMessage = '';
  debugInfo: any = {};
  private apiUrl = 'http://localhost:8080/api';
   url = 'http://localhost:8080/api/team-projects?teamIds=5,6,9';
  result:any;

  private roleIcons: Record<string, IconDefinition> = {
    admin: faUserShield,
    manager: faUserTie,
    developer: faUserGear,
    designer: faUserEdit,
    leader: faCrown,
    default: faUser
  };

  constructor(
    private location: Location,
    private http: HttpClient,
    private router: Router
  ) {}

    loading = false;
  response: any;
  error: string = '';

  ngOnInit() {
    this.debugInfo['init_start'] = new Date();
    this.username = localStorage.getItem('currentUser') || '';
    this.debugInfo['username_from_storage'] = this.username;

    if (!this.username) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadTeams();
  }

  selectedTeam: any = null;


closeTeamDetails(): void {
  this.selectedTeam = null;
}

goBack() {
  this.location.back(); // Make sure to import Location from '@angular/common'
}


  loadTeams() {
    console.log('1. Starting to load teams...');
    this.isLoading = true;
    this.debugInfo['load_start'] = new Date();
    
    const encodedUsername = encodeURIComponent(this.username);
    const url = `${this.apiUrl}/user-teams?username=${encodedUsername}`;
    this.debugInfo['request_url'] = url;
    this.debugInfo['encoded_username'] = encodedUsername;
  
    this.http.get<any[]>(url).subscribe({
      next: (teams) => {
        console.log('Teams data from API:', teams);
        this.debugInfo['response_data'] = teams;
        this.debugInfo['response_time'] = new Date();
        this.teams = teams.map(team => ({
          ...team,
          joinDate: team.joinDate || new Date().toISOString() // Ensure joinDate exists
        }));
        this.isLoading = false;
      },
      error: (err) => {
        this.debugInfo['error'] = {
          message: err.message,
          status: err.status,
          statusText: err.statusText,
          url: err.url,
          time: new Date()
        };
        this.isLoading = false;
        this.errorMessage = `Failed to load teams: ${err.statusText}`;
        
        if (err.status === 404) {
          this.errorMessage = "User not found. Please check your username.";
        }
      }
    });
  }

  
  getProjects() {
    this.loading = true;
    this.error = '';
    this.result = null;

    // Use your actual backend URL and team IDs
    const url = 'http://localhost:8080/api/team-projects?teamIds=5,6,9';

    this.http.get(url).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.result = res;
        console.log('Success! Data:', res);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load projects';
        console.error('Error details:', {
          status: err.status,
          message: err.message,
          url: err.url,
          error: err.error
        });
      }
    });
  }



  loadTeamMembers(teamId: number): void {
    this.isLoading = true;
    const url = `${this.apiUrl}/teams/${teamId}/members`;
    
    this.http.get<any[]>(url).subscribe({
        next: (members) => {
            this.selectedTeam.members = members || [];
            this.isLoading = false;
        },
        error: (err) => {
            console.error('Error loading team members:', err);
            this.isLoading = false;
            this.errorMessage = 'Failed to load team members';
        }
    });
}

// Add this to viewTeamDetails to ensure it's called
viewTeamDetails(team: any): void {
  console.log('Team object:', team);
  console.log('Selected Team Data:', JSON.parse(JSON.stringify(this.selectedTeam)));
  // Use team.team_id since that's what your API returns
  if (!team.team_id) {
    console.error('Team object is missing team_id:', team);
    this.errorMessage = 'Cannot view team - missing identifier';
    return;
  }

  this.selectedTeam = team;
  this.loadTeamMembers(team.team_id);  // Changed from team.id to team.team_id
}

// team.service.ts
// team.service.ts


  getRoleIcon(role: string): IconDefinition {
    const normalizedRole = role.toLowerCase();
    return this.roleIcons[normalizedRole] || this.roleIcons['default'];
  }

  getStatusClass(status: string| undefined): string {

    if (!status) {
      return 'status-default';
    }
    const statusMap: Record<string, string> = {
      'active': 'status-active',
      'inactive': 'status-inactive', 
      'pending': 'status-pending',
      'default': 'status-default'
    };
    return statusMap[status.toLowerCase()] || statusMap['default'];
  }
}