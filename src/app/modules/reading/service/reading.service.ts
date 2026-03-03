import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { END_POINT_SERVICE } from '../../../environments/environment.variables';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '@interfaces/Iresponse';
import { ILectura } from '@interfaces/Ifactura';
import { LecturaResponse, HistoryReadingApiResponse } from '@interfaces/reading/Ireading';
import { IPaginatedResponse, IPaginationParams } from '@interfaces/IpaginatedResponse';

@Injectable({
  providedIn: 'root',
})
export class ReadingService {
  readonly apiUrl = `${environment.apiUrl}/${END_POINT_SERVICE.GET_LECTURA}`;
  readonly  apirUrlhistory = environment.apiUrl
  protected readonly http = inject(HttpClient);

  getHistoryReading(idReading: number): Observable<HistoryReadingApiResponse> {
    return this.http.get<HistoryReadingApiResponse>(`${this.apirUrlhistory}/historico-lectura/lecturas/${idReading}`);
  }


  getReadingsPaginated(
    empresaId: number,
    params: IPaginationParams
  ): Observable<IPaginatedResponse<LecturaResponse>> {
    const url = `${this.apiUrl}/empresa/${empresaId}`;

    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('size', params.size.toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params.filters) {
      httpParams = this.mapFiltersToHttpParams(httpParams, params.filters);
    }

    return this.http.get<IPaginatedResponse<LecturaResponse>>(url, { params: httpParams })
  }

  private mapFiltersToHttpParams(httpParams: HttpParams, filters: Record<string, string>): HttpParams {
    Object.entries(filters).forEach(([key, value]) => {
      if (value?.trim()) {
        const trimmedValue = value.trim();
        httpParams = this.applyReadingFilter(httpParams, key, trimmedValue);
      }
    });
    return httpParams;
  }

  private applyReadingFilter(httpParams: HttpParams, key: string, value: string): HttpParams {
    switch (key) {
      case 'contador.serial':
        return httpParams.set('serial', value);
      case 'lectura':
        return this.isValidNumber(value)
          ? httpParams.set('lectura', value)
          : httpParams;
      case 'fechaLectura':
        return this.isValidDateFormat(value)
          ? httpParams.set('fechaLectura', value)
          : httpParams;
      case 'consumoAnormal':
        if (value.toLowerCase() === 'sí' || value.toLowerCase() === 'si') {
          return httpParams.set('consumoAnormal', 'true');
        } else if (value.toLowerCase() === 'no') {
          return httpParams.set('consumoAnormal', 'false');
        }
        return httpParams;
      case 'descripcion':
        return httpParams.set('descripcion', value);
      default:
        return httpParams.set(key, value);
    }
  }

  private isValidDateFormat(value: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) return false;

    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime()) && date.toISOString().split('T')[0] === value;
  }

  private isValidNumber(value: string): boolean {
    const trimmed = value.trim();
    return trimmed !== '' && !isNaN(Number(trimmed));
  }

    getAllReadingById(id: number): Observable<ApiResponse<LecturaResponse[]>> {
    return this.http
      .get<ApiResponse<LecturaResponse[]>>(`${this.apiUrl}/empresa/${id}`)
      .pipe(map((response) => response));
  }

  getLecturaById(id: number): Observable<ApiResponse<ILectura>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<ApiResponse<ILectura>>(url);
  }
  updateLectura(factura: ILectura): Observable<ApiResponse<ILectura>> {
    return this.http.post<ApiResponse<ILectura>>(this.apiUrl, factura);
  }

  saveReading(reading: ILectura): Observable<ApiResponse<ILectura>> {
    return this.http.post<ApiResponse<ILectura>>(this.apiUrl, reading);
  }

}
