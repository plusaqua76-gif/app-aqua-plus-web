import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { environment } from "../../../environments/environment.prod";
import { Observable } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { UnitCodes } from "@interfaces/invoice/dian-invoice";

export interface UpdateMasiveBillRequest {
  idEmpresa: number;
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
      `${this.apiUrl}/factura-dian/factura/${request.idEmpresa}`,
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

