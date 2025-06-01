// src/app/services/donation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Donation } from '../models/donation.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private apiUrl = `${environment.apiUrl}/donations`;

  constructor(private http: HttpClient) {}

  getByCampaign(campaignId: number): Observable<Donation[]> {
    return this.http.get<Donation[]>(`${this.apiUrl}/${campaignId}`);
  }

  donate(donation: Partial<Donation>): Observable<Donation> {
    return this.http.post<Donation>(this.apiUrl, donation);
  }
}
