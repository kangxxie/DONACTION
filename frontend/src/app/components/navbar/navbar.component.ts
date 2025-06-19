import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {  isLoggedIn = false;
  isAdmin = false;
  isTeam = false;
  userName = '';
  isNavDropdownOpen = false;
  isDropdownOpen = false;
  
  private authSubscription?: Subscription;
  
  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  ngOnInit() {
    // Subscribe to authentication state
    this.authSubscription = this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'admin';
      this.isTeam = user?.role === 'team';
      this.userName = user?.name || '';
    });
    
    // Initialize dropdown states
    this.isNavDropdownOpen = false;
    this.isDropdownOpen = false;
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
    logout() {
    this.authService.logout();
  }
  
  // Toggle user dropdown menu
  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
    
    if (this.isNavDropdownOpen && this.isDropdownOpen) {
      this.isNavDropdownOpen = false;
    }
  }
  
  // Toggle navigation dropdown (per mobile)
  toggleNavDropdown(event: Event): void {
    event.stopPropagation();
    this.isNavDropdownOpen = !this.isNavDropdownOpen;
    
    if (this.isDropdownOpen && this.isNavDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }  // Close mobile navigation dropdown
  closeNavDropdown(): void {
    this.isNavDropdownOpen = false;
  }
  
  // Close user dropdown
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }
  
  // Close dropdowns when clicking outside
  @HostListener('document:click')
  onDocumentClick(): void {
    this.isNavDropdownOpen = false;
    this.isDropdownOpen = false;
  }
  
  // Prevent clicks inside navbar from closing dropdown
  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.stopPropagation();
  }
  
  // Close dropdowns if window is resized to desktop
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if (isPlatformBrowser(this.platformId) && window.innerWidth > 768) {
      this.isNavDropdownOpen = false;
    }
  }
}
