import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '@interfaces/Iresponse';
import { CheckoutPagoRequest } from '@interfaces/pago/checkout-pago-request';
import { CheckoutPagoResponse } from '@interfaces/pago/checkout-pago-response';
import { EstadoPagoResponse } from '@interfaces/pago/estado-pago-response';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly skipLoader = {
    headers: new HttpHeaders({ 'X-Skip-Loader': 'true' }),
  };

  crearCheckout(facturaId: number | string): Observable<ApiResponse<CheckoutPagoResponse>> {
    const body: CheckoutPagoRequest = { facturaId: Number(facturaId) };
    return this.http.post<ApiResponse<CheckoutPagoResponse>>(
      `${this.apiUrl}/pagos/checkout`,
      body,
      this.skipLoader,
    );
  }

  consultarEstadoPago(facturaId: number | string): Observable<ApiResponse<EstadoPagoResponse>> {
    return this.http.get<ApiResponse<EstadoPagoResponse>>(
      `${this.apiUrl}/pagos/${facturaId}/estado`,
      this.skipLoader,
    );
  }
}
