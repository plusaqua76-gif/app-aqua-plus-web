import { Register } from './../pages/register/register';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { END_POINT_SERVICE } from '../../../environments/environment.variables';
import { Auth, AuthLoginResponse } from '@interfaces/IAuth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthUserService {

    private readonly loginUrl = `${environment.apiUrl}/${END_POINT_SERVICE.POST_AUTH_USER}`;
    private readonly http = inject(HttpClient);

  login(user: Auth): Observable<AuthLoginResponse> {
    return this.http.post<AuthLoginResponse>(this.loginUrl, user);
  }

  register(user: Auth): Observable<AuthLoginResponse> {
    return this.http.post<AuthLoginResponse>(this.loginUrl, user);
  }

}
