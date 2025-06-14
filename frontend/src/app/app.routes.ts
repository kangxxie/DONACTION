// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CampaignListComponent } from './components/campaign-list/campaign-list.component';
import { CampaignDetailComponent } from './components/campaign-detail/campaign-detail.component';
import { DonationFormComponent } from './components/donation-form/donation-form.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'campaigns', component: CampaignListComponent },
  { path: 'campaigns/:id', component: CampaignDetailComponent },
  { path: 'donate/:id', component: DonationFormComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '' }
];
