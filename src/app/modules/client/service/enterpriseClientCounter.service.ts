import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@interfaces/Iresponse';
import { SaveClientPayload, SaveClientResponse } from '@interfaces/ISaveClient';
import {
  END_POINT_SERVICE,
  ENTERPRISE_CLIENT_COUNT,
} from '../../../../environments/environment.variables';
import { IEnterpriseClientCounter } from '@interfaces/IenterpriseClientCounter';
import { Router } from '@angular/router';
import {
  IPaginationParams,
  IPaginatedResponse,
} from '@interfaces/IpaginatedResponse';
import {
  ClientRaw,
  ClientsRawApiResponse,
} from '@interfaces/client/IclientRaw';
import { IClienteDetalleApiResponse } from '@interfaces/client/IclientDetail';

@Injectable({
  providedIn: 'root',
})
export class EnterpriseClientCounterService {
  private readonly apiUrl = `${environment.apiUrl}/${ENTERPRISE_CLIENT_COUNT.ENT_CLI_COU}`;
  protected readonly router = inject(Router);
  protected readonly http = inject(HttpClient);

  getAllCLiente(): Observable<ApiResponse<IEnterpriseClientCounter[]>> {
    const url = `${this.apiUrl}/${ENTERPRISE_CLIENT_COUNT.GET_ALL_CLI}`;
    return this.http.get<ApiResponse<IEnterpriseClientCounter[]>>(url);
  }

  getClientBySerial(
    serial: string
  ): Observable<ApiResponse<IEnterpriseClientCounter>> {
    return this.http.get<ApiResponse<IEnterpriseClientCounter>>(
      `${environment.apiUrl}/contador/serial?serial=${serial}`
    );
  }

  deleteEnterpriceClientCounter(id: number): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<ApiResponse<any>>(url);
  }

  // Método que obtiene todos los clientes sin transformación
  getAllClientsByIdEnterprise(
    enterpriseId: number
  ): Observable<ClientsRawApiResponse> {
    const url = `${this.apiUrl}/${ENTERPRISE_CLIENT_COUNT.GET_CLIENT}/${enterpriseId}`;
    return this.http.get<ClientsRawApiResponse>(url);
  }

  getAllClientsByIdEnterprisePaginated(
    enterpriseId: number,
    params: IPaginationParams
  ): Observable<IPaginatedResponse<ClientRaw>> {
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

    return this.http.get<IPaginatedResponse<ClientRaw>>(url, {
      params: httpParams,
    });
  }

  getEntClientCounterById(
    id: number
  ): Observable<ApiResponse<IEnterpriseClientCounter>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<ApiResponse<IEnterpriseClientCounter>>(url);
  }
  updateEstado(data: {
    id_persona: number;
    activo: boolean;
    usuario_cambio: string;
  }): Observable<Map<string, any>> {
    const url = `${environment.apiUrl}/${ENTERPRISE_CLIENT_COUNT.ENT_CLI_COU}/${END_POINT_SERVICE.POST_UPD_ESTADO}`;
    return this.http.post<Map<string, any>>(url, data);
  }

  updateEstadoContador(data: {
    id: number;
    activo: boolean;
    usuarioCambio: string;
  }): Observable<ApiResponse<any>> {
    const url = `${environment.apiUrl}/${ENTERPRISE_CLIENT_COUNT.ENT_CLI_COU}/estado`;
    return this.http.post<ApiResponse<any>>(url, data);
  }

  saveClient(data: SaveClientPayload): Observable<SaveClientResponse> {
    const url = `${environment.apiUrl}/${ENTERPRISE_CLIENT_COUNT.ENT_CLI_COU}/${ENTERPRISE_CLIENT_COUNT.POST_SAVE_CLI}`;
    return this.http.post<SaveClientResponse>(url, data);
  }

  deleteClienteById(id: number): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<ApiResponse<any>>(url);
  }

  deleteClient(idPersona: number): Observable<any> {
    const url = `${environment.apiUrl}/${ENTERPRISE_CLIENT_COUNT.ENT_CLI_COU}/${ENTERPRISE_CLIENT_COUNT.DELETE_CLI}/${idPersona}`;
    return this.http.delete<any>(url);
  }

  getClienteById(
    id: number
  ): Observable<ApiResponse<IEnterpriseClientCounter>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<ApiResponse<IEnterpriseClientCounter>>(url);
  }

  getClientByEmpresaClienteContadorId(
    empresaClienteContadorId: number
  ): Observable<IClienteDetalleApiResponse> {
    const url = `${this.apiUrl}/${empresaClienteContadorId}`;
    return this.http.get<IClienteDetalleApiResponse>(url);
  }

  updateClient(data: any): Observable<any> {
    const url = `${environment.apiUrl}/${ENTERPRISE_CLIENT_COUNT.ENT_CLI_COU}/${ENTERPRISE_CLIENT_COUNT.UPDATE_CLI}`;
    return this.http.post<any>(url, data);
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

  private applyFilter(
    httpParams: HttpParams,
    key: string,
    value: string
  ): HttpParams {
    switch (key) {
      case 'nombre':
      case 'apellido':
        return httpParams.set('nombreCompleto', value);
      case 'numeroCedula':
        return httpParams.set('cedula', value);
      case 'codigo':
        return httpParams.set('codigo', value);
      case 'corregimientoNombre':
        return httpParams.set('corregimiento', value);
      case 'telefono':
        return httpParams.set('telefono', value);
      case 'correo':
        return httpParams.set('correo', value);
      case 'direccionDescripcion':
        return httpParams.set('direccion', value);
      case 'departamentoNombre':
        return httpParams.set('departamento', value);
      default:
        return httpParams.set(key, value);
    }
  }

  private isValidNumber(value: string): boolean {
    const numericValue = parseFloat(value);
    return !isNaN(numericValue) && isFinite(numericValue);
  }
}
