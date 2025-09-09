import { HttpClient } from "@angular/common/http";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { Observable } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { IrateTypes } from "@interfaces/IrateTypes";
import { IConceptRate } from "@interfaces/IConceptRate";


@Injectable({
  providedIn: 'root'
})
export class  ConceptRateService {

  readonly http = inject(HttpClient);
  readonly platformId = inject(PLATFORM_ID);
  readonly apiUrl = `${environment.apiUrl}`;

  saveFeeConceptRate(fee: IrateTypes): Observable<ApiResponse<IrateTypes>>{
    return this.http.post<ApiResponse<IrateTypes>>(`${this.apiUrl}/tarifa-concepto/crear`, fee);
  }

  getConceptRateByEnterprise(enterpriseId: number): Observable<ApiResponse<IConceptRate[]>>{
    return this.http.get<ApiResponse<IConceptRate[]>>(`${this.apiUrl}/tarifa-concepto/empresa/${enterpriseId}`)
  }

}
