import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CampaignService } from '../../../services/campaign.service';
import { AdminService } from '../../../services/admin.service';
import { Campaign } from '../../../models/campaign.model';
import { AuthService } from '../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-campaign-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.css']
})
export class CampaignFormComponent implements OnInit {
  campaign: Partial<Campaign> = {
    title: '',
    description: '',
    goal: 0,
    collected: 0,
    imageUrl: '',
    category: ''
  };
  
  isEditing = false;
  loading = false;
  errorMessage = '';
  successMessage = '';
  lastError: any = null;
  
  // Categorie predefinite
  categories = ['Terremoti', 'Educazione', 'Ospedali', 'Ambiente', 'Fame', 'Rifugiati'];

  constructor(
    private campaignService: CampaignService,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.isEditing = true;
      this.loadCampaign(Number(id));
    }

    // Debug information
    console.log('Current auth state:', {
      user: this.authService.currentUserValue,
      isLoggedIn: this.authService.isLoggedIn,
      token: this.authService.getToken()?.substring(0, 20) + '...'  // Only show part of the token for security
    });
  }

  loadCampaign(id: number): void {
    this.loading = true;
    this.campaignService.getById(id).subscribe({
      next: (data) => {
        this.campaign = data;
        this.loading = false;
        console.log('Campaign loaded successfully:', this.campaign);
      },
      error: (err) => {
        console.error('Errore nel caricamento della campagna:', err);
        this.errorMessage = 'Errore nel caricamento della campagna. Riprova più tardi.';
        this.loading = false;
        this.lastError = err;
      }
    });
  }

  saveCampaign(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Log dei dati che stiamo per inviare
    console.log('Salvataggio campagna - Dati completi:', this.campaign);
    
    if (this.isEditing && this.campaign.id) {
      // Prepara i dati da inviare (solo i campi necessari)
      const updateData = {
        title: this.campaign.title,
        description: this.campaign.description,
        goal: this.campaign.goal,
        imageUrl: this.campaign.imageUrl,
        category: this.campaign.category
      };
      
      console.log('Aggiornamento campagna - Dati inviati:', updateData);
      console.log('URL per update:', `/api/campaigns/${this.campaign.id}`);
      
      // Aggiornamento
      this.campaignService.update(this.campaign.id, updateData).subscribe({
        next: (response) => {
          console.log('Risposta dal server:', response);
          this.successMessage = 'Campagna aggiornata con successo!';
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/admin/campaigns']);
          }, 1500);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Errore nell\'aggiornamento della campagna:', err);
          console.error('Status:', err.status);
          console.error('Messaggio:', err.error?.message || err.message);
          this.errorMessage = 'Si è verificato un errore nell\'aggiornamento della campagna: ' + (err.error?.message || err.message);
          this.loading = false;
          this.lastError = err;
          
          // Debug dettagliato dell'errore
          this.debugHttpError(err);
        }
      });
    } else {
      // Creazione
      console.log('Creazione nuova campagna - Dati inviati:', this.campaign);
      
      this.campaignService.create(this.campaign).subscribe({
        next: (response) => {
          console.log('Risposta dal server (creazione):', response);
          this.successMessage = 'Campagna creata con successo!';
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/admin/campaigns']);
          }, 1500);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Errore nella creazione della campagna:', err);
          console.error('Status:', err.status);
          console.error('Messaggio:', err.error?.message || err.message);
          this.errorMessage = 'Si è verificato un errore nella creazione della campagna: ' + (err.error?.message || err.message);
          this.loading = false;
          this.lastError = err;
          
          // Debug dettagliato dell'errore
          this.debugHttpError(err);
        }
      });
    }
  }

  // Metodo per ritentare l'invio dopo un errore
  retrySubmit(): void {
    console.log('Ritentativo di invio dati...');
    this.saveCampaign();
  }

  // Helper per il debug degli errori HTTP
  private debugHttpError(err: HttpErrorResponse): void {
    console.group('Dettagli errore HTTP:');
    console.log('URL:', err.url);
    console.log('Status:', err.status, err.statusText);
    console.log('Headers:', err.headers);
    console.log('Error object:', err.error);
    
    if (err.status === 0) {
      console.warn('ERRORE DI CONNESSIONE: Impossibile connettersi al server');
    } else if (err.status === 401) {
      console.warn('ERRORE DI AUTENTICAZIONE: Token mancante o non valido');
    } else if (err.status === 403) {
      console.warn('ERRORE DI AUTORIZZAZIONE: Permessi insufficienti');
    } else if (err.status === 404) {
      console.warn('ERRORE 404: Risorsa non trovata');
    } else if (err.status >= 500) {
      console.warn('ERRORE SERVER:', err.status);
    }
    
    console.groupEnd();
  }
}
