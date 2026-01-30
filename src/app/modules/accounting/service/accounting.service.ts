import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import { ApiResponse } from '@interfaces/Iresponse';
import {
  ParamsMetricasContables,
  ResponseMetricasContables,
} from '@interfaces/accounting/IMetricasContable';
import { IResultsAccounting } from '@interfaces/accounting/IResultsAccounting';
import { MovimientoContable } from '@interfaces/accounting/IMovimientoContable';
import {
  IPaginatedResponse,
  IPaginationParams,
} from '@interfaces/IpaginatedResponse';
import {
  CuentaTotal,
  ParamsCuentasTotales
} from '@interfaces/accounting/ICuentaTotal';

@Injectable({
  providedIn: 'root',
})
export class AccountingService {
  private readonly apiUrl = `${environment.apiUrl}`;
  private readonly http = inject(HttpClient);

  getMetricasContables(
    params: ParamsMetricasContables,
  ): Observable<ApiResponse<ResponseMetricasContables>> {
    return this.http.get<ApiResponse<ResponseMetricasContables>>(
      `${this.apiUrl}/metricas-contables/${params.empresa}`,
      {
        params: {
          anio: params.año ? params.año.toString() : '',
          mes: params.mes ? params.mes.toString() : '',
          cantidadPeriodos: params.cantidadPeriodos ? params.cantidadPeriodos.toString() : '',
        },
      },
    );
  }

  getResultadosContables(
    params: ParamsMetricasContables,
  ): Observable<ApiResponse<IResultsAccounting>> {
    return this.http.get<ApiResponse<IResultsAccounting>>(
      `${this.apiUrl}/resultado-contable-mes/${params.empresa}`,
      {
        params: {
          anio: params.año ? params.año.toString() : '',
          mes: params.mes ? params.mes.toString() : '',
          fechaHasta: params.hasta ? params.hasta : '',
          fechaDesde: params.desde ? params.desde : '',
        },
      },
    );
  }

  getServerMovimientosContables(
    idEmpresa: number,
    params: IPaginationParams
  ): Observable<IPaginatedResponse<MovimientoContable>> {
    const url = `${this.apiUrl}/cuenta/getHistorico`;

    let httpParams = new HttpParams()
      .set('idEmpresa', idEmpresa.toString())
      .set('page', params.page.toString())
      .set('size', params.size.toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    if (params.filters) {
      httpParams = this.mapFiltersToHttpParams(httpParams, params.filters);
    }

    return this.http
      .get<IPaginatedResponse<MovimientoContable>>(url, { params: httpParams })
      .pipe(catchError((error) => {
        if (error.status === 404) {
          return of({
            success: true,
            message: 'No se encontraron registros',
            code: 404,
            totalCount: 0,
            pageSize: params.size,
            currentPage: params.page,
            totalPages: 0,
            response: []
          });
        } else {
          return this.handleError(error);
        }
      }));
  }

  getCuentasTotales(
    params: ParamsCuentasTotales,
    paginationParams: IPaginationParams
  ): Observable<IPaginatedResponse<CuentaTotal>> {
    const url = `${this.apiUrl}/cuenta-total/getCuenta-total`;

    let httpParams = new HttpParams()
      .set('idEmpresa', params.idEmpresa.toString())
      .set('fechaInicio', params.fechaInicio)
      .set('fechaFin', params.fechaFin)
      .set('page', paginationParams.page.toString())
      .set('size', paginationParams.size.toString());

    if (paginationParams.search) {
      httpParams = httpParams.set('search', paginationParams.search);
    }

    if (paginationParams.filters) {
      httpParams = this.mapFiltersToHttpParams(httpParams, paginationParams.filters);
    }

    return this.http
      .get<IPaginatedResponse<CuentaTotal>>(url, { params: httpParams })
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            return of({
              success: true,
              message: 'No se encontraron cuentas totales',
              code: 404,
              totalCount: 0,
              pageSize: paginationParams.size,
              currentPage: paginationParams.page,
              totalPages: 0,
              response: []
            });
          }
          return this.handleError(error);
        })
      );
  }

  private mapFiltersToHttpParams(
    httpParams: HttpParams,
    filters: Record<string, string>
  ): HttpParams {
    Object.entries(filters).forEach(([key, value]) => {
      if (value?.trim()) {
        httpParams = httpParams.set(key, value.trim());
      }
    });
    return httpParams;
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred while loading accounting data.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error: ${error.status} - ${error.message || ''}`;
      if (error.error?.message) {
        errorMessage = `${errorMessage} - ${error.error.message}`;
      }
    }
    console.error('Error in accountingService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
