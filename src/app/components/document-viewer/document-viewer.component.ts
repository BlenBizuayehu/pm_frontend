// document-viewer.component.ts
import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TasksService } from '../../services/task.service';

@Component({
  selector: 'app-pm-documents',
  imports:[CommonModule],
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.css'],
  providers: [DatePipe]
})
export class DocumentViewerComponent implements OnInit {
  documents: any[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private tasksService: TasksService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.tasksService.getAllTaskDocuments().subscribe({
      next: (docs) => {
        this.documents = docs.map(doc => ({
          ...doc,
          formattedDate: this.datePipe.transform(doc.last_upload, 'medium')
        }));
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load documents';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  downloadDocument(taskId: number): void {
    const taskIdStr = taskId.toString();
    this.tasksService.getTaskDocumentInfo(taskId).subscribe({
      next: (docInfo) => {
        if (!docInfo.exists) {
          this.errorMessage = 'Document not found';
          return;
        }
  
        this.tasksService.getTaskDocument(taskIdStr,).subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = docInfo.filename || `task-${taskId}-document`;
            a.click();
            window.URL.revokeObjectURL(url);
          },
          error: (err) => {
            this.errorMessage = 'Failed to download document';
            console.error(err);
          }
        });
      },
      error: (err) => {
        this.errorMessage = 'Error checking document info';
        console.error(err);
      }
    });
  }
  
  viewDocument(taskId: number): void {
     const taskIdStr = taskId.toString();
    this.tasksService.getTaskDocumentInfo(taskId).subscribe({
      next: (docInfo) => {
        if (!docInfo.exists) {
          this.errorMessage = 'Document not found';
          return;
        }
  
        this.tasksService.getTaskDocument(taskIdStr).subscribe({
          next: (blob) => {
            if (docInfo.type?.startsWith('image/') || docInfo.type === 'application/pdf') {
              // For images and PDFs, open in new tab
              const url = window.URL.createObjectURL(blob);
              window.open(url, '_blank');
            } else {
              // For other types, force download
              this.downloadDocument(taskId);
            }
          },
          error: (err) => {
            this.errorMessage = 'Failed to view document';
            console.error(err);
          }
        });
      },
      error: (err) => {
        this.errorMessage = 'Error checking document info';
        console.error(err);
      }
    });
  }}