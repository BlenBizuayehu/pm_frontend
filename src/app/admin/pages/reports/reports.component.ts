import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-reports',
  imports:[CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent {
  constructor() {}

  // Method to generate reports
  generateReport() {
    console.log('Generating report...');
    // Add logic to generate the report
  }

  // Method to view system logs
  viewLogs() {
    console.log('Viewing system logs...');
    // Add logic to view system logs
  }
}
