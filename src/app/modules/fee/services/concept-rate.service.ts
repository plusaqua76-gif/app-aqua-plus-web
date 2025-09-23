import { HttpClient } from "@angular/common/http";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { Observable } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { IConceptRate } from "@interfaces/IConceptRate";
import { IConceptRatePayload } from "@interfaces/IConceptRatePayload";
import { ConceptoEstratoApiResponse } from "@interfaces/IConceptoEstrato";


@Injectable({
  providedIn: 'root'
})
export class  ConceptRateService {

  readonly http = inject(HttpClient);
  readonly platformId = inject(PLATFORM_ID);
  readonly apiUrl = `${environment.apiUrl}`;

  saveFeeConceptRate(payload: any): Observable<ApiResponse<any>>{
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/tarifa-concepto/crear`, payload);
  }

  getConceptRateByEnterprise(enterpriseId: number): Observable<ApiResponse<IConceptRate[]>>{
    return this.http.get<ApiResponse<IConceptRate[]>>(`${this.apiUrl}/tarifa-concepto/empresa/${enterpriseId}`)
  }

  getConceptoEstrato(idEmpresa: number, idTipoTarifa: number, idTipoConcepto: number): Observable<ConceptoEstratoApiResponse> {
    const params = `?idEmpresa=${idEmpresa}&idTipoTarifa=${idTipoTarifa}&idTipoConcepto=${idTipoConcepto}`;
    return this.http.get<ConceptoEstratoApiResponse>(`${this.apiUrl}/tarifa-concepto/concepto-estrato${params}`);
  }

  deleteConceptRate(id: number): Observable<ApiResponse<null>>{
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/tarifa-concepto/${id}`);
  }

  updateConceptRate(payload: IConceptRatePayload): Observable<ApiResponse<IConceptRate>>{
    return this.http.post<ApiResponse<IConceptRate>>(`${this.apiUrl}/tarifa-concepto/actualizar`, payload);
  }

  deleteConceptStratum(id: number): Observable<ApiResponse<null>>{
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/concepto-estrato/${id}`);
  }

  updateConcepRateStratum(payload: any): Observable<ApiResponse<IConceptRate>>{
    return this.http.post<ApiResponse<IConceptRate>>(`${this.apiUrl}/tarifa-concepto/actualizar-valor-estratos`, payload);
  }

}
