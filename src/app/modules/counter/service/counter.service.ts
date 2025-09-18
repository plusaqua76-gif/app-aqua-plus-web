import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ENTERPRISE_CLIENT_COUNT } from '../../../environments/environment.variables';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '@interfaces/Iresponse';
import { Router } from '@angular/router';
import { CounterApiResponse } from '@interfaces/counter/IcounterApi';
import { CounterRow } from '@interfaces/counter/IcounterRow';
import { toCounterRow } from '@shared/mappers/counterRow';
import { IPaginatedResponse, IPaginationParams } from '@interfaces/IpaginatedResponse';

@Injectable({
  providedIn: 'root',
})
export class CounterService {
  private readonly apiUrl = `${environment.apiUrl}/${ENTERPRISE_CLIENT_COUNT.ENT_CLI_COU}`;
  protected readonly router = inject(Router);
  protected readonly http = inject(HttpClient);

    getAllCounterByIdEnterprise(enterpriseId: number): Observable<CounterRow[]> {
    const url = `${this.apiUrl}/contadores/${enterpriseId}`;
    return this.http.get<ApiResponse<CounterApiResponse[]>>(url).pipe(
      map(response => response.response?.map(counter => toCounterRow(counter)) ?? [])
    );
  }

  getAllCounterByIdEnterprisePaginated(
    enterpriseId: number,
    params: IPaginationParams
  ): Observable<IPaginatedResponse<CounterRow>> {
    const url = `${this.apiUrl}/contadores/${enterpriseId}`;

    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('size', params.size.toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params.filters) {
      httpParams = this.mapFiltersToHttpParams(httpParams, params.filters);
    }

    return this.http.get<IPaginatedResponse<CounterApiResponse>>(url, { params: httpParams }).pipe(
      map(response => ({
        ...response,
        response: response.response?.map(counter => toCounterRow(counter)) ?? []
      }))
    );
  }

  private mapFiltersToHttpParams(httpParams: HttpParams, filters: Record<string, string>): HttpParams {
    Object.entries(filters).forEach(([key, value]) => {
      if (value?.trim()) {
        const trimmedValue = value.trim();
        httpParams = this.applyCounterFilter(httpParams, key, trimmedValue);
      }
    });
    return httpParams;
  }

  private applyCounterFilter(httpParams: HttpParams, key: string, value: string): HttpParams {
    switch (key) {
      case 'serial':
        return httpParams.set('serial', value);
      case 'tipoContadorNombre':
        return httpParams.set('tipoContadorNombre', value);
      case 'direccionDescripcion':
        return httpParams.set('direccionDescripcion', value);
      case 'nombre':
        return httpParams.set('nombre', value);
      case 'cedula':
        return httpParams.set('cedula', value);
      default:
        return httpParams;
    }
  }

  updateCounter(counter: any): Observable<ApiResponse<CounterApiResponse>> {
    const url = `${this.apiUrl}`;
    return this.http.post<ApiResponse<CounterApiResponse>>(url, counter);
  }
}
