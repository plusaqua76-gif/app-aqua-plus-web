import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { IClienteNovedadResponse, ICreateNovedadWithFileRequest, ICreateNovedadResponse, IParametroGeneral } from '@interfaces/INovelty/IClienteNovedad';
import { IClientCounterApiResponse } from '@interfaces/IclientCounter';
import { ApiResponse } from '@interfaces/Iresponse';
import { ITypeNovelty, ITypeNoveltyResponse } from '@interfaces/INovelty/ItypeNovelty';
import { IUpdateNoveltyRequest } from '@interfaces/INovelty/IStatusNovelty';


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

  saveNovelty(novelty: ICreateNovedadWithFileRequest): Observable<ICreateNovedadResponse>{
    return this.http.post<ICreateNovedadResponse>(`${this.apiUrl}/cliente-novedad`, novelty);
  }

  updateNovelty(updateNovelty: IUpdateNoveltyRequest): Observable<ICreateNovedadResponse>{
    return this.http.put<ICreateNovedadResponse>(`${this.apiUrl}/cliente-novedad`, updateNovelty);
  }

  saveTypeNovelty(typeNovelty: ITypeNovelty): Observable<ITypeNoveltyResponse>{
    return this.http.post<ITypeNoveltyResponse>(`${this.apiUrl}/tipo-novedad`, typeNovelty);
  }

  getStatusPqrById(): Observable<ApiResponse<IParametroGeneral[]>>{
    return this.http.get<ApiResponse<IParametroGeneral[]>>(`${this.apiUrl}/parametros-generales/codigo/ESTADOS_NOVEDAD`);
  }



}
