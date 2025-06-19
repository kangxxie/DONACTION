import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Campaign } from '../../models/campaign.model';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CampaignService } from '../../services/campaign.service';
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
  selector: 'app-campaign-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CurrencyPipe],
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.css'],
  animations: [
    // Fade in animation for campaign cards with stagger effect
    trigger('cardAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(50px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    // Filter section animation
    trigger('filterAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    // Progress bar animation
    trigger('progressAnimation', [
      transition(':enter', [
        style({ width: 0 }),
        animate('1s cubic-bezier(0.35, 0, 0.25, 1)', style({ width: '*' }))
      ])
    ])
  ]
})
export class CampaignListComponent implements OnInit {
  campaigns: Campaign[] = [];
  filteredCampaigns: Campaign[] = [];
  loading: boolean = true;
  error: string | null = null;
  
  // Filter variables
  searchQuery: string = '';
  sortOption: string = 'newest';
  categoryFilter: string = 'all';
  
  // Categories for filtering
  categories: string[] = ['Terremoti', 'Educazione', 'Ospedali', 'Ambiente', 'Fame', 'Rifugiati'];

  constructor(private campaignService: CampaignService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadCampaigns();
  }

  loadCampaigns(): void {
    this.loading = true;
    this.campaignService.getAll().subscribe({
      next: (data) => {
        this.campaigns = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Impossibile caricare le campagne. Riprova più tardi.';
        this.loading = false;
        console.error('Error loading campaigns:', error);
        
        // Load mock data for development

        this.addMockCampaigns();
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    // Start with all campaigns
    let result = [...this.campaigns];
    
    // Apply category filter
    if (this.categoryFilter !== 'all') {
      result = result.filter(campaign => 
        campaign.category === this.categoryFilter
      );
    }
    
    // Apply search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(campaign =>
        campaign.title.toLowerCase().includes(query) ||
        campaign.description.toLowerCase().includes(query)
      );
    }
    
    // Apply sort
    switch(this.sortOption) {
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      case 'mostFunded':
        result.sort((a, b) => (b.collected / b.goal) - (a.collected / a.goal));
        break;
      case 'leastFunded':
        result.sort((a, b) => (a.collected / a.goal) - (b.collected / b.goal));
        break;
      case 'goalHighest':
        result.sort((a, b) => b.goal - a.goal);
        break;
    }
    
    this.filteredCampaigns = result;
  }
  
  onSearchChange(): void {
    this.applyFilters();
  }
  onDonateClick(campaignId: number): void {
    // Verifica se l'utente è autenticato
    if (this.authService.isAuthenticated()) {
      // Utente autenticato - vai al form di donazione
      this.router.navigate(['/donate', campaignId]);
    } else {
      // Utente non autenticato - vai alla pagina di login
      this.router.navigate(['/login'], { 
        queryParams: { 
          redirect: `/donate/${campaignId}`, 
          campaign: campaignId 
        } 
      });
    }
  }
  
  onSortChange(): void {
    this.applyFilters();
  }
  
  onCategoryChange(): void {
    this.applyFilters();
  }
  
  resetFilters(): void {
    this.searchQuery = '';
    this.sortOption = 'newest';
    this.categoryFilter = 'all';
    this.applyFilters();
  }
  
  // Add mock campaigns for development
  private addMockCampaigns(): void {
    this.campaigns = [
      {
        id: 1,
        title: 'Aiuto per il terremoto in Centro Italia',
        description: 'Supporta le famiglie colpite dal terremoto nel Centro Italia con cibo, riparo e assistenza medica.',
        goal: 50000,
        collected: 32600,
        imageUrl: 'assets/earthquake.png',
        category: 'Terremoti'
      },
      {
        id: 2,
        title: 'Educazione per bambini in difficoltà',
        description: 'Finanzia programmi educativi per bambini provenienti da famiglie a basso reddito in tutta Italia.',
        goal: 25000,
        collected: 18750,
        imageUrl: 'assets/education.png',
        category: 'Educazione'
      },
      {
        id: 3,
        title: 'Ospedali pediatrici: nuove attrezzature',
        description: 'Aiuta ad acquistare nuove attrezzature mediche per migliorare la diagnosi e il trattamento nei reparti pediatrici.',
        goal: 75000,
        collected: 42300,
        imageUrl: 'assets/hospital.png',
        category: 'Ospedali'
      },
      {
        id: 4,
        title: 'Protezione ambientale: pulizia spiagge',
        description: 'Contribuisci alla pulizia delle spiagge italiane e alla protezione dell\'ecosistema marino.',
        goal: 15000,
        collected: 8200,
        imageUrl: 'assets/environment.jpeg',
        category: 'Ambiente'
      },
      {
        id: 5,
        title: 'Mense per senzatetto',
        description: 'Aiuta a fornire pasti caldi e nutrienti ai senzatetto nelle principali città italiane.',
        goal: 30000,
        collected: 21500,
        imageUrl: 'assets/food.jpg',
        category: 'Fame'
      },
      {
        id: 6,
        title: 'Supporto ai rifugiati',
        description: 'Fornisci assistenza legale, medica e sociale ai rifugiati che arrivano in Italia.',
        goal: 45000,
        collected: 27300,
        imageUrl: 'assets/refugees.jpg',
        category: 'Rifugiati'
      }
    ];
  }
}

