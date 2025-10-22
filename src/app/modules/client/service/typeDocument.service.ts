import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { END_POINT_SERVICE } from "../../../environments/environment.variables";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { ITipoDocumento } from "@interfaces/Iuser";

@Injectable({
  providedIn: 'root',
})
export class TypeDocumentService {

  private readonly apiUrl = `${environment.apiUrl}/${END_POINT_SERVICE.GET_ALL_TIPO_DOCUMENTO}`;

  private readonly http = inject(HttpClient);

  getAllTypeDocument(): Observable<ApiResponse<ITipoDocumento[]>> {
    return this.http.get<ApiResponse<ITipoDocumento[]>>(this.apiUrl);
  }
}
