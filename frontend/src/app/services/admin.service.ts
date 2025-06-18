import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Dashboard stats
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/dashboard`);
  }

  // Gestione Utenti
  getUsers(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  getUserDetails(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${userId}`);
  }

  updateUser(userId: number, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${userId}`, userData);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/users/${userId}`);
  }

  // Gestione Campagne
  getCampaigns(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/campaigns`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  getCampaignDetails(campaignId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/campaigns/${campaignId}`);
  }

  createCampaign(campaignData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/campaigns`, campaignData);
  }

  updateCampaign(campaignId: number, campaignData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/campaigns/${campaignId}`, campaignData);
  }

  deleteCampaign(campaignId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/campaigns/${campaignId}`);
  }

  // Gestione Donazioni
  getDonations(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/donations`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  getDonationDetails(donationId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/donations/${donationId}`);
  }

  // Export reports
  exportDonationsCSV(filters: any = {}): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/donations/export`, {
      params: { ...filters },
      responseType: 'blob'
    });
  }

  exportUsersCSV(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/users/export`, {
      responseType: 'blob'
    });
  }
}