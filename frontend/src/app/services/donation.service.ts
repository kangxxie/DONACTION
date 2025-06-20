// src/app/services/donation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { Donation } from '../models/donation.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private apiUrl = `${environment.apiUrl}/donations`;
  // Proprietà per tenere traccia del totale donato dall'utente
  private userDonationsTotal = 0;
  // BehaviorSubject per gestire lo stato delle donazioni dell'utente
  private userDonationsSubject = new BehaviorSubject<Donation[]>([]);
  public userDonations$ = this.userDonationsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Carica le donazioni dell'utente corrente se è autenticato
    this.loadUserDonations();
  }

  // Carica le donazioni dell'utente
  private loadUserDonations(): void {
    if (this.authService.currentUserValue && this.authService.getToken()) {
      console.log('DonationService: Caricamento donazioni utente in corso...');
      console.log('DonationService: Utente corrente:', this.authService.currentUserValue);
      console.log('DonationService: Token JWT presente:', !!this.authService.getToken());
      
      this.getUserDonationsFromAPI().subscribe({
        next: (donations) => {
          console.log(`DonationService: Donazioni caricate con successo! Trovate ${donations.length} donazioni`);
          
          if (donations.length > 0) {
            console.log('DonationService: Prima donazione:', donations[0]);
          }
          
          this.userDonationsTotal = donations.reduce((sum, donation) => sum + donation.amount, 0);
          this.userDonationsSubject.next(donations);
        },
        error: (err) => {
          console.error('DonationService: Errore nel caricamento donazioni:', err);
          // In caso di errore 401 (non autorizzato), potrebbe essere un problema di token
          if (err.status === 401) {
            console.warn('DonationService: Errore di autenticazione, possibile token scaduto o non valido');
          }
          // Non emettiamo un array vuoto in caso di errore per non sovrascrivere i dati esistenti
        }
      });
    } else {
      console.log('DonationService: Utente non autenticato, impossibile caricare le donazioni');
      this.userDonationsSubject.next([]);
    }
  }

  // Ottiene le donazioni per una specifica campagna
  getByCampaign(campaignId: number): Observable<Donation[]> {
    return this.http.get<Donation[]>(`${this.apiUrl}/campaign/${campaignId}`);
  }
    
  // Ottiene tutte le donazioni dell'utente corrente dall'API
  private getUserDonationsFromAPI(): Observable<Donation[]> {
    return this.http.get<Donation[]>(`${this.apiUrl}/user/my-donations`);
  }
  
  // Ottiene tutte le donazioni dell'utente corrente (da cache se disponibili)
  getUserDonations(): Observable<Donation[]> {
    return this.userDonations$;
  }
  
  // Ottiene il totale donato dall'utente
  getUserDonationsTotal(): number {
    return this.userDonationsTotal;
  }
  
  // Effettua una donazione e aggiorna il totale dell'utente
  donate(donation: Partial<Donation>): Observable<Donation> {
    console.log('DonationService: Invio richiesta donazione al server', donation);
    
    // Verifica che l'API URL sia corretto
    console.log('DonationService: API URL', this.apiUrl);
    
    // Verifica se l'utente è autenticato e aggiungi l'utente_id alla donazione
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      console.log(`DonationService: Utente autenticato (ID: ${currentUser.id}), la donazione sarà associata a questo utente`);
    } else {
      console.log('DonationService: Utente non autenticato, la donazione sarà anonima');
    }
    
    // Assicurati che ci sia un amount valido
    if (!donation.amount || isNaN(Number(donation.amount)) || Number(donation.amount) <= 0) {
      console.error('DonationService: Importo donazione non valido', donation.amount);
      return new Observable(observer => {
        observer.error({ error: { message: 'Importo donazione non valido' } });
      });
    }
    
    return this.http.post<Donation>(this.apiUrl, donation).pipe(
      tap({
        next: result => {
          console.log('DonationService: Donazione completata con successo', result);
          // Aggiorna il totale delle donazioni dell'utente
          if (currentUser) {
            console.log('DonationService: Aggiornamento stato donazioni dopo donazione riuscita');
            this.userDonationsTotal += Number(result.amount);
            
            // Aspetta che il backend abbia il tempo di elaborare la donazione prima di ricaricare
            setTimeout(() => {
              console.log('DonationService: Ricaricamento donazioni dopo il timeout');
              this.loadUserDonations();
            }, 1000);
          }
        },
        error: error => {
          console.error('DonationService: Errore durante la donazione', error);
        }
      })
    );
  }  
  
  /**
   * Metodo pubblico per ricaricare le donazioni dell'utente
   * Questo metodo può essere chiamato dai componenti per forzare un aggiornamento
   * delle donazioni dopo un'operazione di donazione
   */
  refreshDonations(): void {
    console.log('DonationService: Richiesta pubblica di aggiornamento donazioni');
    this.loadUserDonations();
  }
  
  /**
   * Metodo pubblico per debug - Ottiene direttamente le donazioni dall'API
   * Questo è utile per diagnostica e debug
   */
  getDirectDonationsFromAPI(): Observable<Donation[]> {
    console.log('DonationService: Richiesta diretta donazioni API per debug');
    return this.getUserDonationsFromAPI();
  }
}
