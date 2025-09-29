import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { END_POINT_SERVICE } from "../../../environments/environment.variables";
import { Router } from "@angular/router";
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError, Observable, throwError } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { IFactura } from "@interfaces/Ifactura";
import { IDeudaCliente, IDeudaClienteResponse } from "@interfaces/IdeudaFactura";
import { IPaginatedResponse, IPaginationParams } from "@interfaces/IpaginatedResponse";

@Injectable({
    providedIn: 'root'
})
export class DeudaService {

    readonly apiUrl = `${environment.apiUrl}/${END_POINT_SERVICE.GET_DEUDA}`;

    protected readonly router = inject(Router)
    protected readonly http = inject(HttpClient)

    getDebtById(id: number): Observable<ApiResponse<IDeudaCliente>> {
      return this.http.get<ApiResponse<IDeudaCliente>>(`${this.apiUrl}/${id}`)
    }

    getAllDeuda(): Observable<ApiResponse<IDeudaCliente[]>> {
        return this.http.get<ApiResponse<IDeudaCliente[]>>(`${this.apiUrl}/${END_POINT_SERVICE.GET_DEUDA_ALL}`).pipe(
            catchError(this.handleError)
        );
    }


    getAllDeudaPaginated(
        empresaId: number,
        params: IPaginationParams
    ): Observable<IPaginatedResponse<IDeudaClienteResponse>> {
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
            .get<IPaginatedResponse<IDeudaClienteResponse>>(url, { params: httpParams })
            .pipe(catchError(this.handleError));
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

    saveDeuda(deuda: IDeudaCliente): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}`, deuda).pipe(
            catchError(this.handleError)
        );
    }
    deleteDeudaById(id: number): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }
    getDeudaById(id: number): Observable<ApiResponse<IDeudaCliente>> {
        return this.http.get<ApiResponse<IDeudaCliente>>(`${this.apiUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }
    updateDeuda(deuda: IDeudaCliente): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.apiUrl}`, deuda).pipe(
            catchError(this.handleError)
        );
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
            case 'clienteNombreCompleto':
                return httpParams.set('clienteNombreLike', value);
            case 'facturaCodigo':
                return httpParams.set('facturaCodigoLike', value);
            case 'descripcion':
                return httpParams.set('descripcionLike', value);
            case 'fechaDeudaTexto':
                return this.isValidDateFormat(value)
                    ? httpParams.set('fechaDeuda', value)
                    : httpParams;
            case 'valorTexto':
                return this.isValidNumber(value)
                    ? httpParams.set('valor', parseFloat(value.replace(/[$,]/g, '')).toString())
                    : httpParams;
            case 'tipoDeudaNombre':
                return httpParams.set('tipoDeudaNombre', value);
            case 'plazoPagoNombre':
                return httpParams.set('plazoPagoNombre', value);
            default:
                return httpParams.set(key, value);
        }
    }


    private isValidDateFormat(value: string): boolean {
        // Validar formato yyyy-mm-dd o dd/mm/yyyy o dd-mm-yyyy
        const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}[/-]\d{2}[/-]\d{4}$/;
        if (!dateRegex.test(value)) return false;

        const date = new Date(value);
        return !isNaN(date.getTime());
    }

    private isValidNumber(value: string): boolean {
        const numericValue = parseFloat(value.replace(/[$,]/g, ''));
        return !isNaN(numericValue) && isFinite(numericValue);
    }

}
