import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}
    canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isAdmin || this.authService.isTeamMember) {
      return true;
    }
    
    // Reindirizza alla dashboard o home per utenti non autorizzati
    this.router.navigate(['/']);
    return false;
  }
}
// This guard checks if the user is logged in and has admin privileges before allowing access to certain routes.
// If the user is not logged in or not an admin, it redirects to the home page.