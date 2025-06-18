import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.forgotForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.successMessage = '';
    
    if (this.forgotForm.invalid) {
      return;
    }

    this.loading = true;
    const email = this.forgotForm.controls['email'].value;
    
    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.successMessage = 'Abbiamo inviato un\'email con le istruzioni per reimpostare la password. Controlla la tua casella di posta.';
        this.loading = false;
      },
      error: error => {
        this.error = error?.error?.message || 'L\'email inserita non è associata a nessun account.';
        this.loading = false;
      }
    });
  }
}
