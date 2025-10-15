import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { END_POINT_SERVICE } from "../../../environments/environment.variables";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { IProducto } from "@interfaces/Iaccounting";

@Injectable({
  providedIn: 'root',
})
export class ProductoService {

  private readonly apiUrl = `${environment.apiUrl}/${END_POINT_SERVICE.GET_PRODUC}`;
  private readonly http = inject(HttpClient);

  getProductByIdEnterprise(enterpriseId: number): Observable<ApiResponse<IProducto[]>> {
    return this.http.get<ApiResponse<IProducto[]>>(`${this.apiUrl}/empresa/${enterpriseId}`);
  }

  createProduct(product: IProducto): Observable<ApiResponse<IProducto>> {
    return this.http.post<ApiResponse<IProducto>>(`${this.apiUrl}`, product);
  }

}
