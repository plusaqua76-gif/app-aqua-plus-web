
import { HttpClient, HttpParams } from '@angular/common/http';
import {  inject, Injectable  } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { Observable, catchError, throwError } from 'rxjs';
import { IUserBill } from '@interfaces/IuserBill';
import { IPaginatedResponse, IPaginationParams } from '@interfaces/IpaginatedResponse';


@Injectable({
  providedIn: 'root'
})
export class UserAccessService {

  readonly http = inject(HttpClient);
  readonly apiUrl = `${environment.apiUrl}`;

  // Método original sin paginación
  getBillByUserPerson(idPersona: number): Observable<IUserBill[]> {
    return this.http.get<IUserBill[]>(`${this.apiUrl}/factura/persona/${idPersona}`);
  }

  // Nuevo método con paginación
  getBillByUserPersonPaginated(
    idPersona: number,
    params: IPaginationParams
  ): Observable<IPaginatedResponse<IUserBill>> {
    const url = `${this.apiUrl}/factura/persona/${idPersona}`;

    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('size', params.size.toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params.filters) {
      httpParams = this.mapFiltersToHttpParams(httpParams, params.filters);
    }

    return this.http
      .get<IPaginatedResponse<IUserBill>>(url, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  private mapFiltersToHttpParams(
    httpParams: HttpParams,
    filters: Record<string, string>
  ): HttpParams {
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        httpParams = this.applyFilter(httpParams, key, value);
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
      case 'username':
        return httpParams.set('username', value);
      case 'nombre':
        return httpParams.set('nombre', value);
      case 'numeroCedula':
        return httpParams.set('numeroCedula', value);
      case 'rolNombre':
        return httpParams.set('rolNombre', value);
      case 'tipoDocumento':
        return httpParams.set('tipoDocumento', value);
      case 'activo':
        return httpParams.set('activo', value);
      default:
        return httpParams.set(key, value);
    }
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en UserAccessService:', error);
    return throwError(() => error);
  }
}
