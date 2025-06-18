import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // Profilo utente
  getUserProfile(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}`);
  }

  updateProfile(userId: number, profileData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${userId}/profile`, profileData);
  }

  changePassword(userId: number, passwordData: { currentPassword: string, newPassword: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${userId}/password`, passwordData);
  }

  // Statistiche utente
  getUserStats(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/stats`);
  }

  // Donazioni dell'utente
  getUserDonations(userId: number, page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/donations`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  // Preferenze utente
  updateUserPreferences(userId: number, preferences: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${userId}/preferences`, preferences);
  }

  getUserPreferences(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/preferences`);
  }

  // Ricevute fiscali
  getUserReceipts(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/receipts`);
  }

  downloadReceipt(receiptId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/receipts/${receiptId}/download`, {
      responseType: 'blob'
    });
  }

  // Avatar utente
  uploadAvatar(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<any>(`${this.apiUrl}/${userId}/avatar`, formData);
  }

  // Campagne preferite
  getFavoriteCampaigns(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/favorite-campaigns`);
  }

  addFavoriteCampaign(userId: number, campaignId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${userId}/favorite-campaigns`, { campaignId });
  }

  removeFavoriteCampaign(userId: number, campaignId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${userId}/favorite-campaigns/${campaignId}`);
  }
}