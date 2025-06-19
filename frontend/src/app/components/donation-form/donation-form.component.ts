import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
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
  
  // Predefined donation amounts
  donationAmounts = [10, 25, 50, 100, 250];
  selectedAmount: number | null = null;
  customAmount: number | null = null;
  
  // Campaign ID from route params
  campaignId: string | null = null;
  
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
    private route: ActivatedRoute
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
      this.campaignId = params.get('id');
    });
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
    this.submitted = true;
    
    if (this.paymentForm.invalid || this.getTotalDonation() <= 0) {
      Object.keys(this.paymentForm.controls).forEach(key => {
        const control = this.paymentForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      return;
    }
    
    this.loading = true;
    
    // Simulazione dell'elaborazione del pagamento
    setTimeout(() => {
      this.loading = false;
      this.success = true;
      
      // Reset forms
      this.donationForm.reset();
      this.paymentForm.reset();
      this.submitted = false;
      
      // Auto reset del messaggio di successo dopo 5 secondi
      setTimeout(() => {
        this.success = false;
        this.currentStep = 1;
        this.selectedAmount = null;
        this.customAmount = null;
      }, 10000);
    }, 2000);
  }
}

