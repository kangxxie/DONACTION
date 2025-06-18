import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.currentUserValue;
    
    if (currentUser) {
      // Controlla se la rotta richiede ruoli specifici
      if (route.data['roles'] && !route.data['roles'].includes(currentUser.role)) {
        // Ruolo non autorizzato, reindirizza alla home
        this.router.navigate(['/']);
        return false;
      }
      
      // Autenticato e autorizzato
      return true;
    }
    
    // Non autenticato, reindirizza al login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
