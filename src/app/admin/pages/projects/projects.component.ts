import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
@Component({
  selector: 'app-projects',
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
  projects = [
    { id: 1, name: 'Project A', status: 'Active', tasks: 5 },
    { id: 2, name: 'Project B', status: 'Completed', tasks: 10 },
    { id: 3, name: 'Project C', status: 'On Hold', tasks: 3 },
  ];

  constructor() {}

  // Method to delete a project
  deleteProject(projectId: number) {
    const projectIndex = this.projects.findIndex(project => project.id === projectId);
    if (projectIndex !== -1) {
      this.projects.splice(projectIndex, 1); 
      console.log(`Project with id ${projectId} has been deleted`);
    }
  }

  // Method to add a new project
  addProject() {
    console.log('Adding a new project');
    // Implement logic to add a new project
  }
}
