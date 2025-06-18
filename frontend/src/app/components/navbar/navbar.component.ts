import { Component, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isAdmin = false;
  userName = '';
  isMenuOpen = false;
  private authSubscription?: Subscription;
  private documentClickListener: any;

  constructor(
    private authService: AuthService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    // Sottoscrizione allo stato di autenticazione
    this.authSubscription = this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'admin';
      this.userName = user?.name || '';
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    // Rimuovi eventuali listener rimasti
    this.removeDocumentClickListener();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    
    if (this.isMenuOpen) {
      // Aggiungi listener per i click esterni quando il menu è aperto
      this.addDocumentClickListener();
    } else {
      // Rimuovi il listener quando il menu viene chiuso manualmente
      this.removeDocumentClickListener();
    }
  }

  closeMenu() {
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
      this.removeDocumentClickListener();
    }
  }

  logout() {
    this.authService.logout();
    this.isMenuOpen = false;
  }

  // Impedisci che i click all'interno della navbar chiudano il menu
  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.stopPropagation();
  }

  // Gestione dei click esterni
  private addDocumentClickListener(): void {
    // Uso setTimeout per evitare che lo stesso click che apre il menu lo chiuda immediatamente
    setTimeout(() => {
      this.documentClickListener = (event: MouseEvent) => {
        const clickedInsideNavbar = this.elementRef.nativeElement.contains(event.target);
        if (!clickedInsideNavbar && this.isMenuOpen) {
          this.closeMenu();
        }
      };
      document.addEventListener('click', this.documentClickListener);
    }, 0);
  }

  private removeDocumentClickListener(): void {
    if (this.documentClickListener) {
      document.removeEventListener('click', this.documentClickListener);
      this.documentClickListener = null;
    }
  }
}