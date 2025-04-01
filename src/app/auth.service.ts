import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root' // This ensures the service is available throughout the application
})
export class AuthService {

  
  private apiUrl = 'http://localhost:8080/login'; // URL of your backend API

  constructor(private http: HttpClient) {}

  private tokenExpirationTimer: any;

  login(credentials: {email: string, password: string}) {
    return this.http.post<{token: string, expiresIn: number}>(
      'http://localhost:8080/login',
      credentials
    ).pipe(
      tap(res => {
        this.setAuthTimer(res.expiresIn);
        localStorage.setItem('token', res.token);
        const expirationDate = new Date(
          new Date().getTime() + res.expiresIn * 1000
        );
        localStorage.setItem('expiration', expirationDate.toISOString());
      })
    );
  }
  private setAuthTimer(duration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    // Redirect to login page
  }

  autoLogin() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const expirationDate = new Date(localStorage.getItem('expiration')!);
    if (expirationDate <= new Date()) {
      this.logout();
      return;
    }

    const remainingTime = expirationDate.getTime() - new Date().getTime();
    this.setAuthTimer(remainingTime / 1000);
  }
}

