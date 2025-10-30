import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { END_POINT_SERVICE } from '../../../environments/environment.variables';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from '@interfaces/Iresponse';
import { IFactura, IfacturaResponse } from '@interfaces/Ifactura';
import {
  IPaginatedResponse,
  IPaginationParams,
} from '@interfaces/IpaginatedResponse';


@Injectable({
  providedIn: 'root',
})
export class FacturaService {
  private readonly apiUrl = `${environment.apiUrl}/${END_POINT_SERVICE.GET_FACTURA}`;
  private readonly Url = `${environment.apiUrl}/${END_POINT_SERVICE.GET_FACTURA}/${END_POINT_SERVICE.GET_FACTURA_ALL}`;
  protected readonly router = inject(Router);
  protected readonly http = inject(HttpClient);

  getAllBillById(id: number): Observable<ApiResponse<IfacturaResponse[]>> {
    const url = `${this.apiUrl}/empresa/${id}`;
    return this.http
      .get<ApiResponse<IfacturaResponse[]>>(url)
      .pipe(map((response) => response));
  }

  deleteFacturaById(id: number): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http
      .delete<ApiResponse<any>>(url)
      .pipe(catchError(this.handleError));
  }

  getFacturaById(id: number): Observable<ApiResponse<IFactura>> {
    const url = `${this.apiUrl}/${id}`;
    return this.http
      .get<ApiResponse<IFactura>>(url)
      .pipe(catchError(this.handleError));
  }

  updateFactura(factura: IFactura): Observable<ApiResponse<IFactura>> {
    return this.http
      .put<ApiResponse<IFactura>>(this.apiUrl, factura)
      .pipe(catchError(this.handleError));
  }

  updateStatusBill(idBill: number, estadoId: number, estadoNombre: string): Observable<ApiResponse<IFactura>> {
    const body = {
      id: idBill,
      estado: {
        id: estadoId,
        nombre: estadoNombre
      }
    };
    return this.http.put<ApiResponse<IFactura>>(`${this.apiUrl}`, body)
      .pipe(catchError(this.handleError));
  }


  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred while loading factura.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error: ${error.status} - ${error.message || ''}`;
      if (error.error?.message) {
        errorMessage = `${errorMessage} - ${error.error.message}`;
      }
    }
    console.error('Error in facturaService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getFacturAll(): Observable<ApiResponse<IfacturaResponse[]>> {
    return this.http.get<ApiResponse<IfacturaResponse[]>>(this.Url);
  }

  getAllBillByIdPaginated(
    empresaId: number,
    params: IPaginationParams
  ): Observable<IPaginatedResponse<IfacturaResponse>> {
    const url = `${this.apiUrl}/empresa/${empresaId}`;

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
      .get<IPaginatedResponse<IfacturaResponse>>(url, { params: httpParams })
      .pipe(catchError(this.handleError));
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

  /**
   * Aplica filtros directos: una columna = un parámetro de la API
   */
  private applyFilter(
    httpParams: HttpParams,
    key: string,
    value: string
  ): HttpParams {
    switch (key) {
      case 'codigo':
        return httpParams.set('codigo', value);
      case 'nombre':
      case 'apellido':
        return httpParams.set('clienteNombreCompleto', value);
      case 'consumo':
        return this.isValidNumber(value)
          ? httpParams.set('consumo', value)
          : httpParams;
      case 'fechaEmision':
        return this.isValidDateFormat(value)
          ? httpParams.set('fechaEmision', value)
          : httpParams;
      case 'fechaFin':
        return this.isValidDateFormat(value)
          ? httpParams.set('fechaFin', value)
          : httpParams;
      case 'estadoNombre':
        return httpParams.set('estadoNombre', value);
      case 'tipoPagoNombre':
        return httpParams.set('tipoPagoNombre', value);
      case 'precio':
        return this.handleNumericRangeFilter(
          httpParams,
          value,
          null,
          'precioMin',
          'precioMax'
        );
      default:
        return httpParams.set(key, value);
    }
  }

  /**
   * Maneja filtros numéricos que pueden ser valores exactos o rangos
   * Ejemplos: "100", ">100", "<500", "100-500"
   */
  private handleNumericRangeFilter(
    httpParams: HttpParams,
    value: string,
    exactParam: string | null,
    minParam: string,
    maxParam: string
  ): HttpParams {
    const trimmedValue = value.trim();

    if (trimmedValue.startsWith('>')) {
      return this.handleGreaterThan(httpParams, trimmedValue, minParam);
    }

    if (trimmedValue.startsWith('<')) {
      return this.handleLessThan(httpParams, trimmedValue, maxParam);
    }

    if (trimmedValue.includes('-') && !trimmedValue.startsWith('-')) {
      return this.handleRange(httpParams, trimmedValue, minParam, maxParam);
    }

    return this.handleExactValue(
      httpParams,
      trimmedValue,
      exactParam,
      minParam,
      maxParam
    );
  }

  private handleGreaterThan(
    httpParams: HttpParams,
    value: string,
    minParam: string
  ): HttpParams {
    const minValue = value.substring(1).trim();
    return this.isValidNumber(minValue)
      ? httpParams.set(minParam, minValue)
      : httpParams;
  }

  private handleLessThan(
    httpParams: HttpParams,
    value: string,
    maxParam: string
  ): HttpParams {
    const maxValue = value.substring(1).trim();
    return this.isValidNumber(maxValue)
      ? httpParams.set(maxParam, maxValue)
      : httpParams;
  }

  private handleRange(
    httpParams: HttpParams,
    value: string,
    minParam: string,
    maxParam: string
  ): HttpParams {
    const [min, max] = value.split('-').map((p) => p.trim());
    if (min && this.isValidNumber(min)) {
      httpParams = httpParams.set(minParam, min);
    }
    if (max && this.isValidNumber(max)) {
      httpParams = httpParams.set(maxParam, max);
    }
    return httpParams;
  }

  private handleExactValue(
    httpParams: HttpParams,
    value: string,
    exactParam: string | null,
    minParam: string,
    maxParam: string
  ): HttpParams {
    if (!this.isValidNumber(value)) return httpParams;

    if (exactParam) {
      return httpParams.set(exactParam, value);
    }

    return httpParams.set(minParam, value).set(maxParam, value);
  }

  /**
   * Valida si el valor es una fecha válida en formato ISO (YYYY-MM-DD)
   */
  private isValidDateFormat(value: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) return false;

    const date = new Date(value);
    return (
      date instanceof Date &&
      !isNaN(date.getTime()) &&
      date.toISOString().split('T')[0] === value
    );
  }

  /**
   * Valida si el valor es un número válido
   */
  private isValidNumber(value: string): boolean {
    const trimmed = value.trim();
    return trimmed !== '' && !isNaN(Number(trimmed));
  }
}
