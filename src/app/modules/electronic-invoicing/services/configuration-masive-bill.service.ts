import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { Observable } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { UnitCodes } from "@interfaces/invoice/dian-invoice";

export interface UpdateMasiveBillRequest {
  idFactura: number;
  estadoActual: string;
  nuevoEstado: string;
  usuario: string;
}



@Injectable({
  providedIn: 'root'
})
export class ConfigurationMasiveBillService {

  readonly http = inject(HttpClient);
  readonly platformId = inject(PLATFORM_ID);
  readonly apiUrl = `${environment.apiUrl}`;

  updateStatusMasiveBill(
    request: UpdateMasiveBillRequest
  ): Observable<any> {

       let params = new HttpParams()
      .set('estadoActual', request.estadoActual)
      .set('nuevoEstado', request.nuevoEstado)
      .set('usuario', request.usuario);

    return this.http.put<any>(
      `${this.apiUrl}/factura-dian/factura/${request.idFactura}`,
      null,
      { params }
    );
  }


getFiscalResponsabilityTypesDian(): Observable<ApiResponse<UnitCodes[]>> {
  return this.http.get<ApiResponse<UnitCodes[]>>(
    `${this.apiUrl}/lista-dian`,
    {
      params: {
        endPoint: '/dian/fiscal-Responsability-types',
      },
    }
  );
}


}


// curl --location --request PUT 'http://localhost:8080/api/v1/factura-dian/factura/84?estadoActual=PEND_PROC&nuevoEstado=PEND&usuario=dchavarro' \
// --header 'Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJTYWx0b0JvcmRvbmVzU0FTIiwiaWF0IjoxNzcwNzU4ODIwLCJleHAiOjE3NzA4NDUyMjB9.Q9jN0rR8K2ZBJmfTMjZFk34hY337NTCkY81ERp4FSnJCSF7DVyC05s3ZWVl0AA6GAe9jOtXByLqJP4hFsWp6gQ' \
// --data ''
// se agrego en medio de pago: "fechaFin":"2026-02-25", para cuando la forma de pago es credito



// curl --location 'http://localhost:8080/api/v1/lista-dian?endPoint=%2Fdian%2Ffiscal-Responsability-types' \
// --header 'accept: application/json' \
// --header 'authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJTYWx0b0JvcmRvbmVzU0FTIiwiaWF0IjoxNzcwMzg5OTYyLCJleHAiOjE3NzA0NzYzNjJ9.UsKyPDObQzdpYhsqcBr29gHDJndcUZ6eqh3LI6ltiBcsUvVyK9t6-Ehj9gqDl3GEYHP4cXbIqX5q7MmzZnx5JQ'


