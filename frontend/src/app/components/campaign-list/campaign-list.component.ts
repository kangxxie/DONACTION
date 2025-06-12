import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampaignService } from '../../services/campaign.service';
import { Campaign } from '../../models/campaign.model';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-campaign-list',
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class CampaignListComponent implements OnInit {
  campaigns: Campaign[] = [];
  errorMessage: string = '';

  constructor(private campaignService: CampaignService, private router: Router) {}

  createCampaign(): void {
    // Implementazione del metodo (ad esempio, navigare a una pagina di creazione)
    this.router.navigate(['/campaigns/new']);
    // In alternativa, puoi aprire un modale o implementare altra logica
  }
  ngOnInit(): void {
    this.campaignService.getAll().subscribe(
      data => this.campaigns = data,
      err => this.errorMessage = 'Error fetching campaigns'
    );
  }
}

