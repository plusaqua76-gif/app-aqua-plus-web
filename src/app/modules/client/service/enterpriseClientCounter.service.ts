import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { HttpClient, HttpParams } from '@angular/common/http';
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
import { IPaginatedResponse, IPaginationParams } from '@interfaces/IpaginatedResponse';
import { ClientApiResponse, ClientsPaginatedApiResponse, ClientsApiResponse } from '@interfaces/client/IclientApiResponse';

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

  // Método que obtiene todos los clientes y los transforma a ClientRow[]
  getAllClientsByIdEnterprise(enterpriseId: number): Observable<ApiResponse<ClientRow[]>> {
    const url = `${this.apiUrl}/${ENTERPRISE_CLIENT_COUNT.GET_CLIENT}/${enterpriseId}`;
    return this.http.get<ClientsApiResponse>(url).pipe(
      map(response => ({
        success: response.success,
        message: response.message,
        code: response.code,
        response: response.response.map(client => this.transformToClientRow(client))
      }))
    );
  }


  getAllClientsByIdEnterprisePaginated(
    enterpriseId: number,
    params: IPaginationParams
  ): Observable<IPaginatedResponse<ClientRow>> {
    const url = `${this.apiUrl}/${ENTERPRISE_CLIENT_COUNT.GET_CLIENT}/${enterpriseId}`;

    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('size', params.size.toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params.filters) {
      httpParams = this.mapFiltersToHttpParams(httpParams, params.filters);
    }

    return this.http
      .get<ClientsPaginatedApiResponse>(url, { params: httpParams })
      .pipe(
        map(response => ({
          success: response.success,
          message: response.message,
          code: response.code,
          totalCount: response.totalCount,
          pageSize: response.pageSize,
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          response: response.response.map(client => this.transformToClientRow(client))
        }))
      );
  }

  getEntClientCounterById(id: number): Observable<ApiResponse<IEnterpriseClientCounter>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<ApiResponse<IEnterpriseClientCounter>>(url)
  }
  updateEstado(data: { id_persona: number, activo: boolean, usuario_cambio: string }): Observable<Map<string, any>> {
    const url = `${environment.apiUrl}/${ENTERPRISE_CLIENT_COUNT.ENT_CLI_COU}/${END_POINT_SERVICE.POST_UPD_ESTADO}`;
    return this.http.post<Map<string, any>>(url, data)
  }

  saveClient(data: any): Observable<any> {
    const url = `${environment.apiUrl}/${ENTERPRISE_CLIENT_COUNT.ENT_CLI_COU}/${ENTERPRISE_CLIENT_COUNT.POST_SAVE_CLI}`;
    return this.http.post<any>(url, data)
  }

  deleteClienteById(id: number): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<ApiResponse<any>>(url)
  }

  deleteClient(idPersona: number): Observable<any> {
  const url = `${environment.apiUrl}/${ENTERPRISE_CLIENT_COUNT.ENT_CLI_COU}/${ENTERPRISE_CLIENT_COUNT.DELETE_CLI}/${idPersona}`;
  return this.http.delete<any>(url)
}

  getClienteById(id: number): Observable<ApiResponse<IEnterpriseClientCounter>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<ApiResponse<IEnterpriseClientCounter>>(url)
  }

   updateClient(data: any): Observable<any> {
    const url = `${environment.apiUrl}/${ENTERPRISE_CLIENT_COUNT.ENT_CLI_COU}/${ENTERPRISE_CLIENT_COUNT.UPDATE_CLI}`;
    return this.http.post<any>(url, data)
  }


  private mapFiltersToHttpParams(
    httpParams: HttpParams,
    filters: Record<string, string>
  ): HttpParams {
    Object.entries(filters).forEach(([key, value]) => {
      if (value?.trim()) {
        const trimmedValue = value.trim();
        httpParams = this.applyFilter(httpParams, key, trimmedValue);
      }
    });
    return httpParams;
  }


  private transformToClientRow(client: ClientApiResponse): ClientRow {
    const fullName = [client?.nombre, client?.segundoNombre, client?.apellido, client?.segundoApellido]
      .filter(Boolean)
      .join(' ')
      .trim();

    return {
      id: client?.id ?? 0,
      numeroIdentificacion: client?.numeroCedula ?? '',
      nombreCliente: fullName || '',
      telefono: client?.telefono ?? '',
      vereda: client?.direccion?.corregimiento?.nombre ?? '',
      direccion: client?.direccion?.descripcion ?? '',
      correo: client?.correo ?? '',
      estado: client?.activo ?? false,
      //  opcionales
      direccionCompleta: client?.direccion,
      tipoDocumento: client?.tipoDocumento,
      nombre: client?.nombre,
      segundoNombre: client?.segundoNombre,
      apellido: client?.apellido,
      segundoApellido: client?.segundoApellido,
      codigo: client?.codigo
    };
  }

  private applyFilter(
    httpParams: HttpParams,
    key: string,
    value: string
  ): HttpParams {
    switch (key) {
      case 'nombreCliente':
        return httpParams.set('nombreCompleto', value);
      case 'numeroIdentificacion':
        return httpParams.set('cedula', value);
      case 'idContador':
        return httpParams.set('codigo', value);
      case 'codigoVereda':
        return httpParams.set('corregimiento', value);
      case 'telefono':
        return httpParams.set('telefono', value);
      case 'correo':
        return httpParams.set('correo', value);
      case 'direccion':
        return httpParams.set('departamento', value); // Si la dirección contiene departamento
      default:
        return httpParams.set(key, value);
    }
  }

  private isValidNumber(value: string): boolean {
    const numericValue = parseFloat(value);
    return !isNaN(numericValue) && isFinite(numericValue);
  }

}
