import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DonationService } from '../../services/donation.service';
import { CampaignService } from '../../services/campaign.service';
import { Campaign } from '../../models/campaign.model';
import { Donation } from '../../models/donation.model';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
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
  selector: 'app-donation-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './donation-form.component.html',
  styleUrls: ['./donation-form.component.css'],
  animations: [
    // Hero animation
    trigger('heroAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.8s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    // Form sections animation
    trigger('formAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    // Steps animation
    trigger('stepsAnimation', [
      transition(':enter', [
        query('.step-item', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(150, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class DonationFormComponent implements OnInit {
  donationForm: FormGroup;
  paymentForm: FormGroup;
  submitted = false;
  success = false;
  loading = false;
  errorMessage = '';
  
  // Predefined donation amounts
  donationAmounts = [10, 25, 50, 100, 250];
  selectedAmount: number | null = null;
  customAmount: number | null = null;
  
  // Campaign data
  campaignId: number | null = null;
  campaign?: Campaign;
  
  // Current step in donation process
  currentStep = 1;
  totalSteps = 3;
  
  // Payment methods - solo carta di credito/debito
  paymentMethods = [
    { id: 'card', name: 'Carta di Credito/Debito', icon: 'credit-card' }
  ];
  selectedPaymentMethod = 'card';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private donationService: DonationService,
    private campaignService: CampaignService,
    private authService: AuthService
  ) {
    this.donationForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)],
      taxDeduction: [false],
      anonymous: [false],
      message: ['']
    });
    
    this.paymentForm = this.formBuilder.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
      cardHolder: ['', Validators.required],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]]
    });
  }

  ngOnInit(): void {
    // Get campaign ID from route params if available
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.campaignId = parseInt(id, 10);
        
        // Carica i dati della campagna
        this.loadCampaignDetails();
      } else {
        // Reindirizza alla lista delle campagne se l'ID non è disponibile
        this.router.navigate(['/campaigns']);
      }
    });
  }
  
  private loadCampaignDetails(): void {
    if (this.campaignId) {
      this.campaignService.getById(this.campaignId).subscribe({
        next: (campaign) => {
          this.campaign = campaign;
        },
        error: () => {
          this.errorMessage = 'Impossibile caricare i dettagli della campagna.';
          setTimeout(() => {
            this.router.navigate(['/campaigns']);
          }, 3000);
        }
      });
    }
  }
  
  get df() { return this.donationForm.controls; }
  get pf() { return this.paymentForm.controls; }
  
  setDonationAmount(amount: number): void {
    this.selectedAmount = amount;
    this.customAmount = null;
  }
  
  setCustomAmount(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    if (value > 0) {
      this.customAmount = value;
      this.selectedAmount = null;
    } else {
      this.customAmount = null;
    }
  }
  
  getTotalDonation(): number {
    return this.selectedAmount || this.customAmount || 0;
  }
  
  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      // Validate current step before proceeding
      if (this.currentStep === 1 && this.getTotalDonation() <= 0) {
        return;
      }
      
      if (this.currentStep === 2 && this.donationForm.invalid) {
        Object.keys(this.donationForm.controls).forEach(key => {
          const control = this.donationForm.get(key);
          if (control) {
            control.markAsTouched();
          }
        });
        return;
      }
      
      this.currentStep++;
      window.scrollTo(0, 0);
    }
  }
  
  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }
  
  // Rimossa la funzione selectPaymentMethod poiché ora c'è solo un metodo di pagamento  
  submitDonation(): void {
    console.log('Invio donazione iniziato');
    this.submitted = true;
    this.errorMessage = '';
    
    // Verifica importo
    if (this.getTotalDonation() <= 0) {
      this.errorMessage = 'Inserisci un importo valido per la donazione.';
      console.log('Errore: importo donazione non valido');
      return;
    }
    
    // Verifica validità form pagamento
    if (this.paymentForm.invalid) {
      console.log('Form pagamento non valido:', this.paymentForm.errors);
      
      // Marca tutti i campi come toccati per mostrare gli errori
      Object.keys(this.paymentForm.controls).forEach(key => {
        const control = this.paymentForm.get(key);
        if (control) {
          control.markAsTouched();
          console.log(`Campo ${key} valido:`, !control.errors, control.errors);
        }
      });
      
      this.errorMessage = 'Controlla che tutti i campi della carta siano compilati correttamente.';
      return;
    }
    
    console.log('Form valido, inizia il processo di donazione');
    this.loading = true;
    
    // Assicurati che campaignId sia valido
    if (!this.campaignId) {
      this.errorMessage = 'ID campagna non valido.';
      this.loading = false;
      console.log('Errore: campaignId non valido');
      return;
    }
    
    // Preparazione dati della donazione
    const donationData: Partial<Donation> = {
      campaign_id: this.campaignId,
      amount: this.getTotalDonation(),
      payment_method: 'card', // Solo card è supportato
      donor_name: this.df['firstName']?.value + ' ' + this.df['lastName']?.value,
      email: this.df['email']?.value
    };
    
    // Chiamata al backend
    console.log('Invio dati donazione:', donationData);
    
    try {
      // Prima impostiamo un timeout di sicurezza per evitare che l'utente aspetti indefinitamente
      const timeoutId = setTimeout(() => {
        if (this.loading) {
          console.error('Timeout donazione - nessuna risposta dal server dopo 20 secondi');
          this.loading = false;
          this.errorMessage = 'Il server non risponde. Verifica la tua connessione e riprova.';
        }
      }, 20000);
      
      // Debug per verificare che l'indirizzo API sia corretto
      console.log('URL API:', environment.apiUrl);
      // Debug per verificare lo stato di autenticazione
      console.log('Utente autenticato:', !!this.authService.currentUserValue);
      
      this.donationService.donate(donationData).subscribe({
        next: (response: Donation) => {
          clearTimeout(timeoutId); // Annulla il timeout
          console.log('Risposta donazione ricevuta:', response);
          this.loading = false;          this.success = true;
          
          // Aggiorna i dati della campagna con il nuovo importo raccolto
          if (this.campaign && response.campaign_collected) {
            this.campaign.collected = response.campaign_collected;
          }
            // Forza un aggiornamento delle donazioni dell'utente nel servizio
          // Questo assicura che la dashboard utente mostrerà i dati aggiornati
          console.log('Donazione completata, aggiornamento donazioni utente...');
          this.donationService.refreshDonations();
          
          // Reset forms
          this.donationForm.reset();
          this.paymentForm.reset();
          this.submitted = false;
            // Auto reset del messaggio di successo e reindirizza alla pagina delle campagne dopo 3 secondi
          setTimeout(() => {
            this.success = false;
            this.router.navigate(['/campaigns']); // Reindirizza all'elenco delle campagne invece che alla dashboard
          }, 3000);
        },
        error: (error: any) => {
          clearTimeout(timeoutId); // Annulla il timeout
          console.error('Errore durante la donazione:', error);
          this.loading = false;
          
          // Gestione degli errori specifici
          if (error.status === 0) {
            this.errorMessage = 'Impossibile connettersi al server. Verifica la tua connessione Internet.';
          } else if (error.status === 400) {
            this.errorMessage = error.error?.message || 'I dati della donazione non sono validi. Verifica tutte le informazioni.';
          } else if (error.status === 401) {
            this.errorMessage = 'Sessione scaduta. Effettua nuovamente il login.';
            // Reindirizzamento al login dopo 2 secondi
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.errorMessage = error.error?.message || 'Si è verificato un errore durante l\'elaborazione della donazione.';
          }
          
          console.log('Errore visualizzato:', this.errorMessage);
          
          // Reset messaggio errore dopo 10 secondi
          setTimeout(() => {
            this.errorMessage = '';
          }, 10000);
        }
      });
    } catch (error) {
      console.error('Errore imprevisto:', error);
      this.loading = false;
      this.errorMessage = 'Si è verificato un errore imprevisto. Riprova più tardi.';
    }
  }
}

