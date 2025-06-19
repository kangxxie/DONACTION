import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit, AfterViewInit {
  currentUser: any = null;
  userDonations: any[] = []; // Simuliamo dati per ora
  isLoading = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    
    // Simulazione caricamento dati (per mostrare animazione)
    setTimeout(() => {
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
      
      this.isLoading = false;
    }, 800);
  }
    ngAfterViewInit() {
    // Piccolo delay per assicurarci che gli elementi siano caricati correttamente
    setTimeout(() => {
      // Animazione numeri contatori
      this.animateCounters();
    }, 100);
  }
  
  get totalDonationAmount(): number {
    return this.userDonations.reduce((sum, donation) => sum + donation.amount, 0);
  }
    animateCounters() {
    // Semplice animazione per i contatori numerici
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
      if (counter instanceof HTMLElement) {
        const target = parseInt(counter.innerText, 10);
        let count = 0;
        // Usa una durata fissa per animazione più fluida
        const duration = 1500; // 1.5 secondi per l'animazione
        const framesPerSecond = 60;
        const totalFrames = duration / 1000 * framesPerSecond;
        const increment = target / totalFrames;
        
        const updateCount = () => {
          if (count < target) {
            count += increment;
            // Arrotonda per evitare decimali
            const displayCount = Math.min(Math.round(count), target);
            counter.innerText = displayCount.toString();
            requestAnimationFrame(updateCount);
          } else {
            counter.innerText = target.toString();
          }
        };
        
        // Usa requestAnimationFrame per animazioni più fluide
        requestAnimationFrame(updateCount);
      }
    });
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}