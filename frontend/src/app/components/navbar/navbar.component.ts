import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CampaignService } from '../../services/campaign.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  animations: [
    trigger('dropdownAnimation', [
      state('hidden', style({
        height: '0',
        opacity: '0',
        overflow: 'hidden'
      })),
      state('visible', style({
        height: '*',
        opacity: '1'
      })),
      transition('hidden => visible', [
        animate('300ms ease-in')
      ]),
      transition('visible => hidden', [
        animate('300ms ease-out')
      ])
    ])
  ]
})
export class NavbarComponent {
  isMenuOpen = false;
  campaigns: any[] = [];
  
  constructor(
    private campaignService: CampaignService,
    private router: Router
  ) {
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

    donate(campaignId: number): void {
    this.router.navigate(['/donate', campaignId]);
  }
}
