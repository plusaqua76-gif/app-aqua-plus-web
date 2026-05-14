import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SaldoClientePayload, SaldoClienteResponse } from '@interfaces/empresa-cliente-contador/request-customer-balance';

@Injectable({
  providedIn: 'root',
})
export class SaldoClienteService {
  private readonly apiUrl = `${environment.apiUrl}/saldo-cliente`;
  private readonly http = inject(HttpClient);

  getSaldoByEmpresaClienteContador(
    empresaClienteContadorId: number
  ): Observable<SaldoClienteResponse> {
    return this.http.get<SaldoClienteResponse>(
      `${this.apiUrl}/${empresaClienteContadorId}`
    );
  }

  createSaldo(data: SaldoClientePayload): Observable<SaldoClienteResponse> {
    return this.http.post<SaldoClienteResponse>(this.apiUrl, data);
  }

  deleteSaldo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
