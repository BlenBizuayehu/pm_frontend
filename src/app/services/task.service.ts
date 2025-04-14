import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private apiUrl = 'http://localhost:8080/api/tasks'; // Your API endpoint here
  private documentBasePath = 'http://localhost:8080/uploads/'; 

  constructor(private http: HttpClient) {}
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Fetch all tasks
  getTasks(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Fetch projects
  getProjects(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/projects');
  }

  // Fetch users
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/users');
  }

  // Create a new task
  createTask(task: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, task);
  }

  // Update an existing task
  updateTask(taskId: number, taskData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${taskId}`, taskData);
  }

  // Delete a task
  deleteTask(taskId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${taskId}`);
  }

  getUserTasks(username: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user-tasks`, {
      params: { username },
      headers: this.getAuthHeaders()
    });
  }

// task.service.ts
getDocumentPath(taskId: number): Observable<{exists: boolean, path?: string} | null> {
  return this.http.get<{
    exists: boolean,
    document_path?: string
  }>(`${this.apiUrl}/${taskId}/document-path`, {
    headers: this.getAuthHeaders()
  }).pipe(
    map(response => {
      if (!response.exists) {
        return { exists: false };
      }
      return {
        exists: true,
        path: `${this.documentBasePath}${response.document_path}`
      };
    }),
    catchError(error => {
      if (error.status === 404) {
        return of({ exists: false });
      }
      console.error('Error fetching document path:', error);
      return of(null);
    })
  );
}

getDocumentInfo(taskId: number) {
  return this.http.get<any>(`${this.apiUrl}/${taskId}/document-path`, {
    headers: this.getAuthHeaders()
  }).pipe(
    map(response => {
      // Successful response handling
      if (response.success) {
        if (response.hasDocument && response.documentPath) {
          return {
            exists: true,
            path: `${this.documentBasePath}${response.documentPath}`,
            error: null
          };
        }
        return { exists: false, path: null, error: null };
      }
      // Error response handling
      throw new Error(response.message || 'Unknown error');
    }),
    catchError(error => {
      console.error('Document check failed:', error);
      return of({
        exists: false,
        path: null,
        error: error.message || 'Failed to check document'
      });
    })
  );
}




// Add these methods to your TasksService

// Get all documents for a specific task
getTaskDocuments(taskId: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/${taskId}/documents`, {
    headers: this.getAuthHeaders()
  }).pipe(
    map(response => {
      // Convert single document to array if needed
      if (response && response.document_path) {
        return [response]; // Wrap single document in array
      }
      return []; // Return empty array if no document
    }),
    catchError(error => {
      console.error('Error fetching documents:', error);
      return of([]); // Always return array, even on error
    })
  );
}

// Update your getTaskDocument method
// In TasksService
getTaskDocument(downloadUrl: string): Observable<Blob> {
  console.log('Original download URL:', downloadUrl);
  
  const fullUrl = downloadUrl.startsWith('http') 
    ? downloadUrl 
    : `${this.apiUrl.replace(/\/api\/tasks$/, '')}${downloadUrl}`;
  
  console.log('Final request URL:', fullUrl);
  
  return this.http.get(fullUrl, {
    responseType: 'blob',
    headers: this.getAuthHeaders()
  });
}

// Add this new method for getting document info
getTaskDocumentInfo(taskId: number): Observable<{
  exists: boolean;
  path?: string;
  filename?: string;
  size?: number;
  type?: string;
}> {
  return this.http.get<{
    exists: boolean;
    document_path?: string;
    filename?: string;
    size?: number;
    type?: string;
  }>(`${this.apiUrl}/${taskId}/document-info`, {
    headers: this.getAuthHeaders()
  }).pipe(
    map(response => ({
      exists: response.exists,
      path: response.document_path ? `${this.documentBasePath}${response.document_path}` : undefined,
      filename: response.filename,
      size: response.size,
      type: response.type
    })),
    catchError(error => {
      if (error.status === 404) {
        return of({ exists: false });
      }
      console.error('Error fetching document info:', error);
      return of({ exists: false });
    })
  );
}

// Get document info for PM view
getAllTaskDocuments(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/documents`, {
    headers: this.getAuthHeaders()
  }).pipe(
    catchError(error => {
      console.error('Error fetching all documents:', error);
      return of([]);
    })
  );
}

  updateTaskStatus(taskId: number, data: any): Observable<any> {
    if (data instanceof FormData) {
      return this.http.put(`${this.apiUrl}/${taskId}/status`, data);
    } else {
      return this.http.put(`${this.apiUrl}/${taskId}/status`, data);
    }
  }
}
