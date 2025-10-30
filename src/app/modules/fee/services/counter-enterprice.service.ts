import { HttpClient } from "@angular/common/http";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { Observable } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";


export interface CreateCounterEnterprice {
  empresaContador: {
    empresa: {
      id: number;
    },
    contador: {
      id: number;
    },
    usuarioCreacion: string;
  },
  lectura: {
    lectura: number;
    fechaLectura: string;
    consumoAnormal: boolean;
    descripcion: string;
    activo: boolean;
    usuarioCreacion: string;
  }
}



@Injectable({
  providedIn: 'root'
})
export class CounterEnterpriceService {

  readonly http = inject(HttpClient);
  readonly platformId = inject(PLATFORM_ID);
  readonly apiUrl = `${environment.apiUrl}`;

 getCounterEnterprice(idEmpresa: number): Observable<ApiResponse<any>>{
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/empresa-contador/empresa/${idEmpresa}`);
  }

  createEmpresaCounter(counterEnterprice: CreateCounterEnterprice): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/empresa-contador`, counterEnterprice);
  }

}
