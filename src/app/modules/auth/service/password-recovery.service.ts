import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.local';
import { ApiResponse } from '@interfaces/Iresponse';

@Injectable({
  providedIn: 'root'
})
export class PasswordRecoveryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/usuario`;

  /**
   * Actualiza la contraseña usando el token de recuperación
   * @param token Token de recuperación recibido por email
   * @param newPassword Nueva contraseña
   * @returns Observable con la respuesta del API
   */
  updatePasswordWithToken(token: string, newPassword: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/update-password`;

    // Limpiar el token de cualquier prefijo Bearer
    const cleanToken = token.replace(/^(Bearer\s+)/i, '').trim();

    // Headers sin Authorization para evitar problemas de CORS
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Enviar token en el body
    const body = {
      contrasena: newPassword,
      token: cleanToken
    };

    return this.http.post<ApiResponse<any>>(url, body, { headers });
  }

  /**
   * Solicita el envío de email de recuperación
   * @param email Email del usuario
   * @returns Observable con la respuesta del API
   */
  requestPasswordReset(email: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/recoverPassword`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<ApiResponse<any>>(url, null, {
      headers,
      params: { correo: email }
    });
  }
}
