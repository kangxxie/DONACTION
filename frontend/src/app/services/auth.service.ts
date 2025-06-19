import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
  }
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { token, newPassword });
  }
  verifyResetToken(token: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/reset-password/verify/${token}`);
}
  
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient, 
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Inizializza con null, poi leggi da localStorage solo se nel browser
    let user = null;
    
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          user = JSON.parse(storedUser);
        } catch (e) {
          if (this.isBrowser) {
            localStorage.removeItem('currentUser');
          }
        }
      }
    }
    
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser = this.currentUserSubject.asObservable();
  }
  
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  
  public get isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }
  
  public get isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }
  
  updateUserData(user: User): void {
    this.currentUserSubject.next(user);
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }
  
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => this.handleAuthentication(response)),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
  
  adminLogin(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/admin/login`, { email, password })
      .pipe(
        tap(response => this.handleAuthentication(response)),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }
  register(userData: { nome: string, email: string, password: string, admin_code?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => this.handleAuthentication(response)),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
  
  logout(): void {
    // Rimuovi utente dal localStorage e dal BehaviorSubject
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
  
  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }
  
  private handleAuthentication(authResult: AuthResponse): void {
    const { token, user } = authResult;
    
    // Salva il token e l'utente nel localStorage
    if (this.isBrowser) {
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    
    // Aggiorna il BehaviorSubject
    this.currentUserSubject.next(user);
  }
}