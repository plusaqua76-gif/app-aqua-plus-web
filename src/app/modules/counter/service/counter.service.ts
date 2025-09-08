import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { HttpClient } from '@angular/common/http';
import { ENTERPRISE_CLIENT_COUNT } from '../../../environments/environment.variables';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '@interfaces/Iresponse';
import { Router } from '@angular/router';
import { CounterApiResponse } from '@interfaces/counter/IcounterApi';
import { CounterRow } from '@interfaces/counter/IcounterRow';
import { toCounterRow } from '@shared/mappers/counterRow';

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

  updateCounter(counter: any): Observable<ApiResponse<CounterApiResponse>> {
    const url = `${this.apiUrl}`;
    return this.http.post<ApiResponse<CounterApiResponse>>(url, counter);
  }
}
