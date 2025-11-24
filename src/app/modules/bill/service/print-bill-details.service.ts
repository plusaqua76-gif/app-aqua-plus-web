import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { END_POINT_SERVICE } from "../../../environments/environment.variables";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { IPlazoPago, ITipoDeuda } from "@interfaces/IdeudaFactura";
import { IBillDetailApiResponse, IBillDetailResponse } from "@interfaces/Ibill-detail";
import { IBillBackResponse } from "@interfaces/bill/Ibill-back";

@Injectable({
  providedIn: 'root',
})
export class PlazoPagoService {

  readonly apiUrl = environment.apiUrl

  private readonly http = inject(HttpClient);

  getAllBillDetails(id: number): Observable<ApiResponse<IBillDetailResponse>> {
    return this.http.get<ApiResponse<IBillDetailResponse>>(`${this.apiUrl}/factura/consultar/${id}`);
  }

  getBillDetailsBackPart(): Observable<ApiResponse<IBillBackResponse>> {
    return new Observable(observer => {
      observer.next({
        success: true,
        message: 'Datos cargados correctamente',
        code: 200,
        response: this.parteAtras
      });
      observer.complete();
    });
  }

  parteAtras: IBillBackResponse = {
    datos: [
      { "descripcion": "evite la suspensión del servicio por falta de pago" },
      { "descripcion": "pague su factura en los puntos autorizados" },
      { "descripcion": "conserve su factura para futuros reclamos" },
      { "descripcion": "verifique los datos de su factura" }
    ],
    empresa: {
      nombre: 'Empresa de Servicios Públicos',
      nit: '123456789-0',
      direccion: 'Dirección no disponible',
      telefono: '(1) 234-5678',
      email: 'info@empresa.com'
    }
  };
}
