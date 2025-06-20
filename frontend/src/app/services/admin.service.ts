import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Dashboard stats
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/dashboard`);
  }

  // Gestione Utenti - solo per admin
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
    // Se l'utente è un team member, ottieni solo le sue campagne
    if (this.authService.isTeamMember) {
      return this.getTeamMemberCampaigns(page, limit);
    }
    
    // Altrimenti, se è admin, ottieni tutte le campagne
    return this.http.get<any>(`${this.apiUrl}/campaigns`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  // Metodo specifico per ottenere solo le campagne create dal team member corrente
  getTeamMemberCampaigns(page: number = 1, limit: number = 10): Observable<any> {
    const userId = this.authService.currentUserValue?.id;
    return this.http.get<any>(`${this.apiUrl}/campaigns/creator/${userId}`, {
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

  // Gestione Donazioni - solo per admin
  getDonations(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/donations`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  getDonationDetails(donationId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/donations/${donationId}`);
  }

  // Export reports - solo per admin
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