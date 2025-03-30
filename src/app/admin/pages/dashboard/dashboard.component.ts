import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http'; // For API calls
import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { OverviewCardsComponent } from '../../components/overview-cards/overview-cards.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    SidebarComponent, 
    NavbarComponent, 
    OverviewCardsComponent // Add OverviewCardsComponent here
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  totalUsers: number = 0;
  totalProjects: number = 0;
  totalTasks: number = 0;
  activeUsers: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Fetch dashboard data
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    const dashboardApiUrl = 'http://localhost:8080/api/dashboard';  // Update with the correct URL
    this.http.get(dashboardApiUrl).subscribe((data: any) => {
      this.totalUsers = data.totalUsers;
      this.totalProjects = data.totalProjects;
      this.totalTasks = data.totalTasks;
      this.activeUsers = data.activeUsers;
    }, (error) => {
      console.error('Error fetching dashboard data', error);
    });
  }
}
