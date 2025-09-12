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

        // Mapear filtros específicos de la tabla a parámetros de la API
        if (params.filters) {
            httpParams = this.mapFiltersToHttpParams(httpParams, params.filters);
        }

        return this.http.get<IPaginatedResponse<IfacturaResponse>>(url, { params: httpParams }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Mapea los filtros de la tabla a parámetros HTTP específicos de la API
     */
    private mapFiltersToHttpParams(httpParams: HttpParams, filters: Record<string, string>): HttpParams {
        Object.entries(filters).forEach(([key, value]) => {
            if (value?.trim()) {
                const trimmedValue = value.trim();
                httpParams = this.applyFilter(httpParams, key, trimmedValue);
            }
        });
        return httpParams;
    }

    /**
     * Aplica un filtro específico a los parámetros HTTP
     */
    // esto es una pequeña implementacion, esto debera ser dinamico, es solo para verificar el funcionamiento real de filtros 
    private applyFilter(httpParams: HttpParams, key: string, value: string): HttpParams {
        switch (key) {
            case 'codigo':
                return httpParams.set('codigo', value);
            case 'nombre':
            case 'apellido':
                return httpParams.set('clienteNombreCompleto', value);
            case 'consumo':
                return this.handleNumericRangeFilter(httpParams, value, 'consumo', 'consumoMin', 'consumoMax');
            case 'fechaEmision':
                return this.handleDateRangeFilter(httpParams, value, 'fechaEmisionDesde', 'fechaEmisionHasta');
            case 'fechaFin':
                return this.handleDateRangeFilter(httpParams, value, 'fechaFinDesde', 'fechaFinHasta');
            case 'estadoNombre':
                return httpParams.set('estadoNombre', value);
            case 'tipoPagoNombre':
                return httpParams.set('tipoPagoNombre', value);
            case 'precio':
                return this.handleNumericRangeFilter(httpParams, value, null, 'precioMin', 'precioMax');
            default:
                return httpParams.set(key, value);
        }
    }

    /**
     * Maneja filtros numéricos que pueden ser valores exactos o rangos
     */
    private handleNumericRangeFilter(
        httpParams: HttpParams,
        value: string,
        exactParam: string | null,
        minParam: string,
        maxParam: string
    ): HttpParams {
        if (value.includes('-')) {
            const [min, max] = value.split('-').map(p => p.trim());
            if (min && !isNaN(Number(min))) httpParams = httpParams.set(minParam, min);
            if (max && !isNaN(Number(max))) httpParams = httpParams.set(maxParam, max);
        } else if (!isNaN(Number(value))) {
            if (exactParam) {
                httpParams = httpParams.set(exactParam, value);
            } else {
                httpParams = httpParams.set(minParam, value);
                httpParams = httpParams.set(maxParam, value);
            }
        }
        return httpParams;
    }

    /**
     * Maneja filtros de fecha que pueden ser fechas exactas o rangos
     */
    private handleDateRangeFilter(
        httpParams: HttpParams,
        value: string,
        fromParam: string,
        toParam: string
    ): HttpParams {
        if (value.includes('-')) {
            const [desde, hasta] = value.split('-').map(f => f.trim());
            if (desde) httpParams = httpParams.set(fromParam, desde);
            if (hasta) httpParams = httpParams.set(toParam, hasta);
        } else {
            httpParams = httpParams.set(fromParam, value);
            httpParams = httpParams.set(toParam, value);
        }
        return httpParams;
    }
}
