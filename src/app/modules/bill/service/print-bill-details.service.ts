import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { END_POINT_SERVICE } from "../../../environments/environment.variables";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { IPlazoPago, ITipoDeuda } from "@interfaces/IdeudaFactura";
import { IBillDetailApiResponse, IBillDetailResponse } from "@interfaces/Ibill-detail";

@Injectable({
  providedIn: 'root',
})
export class PlazoPagoService {

  readonly apiUrl = environment.apiUrl

  private readonly http = inject(HttpClient);

  getAllBillDetails(id: number): Observable<ApiResponse<IBillDetailResponse>> {
    return this.http.get<ApiResponse<IBillDetailResponse>>(`${this.apiUrl}/factura/consultar/${id}`);
  }
}
