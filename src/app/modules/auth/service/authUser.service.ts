import { Register } from './../pages/register/register';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { END_POINT_SERVICE } from '../../../environments/environment.variables';
import { Auth, AuthLoginResponse } from '@interfaces/IAuth';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthUserService {

  private readonly loginUrl = `${environment.apiUrl}/${END_POINT_SERVICE.POST_AUTH_USER}`;
  readonly baseUrl = environment.apiUrl
  private readonly http = inject(HttpClient);

  login(user: Auth): Observable<AuthLoginResponse> {
    return this.http.post<AuthLoginResponse>(this.loginUrl, user).pipe(
      tap((response: AuthLoginResponse) => {
        if (response.response?.token) {
          this.setTokens(response.response.token, response.response.token);
        }
      })
    );
  }

  register(user: Auth): Observable<AuthLoginResponse> {
    return this.http.post<AuthLoginResponse>(this.loginUrl, user).pipe(
      tap((response: AuthLoginResponse) => {
        if (response.response?.token) {
          this.setTokens(response.response.token, response.response.token);
        }
      })
    );
  }  getAuthToken() {
    return sessionStorage.getItem('authToken') || '';
  }

  setTokens(authToken: string, refreshToken: string) {
    sessionStorage.setItem('authToken', authToken);
    // Ya no necesitamos refreshToken separado
  }

  clearTokens() {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('refreshToken'); // Limpiar cualquier resto
  }

  isTokenExpired(token: string): boolean {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

}
