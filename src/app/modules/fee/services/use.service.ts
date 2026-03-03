import { HttpClient } from "@angular/common/http";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { environment } from "../../../environments/environment";
import { ApiResponse } from "@interfaces/Iresponse";
import { IrateTypes } from "@interfaces/IrateTypes";
import { Observable } from "rxjs";
import { IUse, IUseCreate, IUseUpdate } from "@interfaces/IUse";



@Injectable({
  providedIn: 'root'
})
export class  UseService {

  readonly http = inject(HttpClient);
  readonly platformId = inject(PLATFORM_ID);
  readonly apiUrl = `${environment.apiUrl}`;

  getTypeUse(idEnterprice: number): Observable<ApiResponse<IUse[]>>{
    return this.http.get<ApiResponse<IUse[]>>(`${this.apiUrl}/tipo-uso/${idEnterprice}`, )
  }

  createUse(data: IUseCreate): Observable<ApiResponse<IUse>>{
    return this.http.post<ApiResponse<IUse>>(`${this.apiUrl}/tipo-uso`, data)
  }

  updateUse(seUpdate: IUseUpdate): Observable<ApiResponse<IUse>>{
    return this.http.post<ApiResponse<IUse>>(`${this.apiUrl}/tipo-uso`, seUpdate)
  }

  deleteUse(id: number): Observable<ApiResponse<any>>{
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/tipo-uso/${id}`)
  }


}
