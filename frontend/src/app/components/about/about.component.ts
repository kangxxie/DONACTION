import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  trigger, 
  state, 
  style, 
  animate, 
  transition, 
  query, 
  stagger 
} from '@angular/animations';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  animations: [
    // Hero animation
    trigger('heroAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.8s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    // Mission section animation
    trigger('missionAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    // Team members animation with stagger
    trigger('teamAnimation', [
      transition(':enter', [
        query('.team-member', [
          style({ opacity: 0, transform: 'translateY(40px)' }),
          stagger(100, [
            animate('0.5s cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    // Values animation with stagger
    trigger('valuesAnimation', [
      transition(':enter', [
        query('.value-card', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(150, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    // Timeline animation
    trigger('timelineAnimation', [
      transition(':enter', [
        query('.timeline-item', [
          style({ opacity: 0, transform: 'translateX(-30px)' }),
          stagger(200, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class AboutComponent implements OnInit {
  teamMembers = [
    {
      name: 'Marco Soffia ',
      position: 'Fondatore & CEO',
      bio: 'Con oltre 15 anni di esperienza nel settore no-profit, Marco ha fondato DONACTION con la visione di rendere la beneficenza più accessibile e trasparente.',
      image: 'assets/team/marco.jpg'
    },
    {
      name: 'Laura Bianchi',
      position: 'Direttrice Operativa',
      bio: 'Laura coordina tutte le operazioni e si assicura che ogni donazione raggiunga efficacemente il suo obiettivo.',
      image: 'assets/team/laura.jpg'
    },
    {
      name: 'Alessandro Verdi',
      position: 'Responsabile Progetti',
      bio: 'Alessandro seleziona e monitora le campagne, garantendo che ogni progetto abbia un impatto reale e misurabile.',
      image: 'assets/team/alessandro.jpg'
    },
    {
      name: 'Giulia Marino',
      position: 'Responsabile Marketing',
      bio: 'Giulia sviluppa strategie per aumentare la visibilità dei progetti e coinvolgere nuovi donatori.',
      image: 'assets/team/giulia.jpg'
    }
  ];

  constructor() { }

  ngOnInit(): void { }
}
