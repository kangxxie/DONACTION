// src/app/services/campaign.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Campaign } from '../models/campaign.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private apiUrl = `${environment.apiUrl}/campaigns`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(this.apiUrl);
  }

  getById(id: number): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.apiUrl}/${id}`);
  }

  create(campaign: Partial<Campaign>): Observable<Campaign> {
    return this.http.post<Campaign>(this.apiUrl, campaign);
  }

  update(id: number, campaign: Partial<Campaign>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, campaign);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
