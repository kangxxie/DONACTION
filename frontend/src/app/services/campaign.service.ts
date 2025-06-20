// src/app/services/campaign.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Campaign } from '../models/campaign.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private apiUrl = `${environment.apiUrl}/campaigns`;

  constructor(private http: HttpClient) {
    console.log('CampaignService initialized with API URL:', this.apiUrl);
  }

  getAll(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(this.apiUrl).pipe(
      tap(campaigns => console.log(`Fetched ${campaigns.length} campaigns`)),
      catchError(this.handleError('getAll'))
    );
  }

  getById(id: number): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.apiUrl}/${id}`).pipe(
      tap(campaign => console.log(`Fetched campaign id=${id}`, campaign)),
      catchError(this.handleError(`getById(${id})`))
    );
  }

  create(campaign: Partial<Campaign>): Observable<Campaign> {
    console.log('Creating campaign with data:', campaign);
    return this.http.post<Campaign>(this.apiUrl, campaign).pipe(
      tap(response => console.log('Create campaign response:', response)),
      catchError(this.handleError('create'))
    );
  }

  update(id: number, campaign: Partial<Campaign>): Observable<any> {
    console.log(`Updating campaign id=${id} with data:`, campaign);
    
    // Ensure we have the right content type
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    
    return this.http.put(`${this.apiUrl}/${id}`, campaign, httpOptions).pipe(
      tap(response => console.log(`Updated campaign id=${id}`, response)),
      catchError(this.handleError(`update(${id})`))
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(response => console.log(`Deleted campaign id=${id}`, response)),
      catchError(this.handleError(`delete(${id})`))
    );
  }
  
  // Error handler
  private handleError(operation = 'operation') {
    return (error: HttpErrorResponse): Observable<any> => {
      console.error(`${operation} failed:`, error);
      
      // Log detailed information about the error
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        console.error(`Client-side error: ${error.error.message}`);
      } else {
        // Server-side error
        console.error(`Server returned code ${error.status}, body was:`, error.error);
      }
      
      // Return error to the component
      return throwError(() => error);
    };
  }
}
