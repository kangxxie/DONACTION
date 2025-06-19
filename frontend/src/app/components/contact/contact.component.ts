import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  animations: [    // Hero animation - standardizzata con la pagina campagne
    trigger('heroAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.8s ease-out', style({ opacity: 1 }))
      ])
    ]),
    // Form section animation
    trigger('formAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    // Info cards animation
    trigger('infoAnimation', [
      transition(':enter', [
        query('.info-card', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(150, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    // FAQ animation
    trigger('faqAnimation', [
      transition(':enter', [
        query('.faq-item', [
          style({ opacity: 0, transform: 'translateX(-20px)' }),
          stagger(100, [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  submitted = false;
  success = false;
  loading = false;
  errorMessage = '';
  
  faqs = [
    {
      question: 'Come posso sapere che la mia donazione è stata ricevuta?',
      answer: 'Dopo aver completato la donazione, riceverai una conferma via email. Puoi anche accedere al tuo account per verificare lo stato delle tue donazioni.'
    },
    {
      question: 'Quanto delle mie donazioni va effettivamente alle cause?',
      answer: 'Almeno il 92% di ogni donazione viene destinato direttamente ai progetti. Il restante 8% serve a coprire i costi operativi e di gestione della piattaforma.'
    },
    {
      question: 'Posso detrarre le donazioni dalle tasse?',
      answer: 'Sì, tutte le donazioni sono fiscalmente deducibili. Nella tua area personale puoi scaricare le ricevute per la dichiarazione dei redditi.'
    },
    {
      question: 'Cosa succede se una campagna non raggiunge l\'obiettivo?',
      answer: 'I fondi raccolti vengono comunque destinati al progetto, che verrà realizzato nei limiti del budget disponibile. In alcuni casi specifici, potremmo proporre ai donatori di destinare i fondi a progetti simili.'
    },
    {
      question: 'Come posso diventare volontario?',
      answer: 'Compila il form di contatto indicando il tuo interesse per il volontariato e sarai contattato dal nostro team per discutere le opportunità disponibili.'
    }
  ];
  
  activeAccordion: number | null = null;

  constructor(private formBuilder: FormBuilder) {
    this.contactForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  ngOnInit(): void {}
  
  toggleAccordion(index: number) {
    if (this.activeAccordion === index) {
    setTimeout(() => {
      this.activeAccordion = null;
    }, 50);
    } else {
    this.activeAccordion = index;
    }
  }
  
  get f() { return this.contactForm.controls; }
  
  onSubmit() {
    this.submitted = true;
    
    if (this.contactForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    // Simulazione dell'invio del form
    setTimeout(() => {
      this.loading = false;
      this.success = true;
      this.contactForm.reset();
      this.submitted = false;
      
      // Resetta il messaggio di successo dopo 5 secondi
      setTimeout(() => {
        this.success = false;
      }, 5000);
    }, 1500);
  }
}
