import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { END_POINT_SERVICE } from "../../../environments/environment.variables";
import { Router } from "@angular/router";
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError, map, Observable, throwError } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { IFactura, IfacturaResponse } from "@interfaces/Ifactura";
import { IPaginatedResponse, IPaginationParams } from "@interfaces/IpaginatedResponse";

@Injectable({
    providedIn: 'root'
})
export class FacturaService {

    private apiUrl = `${environment.apiUrl}/${END_POINT_SERVICE.GET_FACTURA}`;
    private Url = `${environment.apiUrl}/${END_POINT_SERVICE.GET_FACTURA}/${END_POINT_SERVICE.GET_FACTURA_ALL}`;
    protected readonly router = inject(Router)
    protected readonly http = inject(HttpClient)

    getAllBillById(id: number): Observable<ApiResponse<IfacturaResponse[]>> {
        const url = `${this.apiUrl}/empresa/${id}`;
        return this.http.get<ApiResponse<IfacturaResponse[]>>(url).pipe(
            map(response => response),
        );
    }

    deleteFacturaById(id: number): Observable<ApiResponse<any>> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<ApiResponse<any>>(url).pipe(
            catchError(this.handleError)
        );
    }

    getFacturaById(id: number): Observable<ApiResponse<IFactura>> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<ApiResponse<IFactura>>(url).pipe(
            catchError(this.handleError)
        );
    }

    updateFactura(factura: IFactura): Observable<ApiResponse<IFactura>> {
        return this.http.put<ApiResponse<IFactura>>(this.apiUrl, factura).pipe(
            catchError(this.handleError)
        );
    }


    private handleError(error: any): Observable<never> {
        let errorMessage = 'An unknown error occurred while loading factura.';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Client Error: ${error.error.message}`;
        } else {
            errorMessage = `Server Error: ${error.status} - ${error.message || ''}`;
            if (error.error && error.error.message) {
                errorMessage = `${errorMessage} - ${error.error.message}`;
            }
        }
        console.error('Error in facturaService:', errorMessage);
        return throwError(() => new Error(errorMessage));
    }


    getFacturAll(): Observable<ApiResponse<IfacturaResponse[]>> {
        return this.http.get<ApiResponse<IfacturaResponse[]>>(this.Url);
    }

    /**
     * Obtiene las facturas de una empresa con paginación del servidor
     */
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
            Object.entries(params.filters).forEach(([key, value]) => {
                if (value) {
                    httpParams = httpParams.set(key, value);
                }
            });
        }

        return this.http.get<IPaginatedResponse<IfacturaResponse>>(url, { params: httpParams }).pipe(
            catchError(this.handleError)
        );
    }
}
