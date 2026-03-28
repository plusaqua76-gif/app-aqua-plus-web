import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  Colilla,
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
    data: Colilla[],
  ): Observable<ApiResponseValidacionColillas> {
    return this.http.post<ApiResponseValidacionColillas>(
      `${this.baseUrl}/factura/validar-pagos`,
      data,
    );
  }

  processPayments(data: Colilla[]): Observable<ApiResponseValidacionColillas> {
    return this.http.post<ApiResponseValidacionColillas>(
      `${this.baseUrl}/factura/procesar-pagos`,
      data,
    );
  }
}
