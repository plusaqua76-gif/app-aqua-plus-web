import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";

export interface TransversalRateRequest {
  empresa: { id: number };
  tipoUso: { id: number };
  tipoTarifa: { id: number };
  nombre?: string;
  estrato: number;
  valor: number;
  codigo: string;
  usuarioCreacion: string;
}

export interface TransversalRate {
  id: number;
  tipoUso: {
    id: number;
    empresa: {
      id: number;
      usuario: {
        id: number;
        rol: {
          id: number;
          nombre: string;
          usuarioCreacion: string;
        };
        estado: {
          id: number;
          nombre: string;
        };
        nombre: string;
        contrasena: string;
        activo: boolean;
        usuarioCreacion: string;
        usuarioModificacion: string;
      };
      direccion: {
        id: number;
        departamento: {
          id: number;
          nombre: string;
        };
        ciudad: {
          id: number;
          nombre: string;
          activo: boolean;
          usuarioCreacion: string;
        };
        corregimiento: {
          id: number;
          nombre: string;
        };
        usuarioCreacion: string;
      };
      nombre: string;
      nit: string;
      codigo: string;
      activo: boolean;
      usuarioCreacion: string;
      fechaCreacion: string;
      fechaModificacion: string;
    };
    nombre: string;
    descripcion: string;
    codigo: string;
    activo: boolean;
    usuarioCreacion: string;
    fechaCreacion: string;
    usuarioModificacion: string;
    fechaModificacion: string;
  };
  tipoTarifa: {
    id: number;
    empresa: {
      id: number;
    };
    nombre: string;
    codigo: string;
    activo: boolean;
    usuarioCreacion: string;
    fechaCreacion: string;
  };
  nombre?: string;
  estrato: number;
  codigo: string;
  valor: number;
}

@Injectable({
  providedIn: 'root'
})
export class  TransversalRatesService {

  readonly http = inject(HttpClient);
  readonly apiUrl = `${environment.apiUrl}`;

  createTransversalRates(transversalRates: TransversalRateRequest): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/tarifas-transversales`, transversalRates);
  }

  getAllTransversalRates(idEnterprise: number): Observable<TransversalRate[]>{
    return this.http.get<TransversalRate[]>(`${this.apiUrl}/tarifas-transversales/${idEnterprise}`);
  }

  deleteTransversalRates(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/tarifas-transversales/${id}`);
  }

}
