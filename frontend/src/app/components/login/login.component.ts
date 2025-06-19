import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule} from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  passwordResetSuccess = false;
  loginForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  returnUrl: string = '/';
  loading = false;
  redirectUrl: string = '';
  campaignId: string | null = null;
  error = '';
  

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit() {

    // Se già autenticato, reindirizza
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/']);
    }
    this.route.queryParams.subscribe(params => {
      this.redirectUrl = params['redirect'] || '/dashboard';
      this.campaignId = params['campaign'] || null;
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.passwordResetSuccess = this.route.snapshot.queryParams['passwordReset'] === 'true';
  }
  get formValid(): boolean {
    return this.loginForm.valid;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.loading = true;
    this.error = '';
    
    this.authService.login(
      this.loginForm.get('email')?.value,
      this.loginForm.get('password')?.value
    ).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
        this.router.navigateByUrl(this.redirectUrl);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Errore di autenticazione';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}