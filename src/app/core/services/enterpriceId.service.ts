import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment.local';
import { END_POINT_SERVICE } from '../../environments/environment.variables';

@Injectable({ providedIn: 'root' })
export class EnterpriseIdService {

  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private isBrowser = isPlatformBrowser(this.platformId);
  private apiUrl = environment.apiUrl;

  private getUserId(): number | null {
    if (!this.isBrowser) return null;
    try {
      const userData = sessionStorage.getItem('userData');
      if (!userData) return null;
      const parsed = JSON.parse(userData);
      return typeof parsed.id === 'number' ? parsed.id : Number(parsed.id) || null;
    } catch (e) {
      console.error('Error parsing userData:', e);
      return null;
    }
  }

  getEnterpriseId(): Observable<number | null> {
    const userId = this.getUserId();

    if (!userId) {
      console.warn('EnterpriseIdService: No user ID found in sessionStorage');
      return of(null);
    }

    return this.http
      .get<any>(`${this.apiUrl}/${END_POINT_SERVICE.GET_ENTERPRISE}/${userId}`)
      .pipe(
        map(res => {
          const enterpriseId = res?.response?.idEmpresa ?? null;
          return enterpriseId;
        }),
        catchError(err => {
          return of(null);
        })
      );
  }
}
