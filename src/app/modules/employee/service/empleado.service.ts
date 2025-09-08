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








  // esto de sebe modificar, lo lindo esta arriba omitiendo esto /empleado-empresa/empresa


  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred while loading empleado.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `empleado Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error: ${error.status} - ${error.message || ''}`;
      if (error.error && error.error.message) {
        errorMessage = `${errorMessage} - ${error.error.message}`;
      }
    }
    console.error('Error in empleado:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  saveEmpleado(data: any): Observable<Map<string, any>> {
    const url = `${environment.apiUrl}/${END_POINT_SERVICE.GET_EMPLEADO}/${END_POINT_SERVICE.GET_SAVE_EMPLEADO}`;
    return this.http.post<Map<string, any>>(url, data).pipe(
      catchError(this.handleError)
    );
  }
  getEmpleadoById(id: number): Observable<ApiResponse<IEmpleadoEmpresaResponse>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<ApiResponse<IEmpleadoEmpresaResponse>>(url).pipe(
      catchError(this.handleError)
    );
  }

  updateEmpleado(data: any): Observable<Record<string, any>> {
    const url = `${environment.apiUrl}/${END_POINT_SERVICE.GET_EMPLEADO}/update`;
    return this.http.put<Record<string, any>>(url, data).pipe(
      catchError(this.handleError)
    );
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
    return this.http.post<Map<string, any>>(url, data).pipe(
      catchError(this.handleError)
    );
  }
}
