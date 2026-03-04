import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { END_POINT_SERVICE } from "../../../../environments/environment.variables";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { ITipoDocumento } from "@interfaces/Iuser";
import { IEstado } from "@interfaces/Ifactura";

@Injectable({
  providedIn: 'root',
})
export class EstadoService {

  private apiUrl = `${environment.apiUrl}/${END_POINT_SERVICE.GET_ALL_ESTADO}`;

  constructor(private http: HttpClient) {}

  getAllEstado(): Observable<ApiResponse<IEstado[]>> {
    return this.http.get<ApiResponse<IEstado[]>>(this.apiUrl);
  }
}
