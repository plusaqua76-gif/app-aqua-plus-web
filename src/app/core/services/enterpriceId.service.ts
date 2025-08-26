import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment.local';
import { END_POINT_SERVICE } from '../../environments/environment.variables';

@Injectable({
  providedIn: 'root',
})
export class EnterpriseIdService {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private isBrowser = isPlatformBrowser(this.platformId);
  private apiUrl = environment.apiUrl;

  private getUserId(): string | null {
    if (!this.isBrowser) return null;

    try {
      const userData = sessionStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.id || null;
      }
      return null;
    } catch (error) {
      console.error('Error parsing userData:', error);
      return null;
    }
  }

  getEnterpriseId(): Observable<number | null> {
    const userId = this.getUserId();

    if (!userId) {
      console.error('No user ID found');
      return of(null);
    }

    return this.http.get<any>(`${this.apiUrl}/${END_POINT_SERVICE.GET_ENTERPRISE}/${userId}`).pipe(
      map((res) => res.response?.idEmpresa || null),
      catchError((error) => {
        console.error('Error fetching enterprise ID:', error);
        return of(null);
      })
    );
  }
}
