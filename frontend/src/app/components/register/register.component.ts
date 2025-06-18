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
  showAdminCode = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
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

  // Validatore personalizzato per verificare la corrispondenza delle password
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Manteniamo altri errori che potrebbero essere presenti
      const errors = formGroup.get('confirmPassword')?.errors;
      if (errors && Object.keys(errors).filter(key => key !== 'passwordMismatch').length) {
        // Se ci sono altri errori oltre a passwordMismatch, li manteniamo
        const newErrors = { ...errors };
        delete newErrors['passwordMismatch'];
        formGroup.get('confirmPassword')?.setErrors(newErrors);
      } else {
        formGroup.get('confirmPassword')?.setErrors(null);
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