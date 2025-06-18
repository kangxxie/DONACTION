import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  successMessage = '';
  token = '';
  tokenValid = false;
  tokenChecked = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Recupera il token dall'URL
    this.token = this.route.snapshot.params['token'];
    
    // Verifica che il token sia valido
    this.authService.verifyResetToken(this.token).subscribe({
      next: () => {
        this.tokenValid = true;
        this.tokenChecked = true;
        
        // Inizializza il form solo se il token è valido
        this.resetForm = this.formBuilder.group({
          password: ['', [Validators.required, Validators.minLength(8)]],
          confirmPassword: ['', Validators.required]
        }, {
          validators: this.passwordMatchValidator
        });
      },
      error: () => {
        this.tokenValid = false;
        this.tokenChecked = true;
        this.error = 'Il link per reimpostare la password non è valido o è scaduto.';
      }
    });
  }

  // Validatore personalizzato per verificare la corrispondenza delle password
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Mantienamo altri errori
      const errors = formGroup.get('confirmPassword')?.errors;
      if (errors && Object.keys(errors).filter(key => key !== 'passwordMismatch').length) {
        const newErrors = { ...errors };
        delete newErrors['passwordMismatch'];
        formGroup.get('confirmPassword')?.setErrors(newErrors);
      } else {
        formGroup.get('confirmPassword')?.setErrors(null);
      }
      return null;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.successMessage = '';
    
    if (this.resetForm.invalid) {
      return;
    }

    this.loading = true;
    const newPassword = this.resetForm.controls['password'].value;
    
    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: () => {
        this.successMessage = 'Password reimpostata con successo!';
        this.loading = false;
        
        // Reindirizza al login dopo alcuni secondi
        setTimeout(() => {
          this.router.navigate(['/login'], { 
            queryParams: { passwordReset: 'true' } 
          });
        }, 3000);
      },
      error: error => {
        this.error = error?.error?.message || 'Si è verificato un errore durante il reset della password.';
        this.loading = false;
      }
    });
  }
}