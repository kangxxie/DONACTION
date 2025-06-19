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
    
    // If opening the user dropdown, ensure mobile nav dropdown is closed
    if (this.isDropdownOpen) {
      this.isNavDropdownOpen = false;
    }
  }
  
  // Toggle navigation dropdown (per mobile)
  toggleNavDropdown(event: Event): void {
    event.stopPropagation();
    this.isNavDropdownOpen = !this.isNavDropdownOpen;
    
    // If opening the mobile nav dropdown, ensure user dropdown is closed
    if (this.isNavDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }// Close mobile navigation dropdown
  closeNavDropdown(): void {
    this.isNavDropdownOpen = false;
  }
  
  // Close user dropdown
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }
    // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Reference to dropdown elements and their triggers
    const userDropdownMenu = document.querySelector('.user-dropdown-menu') as HTMLElement;
    const userDropdownTrigger = document.querySelector('.user-dropdown-trigger') as HTMLElement;
    
    const navDropdownMenu = document.querySelector('.mobile-dropdown-menu') as HTMLElement;
    const navDropdownTrigger = document.querySelector('.mobile-dropdown-button') as HTMLElement;
    
    // Check if user dropdown is open and click was outside it
    if (this.isDropdownOpen && userDropdownMenu && userDropdownTrigger) {
      if (this.isClickOutsideDropdown(event, userDropdownMenu, userDropdownTrigger)) {
        this.isDropdownOpen = false;
      }
    }
    
    // Check if nav dropdown is open and click was outside it
    if (this.isNavDropdownOpen && navDropdownMenu && navDropdownTrigger) {
      if (this.isClickOutsideDropdown(event, navDropdownMenu, navDropdownTrigger)) {
        this.isNavDropdownOpen = false;
      }
    }
  }
  // Prevent clicks only inside dropdown menus from closing dropdown
  preventClose(event: Event): void {
    // Stop propagation only for clicks inside dropdown menus, not the entire navbar
    event.stopPropagation();
  }
  
  // Close dropdowns if window is resized to desktop
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if (isPlatformBrowser(this.platformId) && window.innerWidth > 768) {
      this.isNavDropdownOpen = false;
    }
  }
  
  // Check if click was outside the dropdown and its trigger
  isClickOutsideDropdown(event: MouseEvent, dropdownElement: HTMLElement, triggerElement: HTMLElement): boolean {
    return !dropdownElement.contains(event.target as Node) && !triggerElement.contains(event.target as Node);
  }
}
