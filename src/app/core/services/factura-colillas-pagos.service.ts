import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  ColillasPayload,
  ApiResponseValidacionColillas,
} from '@interfaces/bill/colilla';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FacturaColillasPagosService {
  private readonly http = inject(HttpClient);
  readonly baseUrl = environment.apiUrl;

  getValidationsBill(
    payload: ColillasPayload,
  ): Observable<ApiResponseValidacionColillas> {
    return this.http.post<ApiResponseValidacionColillas>(
      `${this.baseUrl}/factura/validar-pagos`,
      payload,
    );
  }

  processPayments(payload: ColillasPayload): Observable<ApiResponseValidacionColillas> {
    return this.http.post<ApiResponseValidacionColillas>(
      `${this.baseUrl}/factura/procesar-pagos`,
      payload,
    );
  }
}
