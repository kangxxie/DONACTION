import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  // Campi comuni
  step: 'email' | 'reset' = 'email';
  loading = false;
  submitted = false;
  error = '';
  successMessage = '';

  // Step 1 - Email form
  emailForm!: FormGroup;
  
  // Step 2 - Reset form
  resetForm!: FormGroup;
  resetToken: string = '';
  userId: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Validatore personalizzato per verificare che le password coincidano
  passwordMatchValidator(g: FormGroup) {
    const newPassword = g.get('newPassword')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { 'mismatch': true };
  }

  // Invio del modulo email
  onSubmitEmail(): void {
    this.submitted = true;
    this.error = '';
    this.successMessage = '';
    
    if (this.emailForm.invalid) {
      return;
    }

    this.loading = true;
    const email = this.emailForm.controls['email'].value;
    
    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (response.token && response.userId) {
          // Salva token e userId per il prossimo step
          this.resetToken = response.token;
          this.userId = response.userId;
          
          // Passa allo step di reset password
          this.step = 'reset';
          this.successMessage = 'Email verificata. Inserisci la nuova password.';
        } else {
          this.error = 'Errore nella verifica dell\'email. Riprova.';
        }
      },
      error: error => {
        this.error = error?.error?.message || 'L\'email inserita non è associata a nessun account.';
        this.loading = false;
      }
    });
  }
  
  // Invio del modulo reset password
  onSubmitReset(): void {
    this.submitted = true;
    this.error = '';
    this.successMessage = '';
    
    if (this.resetForm.invalid) {
      return;
    }
    
    this.loading = true;
    const newPassword = this.resetForm.controls['newPassword'].value;
    const confirmPassword = this.resetForm.controls['confirmPassword'].value;
    
    this.authService.resetPassword(
      this.resetToken,
      this.userId,
      newPassword,
      confirmPassword
    ).subscribe({
      next: () => {
        this.successMessage = 'Password aggiornata con successo!';
        this.loading = false;
        
        // Reindirizza al login dopo 2 secondi con parametro per mostrare messaggio di successo
        setTimeout(() => {
          this.router.navigate(['/login'], { 
            queryParams: { passwordReset: 'true' } 
          });
        }, 2000);
      },
      error: error => {
        this.error = error?.error?.message || 'Errore nel reset della password.';
        this.loading = false;
      }
    });
  }
}
