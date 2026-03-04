import { HttpClient } from "@angular/common/http";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { ApiResponse } from "@interfaces/Iresponse";
import { IrateTypes } from "@interfaces/IrateTypes";
import { Observable } from "rxjs";



@Injectable({
  providedIn: 'root'
})
export class  TypeConceptService {

  readonly http = inject(HttpClient);
  readonly platformId = inject(PLATFORM_ID);
  readonly apiUrl = `${environment.apiUrl}`;

  getAllTypeConcepts(id: number): Observable<ApiResponse<IrateTypes[]>>{
    return this.http.get<ApiResponse<IrateTypes[]>>(`${this.apiUrl}/tipo-concepto/${id}`, )
  }

  saveTypeConcept(typeConcept: IrateTypes): Observable<ApiResponse<IrateTypes>>{
    return this.http.post<ApiResponse<IrateTypes>>(`${this.apiUrl}/tipo-concepto`, typeConcept);
  }

  deleteTypeConcept(id: number): Observable<ApiResponse<null>>{
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/tipo-concepto/${id}`);
  }

}
