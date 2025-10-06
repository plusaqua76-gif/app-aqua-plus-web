import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { END_POINT_SERVICE } from "../../../environments/environment.variables";
import { Router } from "@angular/router";
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError, map, Observable, throwError } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { IEmpleadoEmpresaResponse } from "@interfaces/Iemployee";
import { ICorreoPerson } from '@interfaces/Iperson';
import { ITelefonoGeneral } from '@interfaces/ItelefonoGeneral';
import { forkJoin } from 'rxjs';
import { CorreoPersonaService } from "../../client/service/correoPersona.service";
import { TelefonoGeneralService } from "../../client/service/telefonoPersona.service";
import { IPaginatedResponse, IPaginationParams } from "@interfaces/IpaginatedResponse";

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {

  readonly apiUrl = `${environment.apiUrl}`

  protected readonly correoService = inject(CorreoPersonaService)
  protected readonly telefonoService = inject(TelefonoGeneralService)
  protected readonly router = inject(Router)
  protected readonly http = inject(HttpClient)





  getEmployeeByEnterprice(id: number): Observable<ApiResponse<IEmpleadoEmpresaResponse[]>> {
      const url = `${this.apiUrl}/empleado-empresa/empresa/${id}`;
      return this.http.get<ApiResponse<IEmpleadoEmpresaResponse[]>>(url).pipe(
          map(response => response),
      );
  }


  getEmployeeByEnterpricePaginated(
    empresaId: number,
    params: IPaginationParams
  ): Observable<IPaginatedResponse<IEmpleadoEmpresaResponse>> {
    const url = `${this.apiUrl}/empleado-empresa/empresa/${empresaId}`;

    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('size', params.size.toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params.filters) {
      httpParams = this.mapFiltersToHttpParams(httpParams, params.filters);
    }

    return this.http.get<IPaginatedResponse<IEmpleadoEmpresaResponse>>(url, { params: httpParams })
  }


  private mapFiltersToHttpParams(httpParams: HttpParams, filters: Record<string, string>): HttpParams {
    Object.entries(filters).forEach(([key, value]) => {
      if (value?.trim()) {
        const trimmedValue = value.trim();
        httpParams = this.applyEmployeeFilter(httpParams, key, trimmedValue);
      }
    });
    return httpParams;
  }


  private applyEmployeeFilter(httpParams: HttpParams, key: string, value: string): HttpParams {
    switch (key) {
      case 'nombre':
        return httpParams.set('nombre', value);
      case 'apellido':
        return httpParams.set('apellido', value);
      case 'documento':
        return httpParams.set('documento', value);
      case 'correo':
        return httpParams.set('correo', value);
      case 'telefono':
        return httpParams.set('telefono', value);
      case 'cargo':
        return httpParams.set('cargo', value);
      case 'estado':
        return httpParams.set('activo', value === 'Activo' ? 'true' : 'false');
      default:
        return httpParams.set(key, value);
    }
  }

  private isValidNumber(value: string): boolean {
    const trimmed = value.trim();
    return trimmed !== '' && !isNaN(Number(trimmed));
  }

  saveEmpleado(data: any): Observable<Map<string, any>> {
    const url = `${environment.apiUrl}/${END_POINT_SERVICE.GET_EMPLEADO}/${END_POINT_SERVICE.GET_SAVE_EMPLEADO}`;
    return this.http.post<Map<string, any>>(url, data)
  }
  getEmpleadoById(id: number): Observable<ApiResponse<IEmpleadoEmpresaResponse>> {
    const url = `${this.apiUrl}/${END_POINT_SERVICE.GET_EMPLEADO}/empresa/${id}`;
    return this.http.get<ApiResponse<IEmpleadoEmpresaResponse>>(url)
  }

  updateEmpleado(data: any): Observable<Record<string, any>> {
    const url = `${environment.apiUrl}/${END_POINT_SERVICE.GET_EMPLEADO}/update`;
    return this.http.put<Record<string, any>>(url, data)
  }

  getAllEmpleados(): Observable<ApiResponse<IEmpleadoEmpresaResponse[]>> {
    const url = `${this.apiUrl}/${END_POINT_SERVICE.GET_EMPLEADO_ALL}`;
    return this.http.get<ApiResponse<IEmpleadoEmpresaResponse[]>>(url);
  }

  getAllDatosEmpleadoCompleto(): Observable<{
    empleados: ApiResponse<IEmpleadoEmpresaResponse[]>,
    correos: ApiResponse<ICorreoPerson[]>,
    telefonos: ApiResponse<ITelefonoGeneral[]>
  }> {
    const empleados$ = this.getAllEmpleados();
    const correos$ = this.correoService.getAllCorreo();
    const telefonos$ = this.telefonoService.getAllTelefono();

    return forkJoin({
      empleados: empleados$,
      correos: correos$,
      telefonos: telefonos$
    });
  }


  updateEstadoEmpleado(data: { id_persona: number, activo: boolean, usuario_cambio: string }): Observable<Map<string, any>> {
    const url = `${environment.apiUrl}/${END_POINT_SERVICE.GET_EMPLEADO}/${END_POINT_SERVICE.POST_UPD_ESTADO}`;
    return this.http.post<Map<string, any>>(url, data)
  }
}
