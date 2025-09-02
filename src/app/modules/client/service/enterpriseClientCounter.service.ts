import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from '@interfaces/Iresponse';
import { END_POINT_SERVICE, ENTERPRISE_CLIENT_COUNT } from '../../../environments/environment.variables';
import { IEnterpriseClientCounter } from '@interfaces/IenterpriseClientCounter';
import { Router } from '@angular/router';
import { ICorreoPerson, IPerson } from '@interfaces/Iperson';
import { ITelefonoGeneral } from '@interfaces/ItelefonoGeneral';
import { CorreoPersonaService } from './correoPersona.service';
import { TelefonoGeneralService } from './telefonoPersona.service';
import { ClienteApi } from '@interfaces/client/IclienteApi';
import { ClientRow } from '@interfaces/client/IclientRow';
import { toClientRow } from '@shared/mappers/clientRow';

@Injectable({
  providedIn: 'root'
})
export class EnterpriseClientCounterService {

  private readonly apiUrl = `${environment.apiUrl}/${ENTERPRISE_CLIENT_COUNT.ENT_CLI_COU}`;

  protected readonly router = inject(Router)
  protected readonly correoService = inject(CorreoPersonaService)
  protected readonly telefonoService = inject(TelefonoGeneralService)
  protected readonly http = inject(HttpClient)

  getAllCLiente(): Observable<ApiResponse<IEnterpriseClientCounter[]>> {
    const url = `${this.apiUrl}/${ENTERPRISE_CLIENT_COUNT.GET_ALL_CLI}`;
    return this.http.get<ApiResponse<IEnterpriseClientCounter[]>>(url)
  }

  getAllClienteEnterprises(): Observable<IEnterpriseClientCounter[]> {
    const url = `${this.apiUrl}/${ENTERPRISE_CLIENT_COUNT.GET_ALL_CLI}`;
    return this.http.get<ApiResponse<IEnterpriseClientCounter[]>>(url).pipe(
      map((response: ApiResponse<IEnterpriseClientCounter[]>) => {
        return response.response;
      })
    );
  }
  getAllClienteEnterprise(): Observable<{
    clientes: IEnterpriseClientCounter[],
    correos: ICorreoPerson[],
    telefonos: ITelefonoGeneral[]
  }> {
    const clientes$ = this.http
      .get<ApiResponse<IEnterpriseClientCounter[]>>(`${this.apiUrl}/${ENTERPRISE_CLIENT_COUNT.GET_ALL_CLI}`)
      .pipe(map(resp => resp.response));

    const correos$ = this.correoService.getAllCorreo().pipe(
      map(resp => resp.response)
    );

    const telefonos$ = this.telefonoService.getAllTelefono().pipe(
      map(resp => resp.response)
    );

    return forkJoin({
      clientes: clientes$,
      correos: correos$,
      telefonos: telefonos$
    });
  }



  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred while loading enterprise client counters.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error: ${error.status} - ${error.message || ''}`;
      if (error.error && error.error.message) {
        errorMessage = `${errorMessage} - ${error.error.message}`;
      }
    }
    console.error('Error in EnterpriseClientCounterService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Método original que devuelve ClienteApi[] (mantener para compatibilidad)
  getAllCounterByIdEnterpriseRaw(enterpriseId: number): Observable<ApiResponse<ClienteApi[]>> {
    const url = `${this.apiUrl}/${ENTERPRISE_CLIENT_COUNT.GET_CLIENT}/${enterpriseId}`;
    return this.http.get<ApiResponse<ClienteApi[]>>(url);
  }

  // Método optimizado que aplica el mapper directamente y devuelve ClientRow[]
  getAllCounterByIdEnterprise(enterpriseId: number): Observable<ApiResponse<ClientRow[]>> {
    const url = `${this.apiUrl}/${ENTERPRISE_CLIENT_COUNT.GET_CLIENT}/${enterpriseId}`;
    return this.http.get<ApiResponse<ClienteApi[]>>(url).pipe(
      map(response => ({
        ...response,
        response: response.response.map(client => toClientRow(client))
      }))
    );
  }

  getEntClientCounterById(id: number): Observable<ApiResponse<IEnterpriseClientCounter>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<ApiResponse<IEnterpriseClientCounter>>(url).pipe(
      catchError(this.handleError)
    );
  }
  updateEstado(data: { id_persona: number, activo: boolean, usuario_cambio: string }): Observable<Map<string, any>> {
    const url = `${environment.apiUrl}/${ENTERPRISE_CLIENT_COUNT.ENT_CLI_COU}/${END_POINT_SERVICE.POST_UPD_ESTADO}`;
    return this.http.post<Map<string, any>>(url, data).pipe(
      catchError(this.handleError)
    );
  }

  saveClient(data: any): Observable<any> {
    const url = `${environment.apiUrl}/${ENTERPRISE_CLIENT_COUNT.ENT_CLI_COU}/${ENTERPRISE_CLIENT_COUNT.POST_SAVE_CLI}`;
    return this.http.post<any>(url, data).pipe(
      catchError(this.handleError)
    );
  }

  deleteClienteById(id: number): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<ApiResponse<any>>(url).pipe(
      catchError(this.handleError)
    );
  }

  deleteClient(idPersona: number): Observable<any> {
  const url = `${environment.apiUrl}/${ENTERPRISE_CLIENT_COUNT.ENT_CLI_COU}/${ENTERPRISE_CLIENT_COUNT.DELETE_CLI}/${idPersona}`;
  return this.http.delete<any>(url).pipe(
    catchError(this.handleError)
  );
}

  getClienteById(id: number): Observable<ApiResponse<IEnterpriseClientCounter>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<ApiResponse<IEnterpriseClientCounter>>(url).pipe(
      catchError(this.handleError)
    );
  }

   updateClient(data: any): Observable<any> {
    const url = `${environment.apiUrl}/${ENTERPRISE_CLIENT_COUNT.ENT_CLI_COU}/${ENTERPRISE_CLIENT_COUNT.UPDATE_CLI}`;
    return this.http.post<any>(url, data).pipe(
      catchError(this.handleError)
    );
  }

}
