import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment.local';
import { END_POINT_SERVICE } from '../../environments/environment.variables';
import { ApiResponse } from '../interfaces/Iresponse';
import { IdEnterprice } from '@interfaces/IiEnterprice';

@Injectable({ providedIn: 'root' })
export class EnterpriseIdService {

  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private isBrowser = isPlatformBrowser(this.platformId);
  private apiUrl = environment.apiUrl;

  getByIdEnterprice(id: number): Observable<number | null> {
    return this.http.get<ApiResponse<IdEnterprice>>(`${this.apiUrl}/${END_POINT_SERVICE.GET_ENTERPRISE}/${id}`).pipe(
      map(res => res?.response?.idEmpresa ?? null),
      catchError(err => {
        console.error('Error en getByIdEnterprice:', err);
        return of(null);
      })
    )
  }

  getUserId(): number | null {
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

getEnterpriseInfo(): Observable<any | null> {
  const userId = this.getUserId();

  if (!userId) {
    console.warn('EnterpriseIdService: No user ID found in sessionStorage');
    return of(null);
  }

  return this.http
    .get<any>(`${this.apiUrl}/${END_POINT_SERVICE.GET_ENTERPRISE}/${userId}`)
    .pipe(
      map(res => {
        const enterpriseInfo = res?.response ?? null;
        if (!enterpriseInfo) return null;

        // Caso: backend devuelve "imagen" como array [{ imagen: "<base64>", contentType: "image/png", ... }, ...]
        if (Array.isArray(enterpriseInfo.imagen) && enterpriseInfo.imagen.length > 0) {
          const first = enterpriseInfo.imagen[0];
          const base64 = first?.imagen;
          const contentType = first?.contentType || first?.extension ? `image/${first.extension}` : 'image/png';

          if (base64) {
            // Construir data URI usando el contentType que provee el backend (más fiable)
            enterpriseInfo.imagenEmpresa = `data:${contentType};base64,${base64}`;
          } else {
            enterpriseInfo.imagenEmpresa = null;
          }
        } else if (enterpriseInfo.imagenEmpresa && typeof enterpriseInfo.imagenEmpresa === 'string') {
          // Si alguna vez viene ya como cadena base64 plana o data URI
          const img = enterpriseInfo.imagenEmpresa;
          if (img.startsWith('data:image/')) {
            // ya está bien
          } else {
            // si es base64 "pura" y no empieza con data:, intentar construir con PNG por defecto
            enterpriseInfo.imagenEmpresa = `data:image/png;base64,${img}`;
          }
        } else {
          enterpriseInfo.imagenEmpresa = null;
        }

        return enterpriseInfo;
      }),
      catchError(err => {
        console.error('Error en getEnterpriseInfo:', err);
        return of(null);
      })
    );
}

}
