import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.prod";
import { END_POINT_SERVICE, ENTERPRISE_CLIENT_COUNT } from "../../../environments/environment.variables";
import { catchError, Observable, throwError } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { IEnterprise, IEnterpriseResponse } from "@interfaces/Ienterprise";
import { HttpClient } from "@angular/common/http";


@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

   private readonly apiUrl = `${environment.apiUrl}/${END_POINT_SERVICE.GET_ENTER}`;

  protected readonly http = inject(HttpClient)

  getAllEmpresa(): Observable<ApiResponse<IEnterpriseResponse[]>> {
    const url = `${environment.apiUrl}/${END_POINT_SERVICE.GET_ALL_ENTERPRISE}`;
    return this.http.get<ApiResponse<IEnterpriseResponse[]>>(url);
  }

  updateEstado(data: { id_empresa: number, activo: boolean, usuario_cambio: string }): Observable<Map<string, any>> {
    const url = `${environment.apiUrl}/${END_POINT_SERVICE.GET_ENTER}/${END_POINT_SERVICE.UPDATE_ESTADO}`;
    return this.http.post<Map<string, any>>(url, data).pipe(
      catchError(this.handleError)
    );
  }



  getEmpresaById(id: number): Observable<ApiResponse<IEnterpriseResponse>> {
      const url = `${this.apiUrl}/${id}`;
      return this.http.get<ApiResponse<IEnterpriseResponse>>(url).pipe(
        catchError(this.handleError)
      );
    }

    updateEmpresa(data: any): Observable<any> {
    const url = `${environment.apiUrl}/${END_POINT_SERVICE.GET_ENTER}/${END_POINT_SERVICE.UPDATE_EMPRESA}`;
    return this.http.post<any>(url, data).pipe(
      catchError(this.handleError)
    );
  }

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
}
