import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { END_POINT_SERVICE } from "../../../../environments/environment.variables";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { IPlazoPago, ITipoDeuda } from "@interfaces/IdeudaFactura";

@Injectable({
  providedIn: 'root',
})
export class PlazoPagoService {

  private apiUrl = `${environment.apiUrl}/${END_POINT_SERVICE.GET_ALL_PLAZO_PAGO}`;

  constructor(private http: HttpClient) {}

  getAllPlazoPago(): Observable<ApiResponse<IPlazoPago[]>> {
    return this.http.get<ApiResponse<IPlazoPago[]>>(this.apiUrl);
  }
}
