import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

interface Donation {
  id: number;
  campaign_title: string;
  donor_name: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  donated_at: string;
}

@Component({
  selector: 'app-admin-donations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-donations.component.html',
  styleUrls: ['./admin-donations.component.css']
})
export class AdminDonationsComponent implements OnInit {  donations: Donation[] = [];
  loading = true;
  error = '';
  searchQuery = '';
  dateFilter = ''; // Mantenuto per compatibilità
  totalAmount = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDonations();
  }

  loadDonations(): void {
    this.loading = true;
    this.adminService.getDonations().subscribe({
      next: (data) => {
        this.donations = data;
        this.calculateTotalAmount();
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento delle donazioni:', err);
        this.error = 'Si è verificato un errore nel caricamento delle donazioni.';
        this.loading = false;
      }
    });
  }  calculateTotalAmount(): void {
    this.totalAmount = this.filteredDonations.reduce((sum, donation) => {
      // Assicuriamoci che amount sia un numero
      const amount = typeof donation.amount === 'string' ? parseFloat(donation.amount) : donation.amount;
      return sum + amount;
    }, 0);
  }
  // Il metodo exportCSV è stato rimosso in quanto non più necessario
  get filteredDonations(): Donation[] {
    let result = this.donations;
    
    // Filtra solo per query di ricerca (filtro per stato rimosso)
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(donation =>
        donation.campaign_title.toLowerCase().includes(query) ||
        donation.donor_name.toLowerCase().includes(query) ||
        donation.payment_status.toLowerCase().includes(query)
      );
    }
      // Dopo il filtraggio, ricalcola il totale
    this.totalAmount = result.reduce((sum, donation) => {
      // Assicuriamoci che amount sia un numero
      const amount = typeof donation.amount === 'string' ? parseFloat(donation.amount) : donation.amount;
      return sum + amount;
    }, 0);
    
    return result;
  }
}
