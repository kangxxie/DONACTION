import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CampaignService } from '../../services/campaign.service';
import { DonationService } from '../../services/donation.service';
import { AuthService } from '../../services/auth.service';
import { Campaign } from '../../models/campaign.model';
import { Donation } from '../../models/donation.model';

@Component({
  selector: 'app-campaign-detail',
  templateUrl: './campaign-detail.component.html',
  styleUrls: ['./campaign-detail.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class CampaignDetailComponent implements OnInit {
  campaign: Campaign | null = null;
  recentDonations: Donation[] = [];
  loading = true;
  loadingDonations = false;
  error = '';
  isAdmin = false;
  isTeam = false;
  isAuthenticated = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private campaignService: CampaignService,
    private donationService: DonationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Controllo dei permessi
    const currentUser = this.authService.currentUserValue;
    this.isAdmin = currentUser?.role === 'admin';
    this.isTeam = currentUser?.role === 'team';
    this.isAuthenticated = !!currentUser;

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCampaign(id);
  }

  loadCampaign(id: number): void {
    this.loading = true;
    this.campaignService.getById(id).subscribe({
      next: (data) => {
        this.campaign = data;
        this.loading = false;
        this.loadDonations(id);
      },
      error: (err) => {
        console.error('Errore nel caricamento della campagna:', err);
        this.error = 'Impossibile caricare i dettagli della campagna. Riprova più tardi.';
        this.loading = false;
      }
    });
  }

  loadDonations(campaignId: number): void {
    this.loadingDonations = true;
    this.donationService.getByCampaign(campaignId).subscribe({
      next: (data) => {
        this.recentDonations = data.slice(0, 5); // Prendi le prime 5 donazioni
        this.loadingDonations = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento delle donazioni:', err);
        this.loadingDonations = false;
      }
    });
  }

  goToDonate(): void {
    if (this.campaign) {
      this.router.navigate(['/donate', this.campaign.id]);
    }
  }

  editCampaign(): void {
    if (this.campaign) {
      this.router.navigate(['/admin/campaigns/edit', this.campaign.id]);
    }
  }

  getProgressPercentage(): number {
    if (!this.campaign) return 0;
    return Math.min(100, (this.campaign.collected / this.campaign.goal) * 100);
  }

  getDaysLeft(): number {
    // Simuliamo una data di scadenza fittizia (30 giorni dalla data attuale)
    return 30;
  }

  shareOnFacebook(): void {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  }

  shareOnTwitter(): void {
    const url = window.location.href;
    const text = this.campaign ? `Sostieni la campagna: ${this.campaign.title}` : 'Sostieni questa campagna';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  }

  shareOnWhatsApp(): void {
    const url = window.location.href;
    const text = this.campaign ? `Sostieni la campagna: ${this.campaign.title}` : 'Sostieni questa campagna';
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  }
}
