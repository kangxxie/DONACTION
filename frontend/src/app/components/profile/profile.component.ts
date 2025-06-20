import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  user: any;
  loading = false;
  submitted = false;
  passSubmitted = false;
  successMessage = '';
  errorMessage = '';
    // Messaggio di ringraziamento sostituisce le statistiche

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    
    this.userService.getUserProfile(this.user.id).subscribe(data => {
      console.log(data);
    });
    // Inizializza i form
    this.profileForm = this.formBuilder.group({
      nome: [this.user?.name || '', [Validators.required, Validators.minLength(2)]],
      email: [this.user?.email || '', [Validators.required, Validators.email]]
    });
    
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
      // Non è più necessario caricare statistiche
  }

  get f() { return this.profileForm.controls; }
  get p() { return this.passwordForm.controls; }
  
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('newPassword')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
      return null;
    }
  }
    // Rimosso metodo loadUserStats() poiché non più necessario

  updateProfile() {
    this.submitted = true;
    
    if (this.profileForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    const userData = {
      nome: this.f['nome'].value,
      email: this.f['email'].value
    };
    
    this.userService.updateProfile(this.user.id, userData).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Profilo aggiornato con successo!';
        // Aggiorna info utente nel service
        this.authService.updateUserData({
          ...this.user,
          name: userData.nome,
          email: userData.email
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Errore durante l\'aggiornamento del profilo';
      }
    });
  }
  
  changePassword() {
    this.passSubmitted = true;
    
    if (this.passwordForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    const passwordData = {
      currentPassword: this.p['currentPassword'].value,
      newPassword: this.p['newPassword'].value
    };
    
    this.userService.changePassword(this.user.id, passwordData).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Password cambiata con successo!';
        this.passwordForm.reset();
        this.passSubmitted = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Errore durante il cambio password';
      }
    });
  }
}