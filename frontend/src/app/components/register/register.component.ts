import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  errorMessage = '';
  showAdminCode = false;
  

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    admin_code: [''] // Nessun validatore, quindi è opzionale
  }, {
    validators: this.passwordMatchValidator
  });
  }

  ngOnInit() {
    this.registerForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      admin_code: ['']
    }, {
      validators: this.passwordMatchValidator
    });
    
    // Se già autenticato, reindirizza
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/']);
    }
  }
  get formValid(): boolean {
  const form = this.registerForm;
  
  // Verifica i campi obbligatori
  const nomeValid = form.get('nome')?.valid;
  const emailValid = form.get('email')?.valid;
  const passwordValid = form.get('password')?.valid;
  const confirmPasswordValid = form.get('confirmPassword')?.valid;
  
  // Verifica che le password corrispondano
  const passwordsMatch = form.get('password')?.value === form.get('confirmPassword')?.value;
  
  // Il form è valido se tutti i campi obbligatori sono validi E le password corrispondono
  // Il campo admin_code NON influisce sulla validità del form
  return !!(nomeValid && emailValid && passwordValid && confirmPasswordValid && passwordsMatch);
}

  // Validatore personalizzato per verificare la corrispondenza delle password
  passwordMatchValidator(formGroup: FormGroup) {
  const password = formGroup.get('password')?.value;
  const confirmPassword = formGroup.get('confirmPassword')?.value;
  
  if (password !== confirmPassword) {
    formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    // Importante: rimuove l'errore passwordMismatch se presente
    const confirmPasswordControl = formGroup.get('confirmPassword');
    if (confirmPasswordControl?.hasError('passwordMismatch')) {
      // Mantiene gli altri errori se presenti
      const errors = { ...confirmPasswordControl.errors };
      delete errors['passwordMismatch'];
      confirmPasswordControl.setErrors(Object.keys(errors).length ? errors : null);
    }
    return null;
  }
}

  get f() { return this.registerForm.controls; }

  toggleAdminCode() {
    this.showAdminCode = !this.showAdminCode;
  }

  onSubmit() {
    this.submitted = true;
    
    if (this.registerForm.invalid) {
      // Tocca tutti i campi per mostrare gli errori
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    
    const { nome, email, password, admin_code } = this.registerForm.value;
    
    // Prepara dati per la registrazione
    const userData: any = {
      nome,
      email,
      password
    };

    // Aggiungi admin_code solo se presente e visibile
    if (this.showAdminCode && admin_code) {
      userData.admin_code = admin_code;
    }

    this.authService.register(userData).subscribe({
      next: () => {
        this.router.navigate(['/login'], { 
          queryParams: { registered: 'true' } 
        });
      },
      error: error => {
        this.error = error.error?.message || 'Errore durante la registrazione';
        this.loading = false;
      }
    });
  }
}