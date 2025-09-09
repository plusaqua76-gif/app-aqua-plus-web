import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { Observable } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";


@Injectable({ providedIn: 'root' })
export class PasswordRecoveryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/usuario`;

  updatePasswordWithToken(token: string, newPassword: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/update-password`;

    // Asegurar el prefijo Bearer
    const bearer = token.trim().toLowerCase().startsWith('bearer ')
      ? token.trim()
      : `Bearer ${token.trim()}`;

    // Headers CON Authorization (¡clave!)
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': bearer
    });

    // Body SOLO con la contraseña (ajusta la clave si tu API usa otro nombre)
    const body = { contrasena: newPassword };

    return this.http.post<ApiResponse<any>>(url, body, { headers });
  }
}
