import { HttpClient } from "@angular/common/http";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { Observable } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { IrateTypes } from "@interfaces/IrateTypes";


@Injectable({
  providedIn: 'root'
})
export class RateTypeService {

  readonly http = inject(HttpClient);
  readonly platformId = inject(PLATFORM_ID);
  readonly apiUrl = `${environment.apiUrl}`;


  getRateTypes(): Observable<ApiResponse<IrateTypes[]>>{
    return this.http.get<ApiResponse<IrateTypes[]>>(`${this.apiUrl}/tipo-tarifa/all`)
  }

  saveRateType(rateType: IrateTypes): Observable<ApiResponse<IrateTypes>>{
    return this.http.post<ApiResponse<IrateTypes>>(`${this.apiUrl}/tipo-tarifa`, rateType);
  }

  deleteRateType(id: number): Observable<ApiResponse<null>>{
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/tipo-tarifa/${id}`);
  }







}
