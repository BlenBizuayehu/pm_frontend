// document.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  getDocumentUrl(taskId: number): string {
    return `${this.apiUrl}/tasks/${taskId}/document`;
  }

  downloadDocument(taskId: number): Observable<Blob> {
    return this.http.get(this.getDocumentUrl(taskId), {
      responseType: 'blob'
    });
  }

  viewDocument(taskId: number): void {
    window.open(this.getDocumentUrl(taskId), '_blank');
  }

  getDocument(taskId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/tasks/${taskId}/document`, {
      responseType: 'blob'
    });
  }

  getDocumentMetadata(taskId: number): Observable<any> {
    return this.http.head(`${this.apiUrl}/tasks/${taskId}/document`, {
      observe: 'response'
    });
  }

}