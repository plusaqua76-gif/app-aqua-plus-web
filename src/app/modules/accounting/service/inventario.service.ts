import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { END_POINT_SERVICE } from "../../../environments/environment.variables";
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError, Observable, throwError } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { IInventario, IInventarioCreate } from "@interfaces/Iaccounting";
import { IPaginatedResponse, IPaginationParams } from "@interfaces/IpaginatedResponse";

@Injectable({
  providedIn: 'root',
})
export class InventarioService {

  readonly apiUrl = `${environment.apiUrl}/${END_POINT_SERVICE.GET_INVENTORY}`;
  readonly http = inject(HttpClient);

  createInventary(inventary: IInventarioCreate): Observable<ApiResponse<IInventario>> {
    return this.http.post<ApiResponse<IInventario>>(`${this.apiUrl}`, inventary);
  }

  getInventoryCompany(enterpriseId: number): Observable<ApiResponse<IInventario[]>> {
    return this.http.get<ApiResponse<IInventario[]>>(`${this.apiUrl}/empresa/${enterpriseId}`);
  }

  getAllInventary(IdEnterprice: number): Observable<ApiResponse<IInventario[]>> {
   return this.http.get<ApiResponse<IInventario[]>>(`${this.apiUrl}/empresa/${IdEnterprice}`);
  }

  getInventoryById(inventarioId: number): Observable<ApiResponse<IInventario>> {
    return this.http.get<ApiResponse<IInventario>>(`${this.apiUrl}/${inventarioId}`);
  }

  getInventoryCompanyPaginated(
    empresaId: number,
    params: IPaginationParams
  ): Observable<IPaginatedResponse<IInventario>> {
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
      .get<IPaginatedResponse<IInventario>>(url, { params: httpParams })
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

  private applyFilter(
    httpParams: HttpParams,
    key: string,
    value: string
  ): HttpParams {
    switch (key) {
      case 'codigo':
        return httpParams.set('codigo', value);
      case 'nombre':
        return httpParams.set('nombre', value);
      case 'descripcion':
        return httpParams.set('descripcion', value);
      case 'cantidad':
        return this.isValidNumber(value)
          ? httpParams.set('cantidad', value)
          : httpParams;
      case 'precio':
      case 'precioUnitario':
        return this.isValidNumber(value)
          ? httpParams.set('precio', value)
          : httpParams;
      case 'categoria':
        return httpParams.set('categoria', value);
      case 'fechaCreacion':
        return this.isValidDateFormat(value)
          ? httpParams.set('fechaCreacion', value)
          : httpParams;
      case 'estado':
        return httpParams.set('estado', value);
      default:
        return httpParams.set(key, value);
    }
  }

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

  private isValidNumber(value: string): boolean {
    const trimmed = value.trim();
    return trimmed !== '' && !isNaN(Number(trimmed));
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred while loading inventory.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error: ${error.status} - ${error.message || ''}`;
      if (error.error?.message) {
        errorMessage = `${errorMessage} - ${error.error.message}`;
      }
    }
    console.error('Error in inventarioService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
