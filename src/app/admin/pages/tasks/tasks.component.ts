import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-tasks',
  imports: [CommonModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent {
  tasks = [
    { id: 1, name: 'Task A', status: 'To Do', project: 'Project A' },
    { id: 2, name: 'Task B', status: 'In Progress', project: 'Project B' },
    { id: 3, name: 'Task C', status: 'Done', project: 'Project C' },
  ];

  constructor() {}

  // Method to delete a task
  deleteTask(taskId: number) {
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      this.tasks.splice(taskIndex, 1); 
      console.log(`Task with id ${taskId} has been deleted`);
    }
  }

  // Method to add a task
  addTask() {
    console.log('Adding a new task');
    // Implement logic to add a new task
  }
}
