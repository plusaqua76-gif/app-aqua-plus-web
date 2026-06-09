import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { SaldoClientePayload, SaldoClienteUpdatePayload, SaldoClienteResponse } from '@interfaces/empresa-cliente-contador/request-customer-balance';
import { ApiResponse } from '@interfaces/Iresponse';

@Injectable({
  providedIn: 'root',
})
export class SaldoClienteService {
  private readonly apiUrl = `${environment.apiUrl}/saldo-cliente`;
  private readonly http = inject(HttpClient);

  getSaldoByEmpresaClienteContador(
    empresaClienteContadorId: number
  ): Observable<SaldoClienteResponse | null> {
    return this.http.get<ApiResponse<SaldoClienteResponse[]>>(
      `${this.apiUrl}/cliente/${empresaClienteContadorId}`
    ).pipe(
      map(res => res?.response?.[0] ?? null)
    );
  }

  createSaldo(data: SaldoClientePayload): Observable<SaldoClienteResponse> {
    return this.http.post<SaldoClienteResponse>(this.apiUrl, data);
  }

  updateSaldo(data: SaldoClienteUpdatePayload): Observable<SaldoClienteResponse> {
    return this.http.post<SaldoClienteResponse>(this.apiUrl, data);
  }

  deleteSaldo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
