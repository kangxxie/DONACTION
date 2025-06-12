import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CampaignService } from '../../services/campaign.service';
import { Campaign } from '../../models/campaign.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']   
})
export class HomeComponent implements OnInit {
  campaigns: Campaign[] = []; // Aggiungi questa proprietà

  constructor(
    private campaignService: CampaignService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Carica le campagne all'inizializzazione del componente
    this.campaignService.getAll().subscribe(
      data => this.campaigns = data,
      error => console.error('Errore nel caricamento delle campagne:', error)
    );
  }

  // Aggiungi questo metodo
  donate(campaignId: number): void {
    // Naviga alla pagina di donazione con l'ID della campagna
    this.router.navigate(['/donate', campaignId]);
  }
}
