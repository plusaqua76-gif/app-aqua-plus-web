import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { Observable } from 'rxjs';
import { ApiResponse } from '@interfaces/Iresponse';
import { CreateCounterEnterprice } from '@interfaces/counter/IcounterEnterprice';
import { IdEnterprice } from '../../../core/interfaces/IiEnterprice';
import { IPaginationParams, IPaginatedResponse } from '@interfaces/IpaginatedResponse';

@Injectable({
  providedIn: 'root',
})
export class CounterEnterpriceService {
  readonly http = inject(HttpClient);
  readonly platformId = inject(PLATFORM_ID);
  readonly apiUrl = `${environment.apiUrl}`;

  getCounterEnterprice(idEmpresa: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/empresa-contador/empresa/${idEmpresa}`
    );
  }

  createEmpresaCounter(
    counterEnterprice: CreateCounterEnterprice
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/empresa-contador`,
      counterEnterprice
    );
  }

  getReadingsByEnterprice(IdEnterprice: number, serial: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/lectura/empresa/${IdEnterprice}?serial=${serial}`
    );
  }

  getReadingsByEnterpricePaginated(
    IdEnterprice: number,
    serial: string,
    pagination: IPaginationParams
  ): Observable<IPaginatedResponse<any>> {
    const url = `${this.apiUrl}/lectura/empresa/${IdEnterprice}`;

    let params = new HttpParams()
      .set('serial', serial)
      .set('page', pagination.page.toString())
      .set('size', pagination.size.toString());

    return this.http.get<IPaginatedResponse<any>>(url, { params });
  }
}
