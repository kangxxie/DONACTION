import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CampaignService } from '../../../services/campaign.service';
import { AdminService } from '../../../services/admin.service';
import { Campaign } from '../../../models/campaign.model';
import { AuthService } from '../../../services/auth.service';

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
  }

  loadCampaign(id: number): void {
    this.loading = true;
    this.campaignService.getById(id).subscribe({
      next: (data) => {
        this.campaign = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento della campagna:', err);
        this.errorMessage = 'Errore nel caricamento della campagna. Riprova più tardi.';
        this.loading = false;
      }
    });
  }

  saveCampaign(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    if (this.isEditing && this.campaign.id) {
      // Aggiornamento
      this.adminService.updateCampaign(this.campaign.id, this.campaign).subscribe({
        next: () => {
          this.successMessage = 'Campagna aggiornata con successo!';
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/admin/campaigns']);
          }, 1500);
        },
        error: (err) => {
          console.error('Errore nell\'aggiornamento della campagna:', err);
          this.errorMessage = 'Si è verificato un errore nell\'aggiornamento della campagna.';
          this.loading = false;
        }
      });
    } else {
      // Creazione
      this.adminService.createCampaign(this.campaign).subscribe({
        next: () => {
          this.successMessage = 'Campagna creata con successo!';
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/admin/campaigns']);
          }, 1500);
        },
        error: (err) => {
          console.error('Errore nella creazione della campagna:', err);
          this.errorMessage = 'Si è verificato un errore nella creazione della campagna.';
          this.loading = false;
        }
      });
    }
  }
}
