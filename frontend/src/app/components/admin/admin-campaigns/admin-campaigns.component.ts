import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { CampaignService } from '../../../services/campaign.service';
import { AuthService } from '../../../services/auth.service';
import { Campaign } from '../../../models/campaign.model';

@Component({
  selector: 'app-admin-campaigns',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-campaigns.component.html',
  styleUrls: ['./admin-campaigns.component.css']
})
export class AdminCampaignsComponent implements OnInit {
  campaigns: Campaign[] = [];
  loading = true;
  error = '';
  searchQuery = '';
  isAdmin = false;

  constructor(
    private adminService: AdminService,
    private campaignService: CampaignService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin;
    this.loadCampaigns();
  }

  loadCampaigns(): void {
    this.loading = true;
    this.campaignService.getAll().subscribe({
      next: (data) => {
        this.campaigns = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento delle campagne:', err);
        this.error = 'Si è verificato un errore nel caricamento delle campagne.';
        this.loading = false;
      }
    });
  }

  deleteCampaign(id: number): void {
    if (confirm('Sei sicuro di voler eliminare questa campagna? Questa azione non può essere annullata.')) {
      this.adminService.deleteCampaign(id).subscribe({
        next: () => {
          this.campaigns = this.campaigns.filter(campaign => campaign.id !== id);
          alert('Campagna eliminata con successo!');
        },
        error: (err) => {
          console.error('Errore nell\'eliminazione della campagna:', err);
          alert('Si è verificato un errore nell\'eliminazione della campagna.');
        }
      });
    }
  }

  get filteredCampaigns(): Campaign[] {
    if (!this.searchQuery) return this.campaigns;
    
    const query = this.searchQuery.toLowerCase();
    return this.campaigns.filter(campaign =>
      campaign.title.toLowerCase().includes(query) ||
      campaign.description.toLowerCase().includes(query) ||
      campaign.category.toLowerCase().includes(query)
    );
  }
}
