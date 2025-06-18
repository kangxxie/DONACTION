import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  currentUser: any = null;
  userDonations: any[] = []; // Simuliamo dati per ora

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    
    // Simulazione dati donazioni
    this.userDonations = [
      {
        id: 1,
        date: new Date('2025-05-15'),
        amount: 100,
        campaignName: 'Emergenza Alluvione: Aiutiamo le famiglie colpite'
      },
      {
        id: 2,
        date: new Date('2025-05-01'),
        amount: 50,
        campaignName: 'Un Pasto Caldo per Tutti'
      },
      {
        id: 3,
        date: new Date('2025-04-20'),
        amount: 75,
        campaignName: 'Libri e Materiale Scolastico per Bambini in Difficoltà'
      }
    ];
  }
  
  logout() {
    this.authService.logout();
  }
}