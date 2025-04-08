// login.service.ts
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface LoginRequest {
full_name: string;
password: string;
}

export interface LoginResponse {
role?: 'Admin' | 'Project Manager' | 'Team Member' | string;
[key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class LoginService {
private http = inject(HttpClient);
private router = inject(Router);
private apiUrl = 'http://localhost:8080/login';

login(credentials: LoginRequest): Observable<void> {
const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

return this.http
    .post<LoginResponse>(this.apiUrl, credentials, {
    headers,
    observe: 'response',
    })
    .pipe(
    map((response: HttpResponse<LoginResponse>) => {
        const role = response.body?.role;
        if (!role) {
        throw new Error('Authentication failed: no role in response');
        }

        const routeMap: Record<string, string> = {
        Admin: '/admin-dashboard',
        'Project Manager': '/pm-dashboard',
        'Team Member': '/team-dashboard',
        };

        const targetRoute = routeMap[role] || '/default';
        localStorage.setItem('currentUser', credentials.full_name);

        this.router.navigate([targetRoute]);
    }),
    catchError((err) => {
        const message =
        err?.error?.error || err?.statusText || 'Login failed.';
        return throwError(() => new Error(message));
    })
    );
}
}
