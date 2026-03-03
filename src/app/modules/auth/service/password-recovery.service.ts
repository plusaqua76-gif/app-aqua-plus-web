import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";


@Injectable({ providedIn: 'root' })
export class PasswordRecoveryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/usuario`;


  getTokenFromRoute(route: ActivatedRoute): string | null {
    const queryString = route.snapshot.queryParamMap.keys[0];
    return queryString || null;
  }

  updatePasswordWithToken(token: string, newPassword: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/update-password`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${token.trim()}`
    });

    const body = { contrasena: newPassword };
    return this.http.post<ApiResponse<any>>(url, body, { headers });
  }
}
