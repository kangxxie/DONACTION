import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css'
})
export class PrivacyPolicyComponent {
  // Proprietà per il controllo delle tabs
  activeTab = 'privacy'; // Default tab
  
  // Metodo per cambiare tab
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    
    // Aggiunge il tab attivo all'URL come frammento
    const url = new URL(window.location.href);
    url.hash = tab;
    window.history.replaceState({}, '', url.toString());
  }
  
  // Metodo per controllare se una tab è attiva
  isActive(tab: string): boolean {
    return this.activeTab === tab;
  }
  
  ngOnInit(): void {    // Controlla se c'è un frammento nell'URL per impostare la tab attiva
    const hash = window.location.hash.replace('#', '');
    if (hash === 'privacy' || hash === 'terms') {
      this.activeTab = hash;
    }
  }
}
