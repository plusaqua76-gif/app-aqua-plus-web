import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { ApiResponse } from '@interfaces/Iresponse';
import { Iuser } from '@interfaces/Iuser';
import { IPaginatedResponse, IPaginationParams } from '@interfaces/IpaginatedResponse';
  interface IUpdateUserStatus {
    idEmpresa: number;
    activo: boolean;
    usuarioCambio: string;
  }
@Injectable({
  providedIn: 'root'
})
export class UserAccessService {

  readonly http = inject(HttpClient);
  readonly platformId = inject(PLATFORM_ID);
  readonly apiUrl = `${environment.apiUrl}`;

  updateUserStatus(payload: IUpdateUserStatus): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/empresa/actualizar`, payload)
  }

  getEnterpriceIdByIdUser(userId: number): Observable<ApiResponse<{ empresaId: number }>> {
     return this.http.get<ApiResponse<{ empresaId: number }>>(`${this.apiUrl}/empresa/usuario/${userId}`)
  }


  // private getUserFromSession(): string | null {
  //   if (isPlatformBrowser(this.platformId)) {
  //     try {
  //       const userData = sessionStorage.getItem('userData');
  //       if (userData) {
  //         const user = JSON.parse(userData);
  //         return user.nombre || null;
  //       }
  //     } catch (error) {
  //       console.error('Error al obtener usuario del sessionStorage:', error);
  //     }
  //   }
  //   return null;
  // }

  // updateUserState(user: Iuser, activo: boolean, usuario: string, nombreEmpresa: string): Observable<any> {
  //   const usuarioCambio = this.getUserFromSession();

  //   if (!usuarioCambio) {
  //     throw new Error('No se pudo obtener el usuario logueado del sessionStorage');
  //   }

  //   const enterpriseId = this.getEnterpriseIdFromSession();

  //   const payload = {
  //     idEmpresa: enterpriseId || user.id,
  //     activo: activo,
  //     usuarioCambio: usuarioCambio,
  //     nombreEmpresa: nombreEmpresa,
  //     usuario: usuario
  //   };

  //   return this.http.post<ApiResponse<any>>(`${this.apiUrl}/empresa/actualizar`, payload).pipe(
  //     map(response => response.response)
  //   );
  // }

  // updateUserStateWithPayload(payload: {
  //   idEmpresa: number;
  //   activo: boolean;
  //   usuarioCambio: string;
  //   nombreEmpresa: string;
  //   usuario: string;
  // }): Observable<any> {

  //   return this.http.post<ApiResponse<any>>(`${this.apiUrl}/empresa/actualizar`, payload).pipe(
  //     map(response => response.response)
  //   );
  // }

  // private getEnterpriseIdFromSession(): number | null {
  //   if (isPlatformBrowser(this.platformId)) {
  //     try {
  //       const userData = sessionStorage.getItem('userData');
  //       if (userData) {
  //         const user = JSON.parse(userData);
  //         return user.empresaId ? Number(user.empresaId) : null;
  //       }
  //     } catch (error) {
  //       console.error('Error al obtener empresaId del sessionStorage:', error);
  //     }
  //   }
  //   return null;
  // }



  getAllUsersAccess(
    empresaId: number,
    params: IPaginationParams
  ): Observable<IPaginatedResponse<Iuser>> {
    const url = `${this.apiUrl}/usuario/inactivos`;

    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('size', params.size.toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    // Mapear filtros específicos de la tabla a parámetros de la API
    if (params.filters) {
      httpParams = this.mapFiltersToHttpParams(httpParams, params.filters);
    }

    return this.http
      .get<IPaginatedResponse<Iuser>>(url, { params: httpParams })
      .pipe(
        catchError(this.handleError)
      );
  }


    private mapFiltersToHttpParams(
    httpParams: HttpParams,
    filters: Record<string, string>
  ): HttpParams {
    Object.entries(filters).forEach(([key, value]) => {
      if (value?.trim()) {
        const trimmedValue = value.trim();
        httpParams = this.applyFilter(httpParams, key, trimmedValue);
      }
    });
    return httpParams;
  }

    private applyFilter(
    httpParams: HttpParams,
    key: string,
    value: string
  ): HttpParams {
    switch (key) {
      case 'nombre':
        return httpParams.set('nombre', value);
      case 'estadoNombre':
      case 'estado':
        // El estado puede ser 'activo' o 'inactivo'
        return httpParams.set('estado', value.toLowerCase());
      default:
        return httpParams.set(key, value);
    }
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred while loading user access.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error: ${error.status} - ${error.message || ''}`;
      if (error.error?.message) {
        errorMessage = `${errorMessage} - ${error.error.message}`;
      }
    }
    console.error('Error in UserAccessService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

}
