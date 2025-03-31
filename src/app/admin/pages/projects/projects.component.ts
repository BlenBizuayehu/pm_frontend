import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [HttpClientModule, FormsModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
})
export class ProjectsComponent {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/admin/projects';

  projects = [];
  newProject = { name: '', status: '' };  // Data structure for new project
  showAddProjectForm = false;  // To toggle form visibility

  constructor() {}

  // Get all projects
  getProjects() {
    this.http.get<any>(this.apiUrl).subscribe(
      (data) => {
        this.projects = data;
        console.log('Projects:', data);
      },
      (error) => {
        console.error('Error fetching projects:', error);
      }
    );
  }

  // Add a new project
  addProject() {
    const project = { name: this.newProject.name, status: this.newProject.status };

    this.http.post<any>(this.apiUrl, project).subscribe(
      (response) => {
        console.log('Project added:', response);
        this.getProjects(); // Refresh the project list after adding
        this.showAddProjectForm = false; // Hide the form
        this.newProject = { name: '', status: '' }; // Reset the form fields
      },
      (error) => {
        console.error('Error adding project:', error);
      }
    );
  }

  // Delete a project
  deleteProject(projectId: number) {
    this.http.delete<any>(`${this.apiUrl}/${projectId}`).subscribe(
      (response) => {
        console.log('Project deleted:', response);
        this.getProjects(); // Refresh the project list after deletion
      },
      (error) => {
        console.error('Error deleting project:', error);
      }
    );
  }

  // Toggle the visibility of the add project form
  toggleAddProjectForm() {
    this.showAddProjectForm = !this.showAddProjectForm;
  }
}
