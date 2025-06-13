import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CampaignService } from '../../services/campaign.service';
import { Campaign } from '../../models/campaign.model';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, CurrencyPipe],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']   
})
export class HomeComponent implements OnInit {
  campaigns: Campaign[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private campaignService: CampaignService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCampaigns();
  }

  loadCampaigns(): void {
    this.loading = true;
    this.campaignService.getAll().subscribe({
      next: (data) => {
        this.campaigns = data;
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
    this.router.navigate(['/donate', campaignId]);
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
        imageUrl: './assets/earthquake.png'
      },
      {
        id: 2,
        title: 'Educazione per bambini in difficoltà',
        description: 'Finanzia programmi educativi per bambini provenienti da famiglie a basso reddito in tutta Italia.',
        goal: 25000,
        collected: 18750,
        imageUrl: './assets/education.png'
      },
      {
        id: 3,
        title: 'Ospedali pediatrici: nuove attrezzature',
        description: 'Aiuta ad acquistare nuove attrezzature mediche per migliorare la diagnosi e il trattamento nei reparti pediatrici.',
        goal: 75000,
        collected: 42300,
        imageUrl: './assets/hospital.png'
      }
    ];
  }
}
