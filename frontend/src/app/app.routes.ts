import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CampaignListComponent } from './components/campaign-list/campaign-list.component';
import { CampaignDetailComponent } from './components/campaign-detail/campaign-detail.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { DonationFormComponent } from './components/donation-form/donation-form.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AdminCampaignsComponent } from './components/admin/admin-campaigns/admin-campaigns.component';
import { AdminUsersComponent } from './components/admin/admin-users/admin-users.component';
import { AdminDonationsComponent } from './components/admin/admin-donations/admin-donations.component';
import { CampaignFormComponent } from './components/admin/campaign-form/campaign-form.component';

export const routes: Routes = [
  // Percorsi pubblici
  { path: '', component: HomeComponent },
  { path: 'campaigns', component: CampaignListComponent },
  { path: 'campaign/:id', component: CampaignDetailComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'donate', component: DonationFormComponent },
  { path: 'privacy-policy', loadComponent: () => import('./components/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent) },
  { path: 'donate/:id', component: DonationFormComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
    // Percorsi per utenti registrati
  { 
    path: 'profile', 
    component: ProfileComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'team', 'registered'] }
  },
  { 
    path: 'dashboard', 
    redirectTo: 'campaigns',
    pathMatch: 'full'
  },
  
  // Percorsi per admin e team
  { 
    path: 'admin/dashboard', 
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'team'] }
  },
  { 
    path: 'admin/campaigns', 
    component: AdminCampaignsComponent, 
    canActivate: [AuthGuard], 
    data: { roles: ['admin', 'team'] }
  },
  { 
    path: 'admin/campaigns/new', 
    component: CampaignFormComponent, 
    canActivate: [AuthGuard], 
    data: { roles: ['admin', 'team'] }
  },
  { 
    path: 'admin/campaigns/edit/:id', 
    component: CampaignFormComponent, 
    canActivate: [AuthGuard], 
    data: { roles: ['admin', 'team'] }
  },
  
  // Percorsi solo per admin
  { 
    path: 'admin/users', 
    component: AdminUsersComponent, 
    canActivate: [AuthGuard], 
    data: { roles: ['admin'] }
  },
  { 
    path: 'admin/donations', 
    component: AdminDonationsComponent, 
    canActivate: [AuthGuard], 
    data: { roles: ['admin'] }
  },
  
  // Gestione percorsi non trovati
  { path: '**', redirectTo: '' }
];
