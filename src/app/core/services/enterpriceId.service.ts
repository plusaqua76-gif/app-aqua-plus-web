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
          // console.log('Respuesta completa del backend:', res);
          // console.log('res.response:', res?.response);
          const enterpriseInfo = res?.response ?? null;
          if (enterpriseInfo && enterpriseInfo.imagenEmpresa) {
            const base64Image = enterpriseInfo.imagenEmpresa;
            if (base64Image && !base64Image.startsWith('data:image/')) {
              let imageType = 'png';
              try {
                const binaryString = atob(base64Image.substring(0, 20));
                const firstBytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  firstBytes[i] = binaryString.charCodeAt(i);
                }
                if (firstBytes[0] === 0xFF && firstBytes[1] === 0xD8) {
                  imageType = 'jpeg';
                } else if (firstBytes[0] === 0x89 && firstBytes[1] === 0x50) {
                  imageType = 'png';
                } else if (firstBytes[0] === 0x47 && firstBytes[1] === 0x49) {
                  imageType = 'gif';
                } else if (firstBytes[0] === 0x42 && firstBytes[1] === 0x4D) {
                  imageType = 'bmp';
                }
              } catch (e) {
                console.warn('No se pudo detectar el tipo de imagen, usando PNG por defecto');
              }

              enterpriseInfo.imagenEmpresa = `data:image/${imageType};base64,${base64Image}`;
            }

            // console.log('Imagen procesada:', enterpriseInfo.imagenEmpresa.substring(0, 50) + '...');
          }

          if (enterpriseInfo) {
            // console.log('Datos de enterprise después del mapeo:', enterpriseInfo);
            // console.log('¿Tiene imagenEmpresa?', !!enterpriseInfo.imagenEmpresa);
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
