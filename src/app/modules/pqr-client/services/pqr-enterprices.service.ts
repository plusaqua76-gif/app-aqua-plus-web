import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { Observable } from 'rxjs';
import { IClienteNovedadResponse } from '@interfaces/IClienteNovedad';
import { IClientCounterApiResponse } from '@interfaces/IclientCounter';
import { ApiResponse } from '@interfaces/Iresponse';

@Injectable({
  providedIn: 'root'
})
export class PqrEnterprisesService {

  readonly http = inject(HttpClient);
  readonly apiUrl = `${environment.apiUrl}`;

  getPqrsForSecretary(enterpriceId: number): Observable<IClienteNovedadResponse> {
    return this.http.get<IClienteNovedadResponse>(`${this.apiUrl}/cliente-novedad/empresa/${enterpriceId}`);
  }

  getCounterByClientEnterprice(idEmpresa: number, idPersona: number): Observable<IClientCounterApiResponse> {
    return this.http.get<IClientCounterApiResponse>(`${this.apiUrl}/empresa-cliente-contador/empresa-persona?idEmpresa=${idEmpresa}&idPersona=${idPersona}`);
  }

    getBillByCode(term: string): Observable<ApiResponse<{ codigo: string; id: number }[]>> {
      return this.http.get<ApiResponse<{ codigo: string; id: number }[]>>(`${this.apiUrl}/factura/sugerencias?term=${term}`);
    }
}
