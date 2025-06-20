import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DonationService } from '../../services/donation.service';
import { Donation } from '../../models/donation.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  currentUser: any = null;
  userDonations: Donation[] = [];
  isLoading = true;
  error: string | null = null;
  private donationsSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private donationService: DonationService,
    private router: Router
  ) {}
    ngOnInit(): void {
    console.log('UserDashboard: Inizializzazione componente');
    this.currentUser = this.authService.currentUserValue;
    console.log('UserDashboard: Utente corrente:', this.currentUser);
    console.log('UserDashboard: Token JWT presente:', !!this.authService.getToken());
    
    // Sottoscrizione all'observable delle donazioni
    this.isLoading = true;
    console.log('UserDashboard: Sottoscrizione alle donazioni utente');
    this.donationsSubscription = this.donationService.userDonations$.subscribe({
      next: (donations) => {
        console.log(`UserDashboard: Ricevute ${donations.length} donazioni`);
        this.userDonations = donations;
        this.isLoading = false;
        
        // Se abbiamo donazioni, aggiorna i contatori
        if (donations.length > 0) {
          console.log('UserDashboard: Aggiornamento contatori donazioni');
          setTimeout(() => this.animateCounters(), 300);
        }
      },
      error: (err) => {
        console.error('UserDashboard: Errore nel caricamento delle donazioni:', err);
        this.error = 'Impossibile caricare le tue donazioni. Riprova più tardi.';
        this.isLoading = false;
      }
    });
    
    // Forza un refresh delle donazioni
    console.log('UserDashboard: Richiesta caricamento donazioni');
    this.loadUserDonations();
  }  /**
   * Carica le donazioni dell'utente dal backend
   */
  loadUserDonations(): void {
    console.log('UserDashboard: Aggiornamento donazioni richiesto');
    this.isLoading = true;
    this.error = null;
    
    // Aggiorna le donazioni dal service
    this.donationService.refreshDonations();
    
    // Imposta un timeout di sicurezza di 10 secondi per evitare il caricamento infinito
    setTimeout(() => {
      if (this.isLoading) {
        console.warn('UserDashboard: Timeout di caricamento donazioni');
        this.isLoading = false;
        this.error = 'Il caricamento delle donazioni sta impiegando più tempo del previsto. Riprova più tardi.';
      }
    }, 10000);
  }
  
  ngAfterViewInit() {
    // Piccolo delay per assicurarci che gli elementi siano caricati correttamente
    setTimeout(() => {
      // Animazione numeri contatori
      this.animateCounters();
    }, 100);
  }
  
  ngOnDestroy(): void {
    // Annulla la sottoscrizione per evitare memory leak
    if (this.donationsSubscription) {
      this.donationsSubscription.unsubscribe();
    }
  }
  // Ritenta caricamento donazioni
  retryLoading(): void {
    console.log('UserDashboard: Nuovo tentativo di caricamento donazioni');
    this.error = null;
    this.loadUserDonations();
  }
  
  // Debug delle donazioni utente
  debugDonations(): void {
    console.log('UserDashboard: Debug donazioni utente');
    console.log('Token JWT presente:', !!this.authService.getToken());
    console.log('Utente corrente:', this.authService.currentUserValue);
    
    // Controlla se ci sono donazioni nel componente
    console.log('Donazioni nel componente:', this.userDonations);
    
    // Richiedi donazioni direttamente dal service
    this.donationService.getUserDonations().subscribe({
      next: (donations) => {
        console.log('Donazioni dal service:', donations);
      },
      error: (err) => {
        console.error('Errore nel recupero donazioni dal service:', err);
      }
    });
      // Richiedi donazioni direttamente dall'API
    this.donationService.getDirectDonationsFromAPI().subscribe({
      next: (donations) => {
        console.log('Donazioni dall\'API:', donations);
        
        // Forza l'aggiornamento del componente con i dati dell'API
        this.userDonations = donations;
        this.isLoading = false;
        this.error = null;
        
        if (donations.length > 0) {
          setTimeout(() => this.animateCounters(), 300);
        }
      },
      error: (err) => {
        console.error('Errore nel recupero donazioni dall\'API:', err);
        this.error = 'Errore nel recupero delle donazioni dall\'API. Controlla la console per dettagli.';
      }
    });
  }
  
  // Metodo per il logout
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  // Calcola il totale donato dall'utente
  get totalDonationAmount(): number {
    if (!this.userDonations || this.userDonations.length === 0) {
      return 0;
    }
    return this.userDonations.reduce((sum, donation) => {
      // Assicuriamoci che amount sia un numero
      const amount = typeof donation.amount === 'number' ? donation.amount : 
                    typeof donation.amount === 'string' ? parseFloat(donation.amount) : 0;
      return sum + amount;
    }, 0);
  }
  
  // Anima i contatori delle statistiche 
  animateCounters(): void {
    console.log('UserDashboard: Animazione contatori statistiche');
    
    // Implementazione base dell'animazione dei contatori
    // In una implementazione reale, qui ci sarebbe un'animazione più sofisticata
    // Per ora, è solo un placeholder
    
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length === 0) {
      console.log('UserDashboard: Nessun elemento .stat-value trovato nel DOM');
      return;
    }
    
    console.log(`UserDashboard: Trovati ${statValues.length} contatori da animare`);
    
    // Aggiungi una classe per l'animazione tramite CSS
    statValues.forEach(el => {
      el.classList.add('animated');
      setTimeout(() => {
        el.classList.remove('animated');
      }, 1000);
    });
  }
}