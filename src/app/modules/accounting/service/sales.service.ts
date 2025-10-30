import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError, Observable, throwError } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { IPaginationParams, IPaginatedResponse } from "@interfaces/IpaginatedResponse";
import { ISale, ISaleFilters } from "@interfaces/Isale";
import { ICreateVenta } from "@interfaces/ICreateVenta";
import { ISaleDetail } from "@interfaces/ISaleDetail";

@Injectable({
  providedIn: 'root',
})
export class SalesService {


  private readonly apiUrl = `${environment.apiUrl}`;
  private readonly http = inject(HttpClient);

  getSalesByEnterpriceId(enterpriseId: number): Observable<ApiResponse<ISale[]>> {
    return this.http.get<ApiResponse<ISale[]>>(`${this.apiUrl}/venta/empresa/${enterpriseId}`);
  }

  getAllSalesByIdPaginated(
    enterpriseId: number,
    pagination: IPaginationParams,
    filters?: ISaleFilters
  ): Observable<IPaginatedResponse<ISale>> {
    let params = new HttpParams()
      .set('page', pagination.page.toString())
      .set('size', pagination.size.toString());

    // Agregar filtros si existen
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      }
    }

    return this.http.get<IPaginatedResponse<ISale>>(
      `${this.apiUrl}/venta/empresa/${enterpriseId}`,
      { params }
    ).pipe(
      catchError((error) => {
        console.error('Error fetching sales:', error);
        return throwError(() => error);
      })
    );
  }

  getSaleById(id: number): Observable<ApiResponse<ISaleDetail>> {
    return this.http.get<ApiResponse<ISaleDetail>>(`${this.apiUrl}/venta/${id}`).pipe(
      catchError((error) => {
        console.error('Error fetching sale details:', error);
        return throwError(() => error);
      })
    );
  }

  deleteSaleById(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/venta/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting sale:', error);
        return throwError(() => error);
      })
    );
  }

  createVenta(venta: ICreateVenta): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/venta/venta`, venta).pipe(
      catchError((error) => {
        console.error('Error creating sale:', error);
        return throwError(() => error);
      })
    );
  }
}
