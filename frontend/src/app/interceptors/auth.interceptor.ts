import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

// Versione classe (per Angular Module)
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ottieni il token JWT
    const token = this.authService.getToken();
    
    if (token) {
      // Clona la richiesta e aggiungi l'header di autorizzazione
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Gestisci errori 401 (non autorizzato)
        if (error.status === 401) {
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}

// Versione funzionale (per Standalone API)
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  // Log per debug
  console.log(`AuthInterceptor: Intercettata richiesta a ${req.url}`);
  console.log(`AuthInterceptor: Token presente: ${!!token}`);
  
  if (token) {
    // Clona la richiesta con il token nell'header Authorization
    console.log(`AuthInterceptor: Aggiunto token all'header Authorization`);
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(`AuthInterceptor: Errore HTTP ${error.status} su ${req.url}`, error);
      if (error.status === 401) {
        console.log('AuthInterceptor: Errore 401, logout utente');
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};