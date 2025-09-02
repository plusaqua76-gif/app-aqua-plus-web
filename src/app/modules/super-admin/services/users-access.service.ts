import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '@interfaces/Iresponse';
import { Iuser } from '@interfaces/Iuser';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UserAccessService {

  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl = `${environment.apiUrl}`;

  private getUserFromSession(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const userData = sessionStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          return user.nombre || null;
        }
      } catch (error) {
        console.error('Error al obtener usuario del sessionStorage:', error);
      }
    }
    return null;
  }

  getAllUsersAccess(): Observable<Iuser[]> {
    return this.http.get<ApiResponse<Iuser[]>>(`${this.apiUrl}/usuario/inactivos`).pipe(
      map(response => response.response)
    );
  }

  updateUserState(user: Iuser, activo: boolean, usuario: string, nombreEmpresa: string): Observable<any> {
    const usuarioCambio = this.getUserFromSession();

    if (!usuarioCambio) {
      throw new Error('No se pudo obtener el usuario logueado del sessionStorage');
    }

    // Obtener el ID de empresa desde sessionStorage
    const enterpriseId = this.getEnterpriseIdFromSession();

    const payload = {
      idEmpresa: enterpriseId || user.id, // Usar enterpriseId del sessionStorage o como fallback user.id
      activo: activo,
      usuarioCambio: usuarioCambio,
      nombreEmpresa: nombreEmpresa,
      usuario: usuario
    };

    console.log('Payload a enviar:', payload);

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/empresa/actualizar`, payload).pipe(
      map(response => response.response)
    );
  }

  updateUserStateWithPayload(payload: {
    idEmpresa: number;
    activo: boolean;
    usuarioCambio: string;
    nombreEmpresa: string;
    usuario: string;
  }): Observable<any> {
    console.log('Payload a enviar:', payload);

    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/empresa/actualizar`, payload).pipe(
      map(response => response.response)
    );
  }

  private getEnterpriseIdFromSession(): number | null {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const userData = sessionStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          return user.empresaId ? Number(user.empresaId) : null;
        }
      } catch (error) {
        console.error('Error al obtener empresaId del sessionStorage:', error);
      }
    }
    return null;
  }
}
