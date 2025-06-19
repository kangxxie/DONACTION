import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Campaign } from '../../models/campaign.model';
import { CampaignService } from '../../services/campaign.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';
import { 
  trigger, 
  state, 
  style, 
  animate, 
  transition, 
  query, 
  stagger 
} from '@angular/animations';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, CurrencyPipe],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    // Hero section animation
    trigger('heroAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.8s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    // Featured campaigns animation with stagger effect
    trigger('campaignAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(40px)' }),
          stagger(100, [
            animate('0.6s cubic-bezier(0.35, 0, 0.25, 1)', 
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    // How it works section animation
    trigger('stepsAnimation', [
      transition(':enter', [
        query('.step', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(200, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    // Stats animation
    trigger('statsAnimation', [
      transition(':enter', [
        query('.stat', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(150, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  campaigns: Campaign[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private campaignService: CampaignService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCampaigns();
  }
  loadCampaigns(): void {
    this.loading = true;
    this.campaignService.getAll().subscribe({
      next: (data) => {
        // Limita a massimo 3 campagne per la home page
        this.campaigns = data.slice(0, 3);
        this.loading = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento delle campagne:', error);
        this.error = 'Impossibile caricare le campagne. Riprova più tardi.';
        this.loading = false;
        
        // Per scopi di sviluppo, aggiungi dati fittizi quando il backend non è disponibile
        this.addMockCampaigns();
      }
    });
  }

  donate(campaignId: number): void {
  this.authService.currentUser.pipe(take(1)).subscribe(user => {
    if (user) {
      // Utente autenticato - vai direttamente alla pagina di donazione
      this.router.navigate(['/donate', campaignId]);
    } else {
      // Utente non autenticato - reindirizza al login con parametri per redirect
      this.router.navigate(['/login'], { 
        queryParams: { 
          redirect: `/donate/${campaignId}`, 
          campaign: campaignId.toString() 
        } 
      });
    }
  });
}
  
  // Metodo per aggiungere dati di esempio per lo sviluppo
  private addMockCampaigns(): void {
    this.campaigns = [
      {
        id: 1,
        title: 'Aiuto per il terremoto in Centro Italia',
        description: 'Supporta le famiglie colpite dal terremoto nel Centro Italia con cibo, riparo e assistenza medica.',
        goal: 50000,
        collected: 32600,
        imageUrl: './assets/earthquake.png',
        category: 'Terremoti'
      },
      {
        id: 2,
        title: 'Educazione per bambini in difficoltà',
        description: 'Finanzia programmi educativi per bambini provenienti da famiglie a basso reddito in tutta Italia.',
        goal: 25000,
        collected: 18750,
        imageUrl: './assets/education.png',
        category: 'Educazione'
      },
      {
        id: 3,
        title: 'Ospedali pediatrici: nuove attrezzature',
        description: 'Aiuta ad acquistare nuove attrezzature mediche per migliorare la diagnosi e il trattamento nei reparti pediatrici.',
        goal: 75000,
        collected: 42300,
        imageUrl: './assets/hospital.png',
        category: 'Ospedali'
      }
    ];
  }
}
