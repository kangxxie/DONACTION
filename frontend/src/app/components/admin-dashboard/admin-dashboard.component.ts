import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  loading = true;
  stats = {
    totalUsers: 0,
    totalCampaigns: 0,
    totalDonations: 0,
    totalAmount: 0,
    recentDonations: [],
    activeCampaigns: []
  };

  constructor(
    public adminService: AdminService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDashboardStats();
  }

  loadDashboardStats() {
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Errore caricamento statistiche:', error);
        this.loading = false;
      }
    });
  }
}