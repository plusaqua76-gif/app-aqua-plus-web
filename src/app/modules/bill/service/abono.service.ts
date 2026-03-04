import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { END_POINT_SERVICE } from "../../../../environments/environment.variables";
import { Router } from "@angular/router";
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError, Observable, throwError } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { IFactura } from "@interfaces/Ifactura";
import { IAbonoFactura, IAbonoFacturaResponse, IDeudaCliente } from "@interfaces/IdeudaFactura";
import { IPaginatedResponse, IPaginationParams } from "@interfaces/IpaginatedResponse";

export interface IAbonoMassive {
  eccId: number,
  valorTotal: number,
  usuario: string
}

export interface IAbonoItem {
  deudaCliente: {
    id: number
  },
  valor: number
}

export interface IAbonoMultiple {
  usuarioCreacion: string,
  items: IAbonoItem[]
}

@Injectable({
    providedIn: 'root'
})
export class AbonoService {

    readonly apiUrl = `${environment.apiUrl}/${END_POINT_SERVICE.GET_ABONO}`;

    protected readonly router = inject(Router)
    protected readonly http = inject(HttpClient)

    setAbonoMassive(masiveValue: IAbonoMassive): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}/masivo`, masiveValue)
    }

    getAllAbono(): Observable<ApiResponse<IAbonoFactura[]>> {
        return this.http.get<ApiResponse<IAbonoFactura[]>>(`${this.apiUrl}/${END_POINT_SERVICE.GET_ABONO_ALL}`).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Obtiene todos los abonos de una empresa con paginación y filtros
     * @param empresaId ID de la empresa
     * @param params Parámetros de paginación y filtros
     */
    getAllAbonoPaginated(
        empresaId: number,
        params: IPaginationParams
    ): Observable<IPaginatedResponse<IAbonoFacturaResponse>> {
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
            .get<IPaginatedResponse<IAbonoFacturaResponse>>(url, { params: httpParams })
            .pipe(catchError(this.handleError));
    }

    saveAbono(abono: IAbonoFactura): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}`, abono)
    }

    saveAbonoMultiple(abonoMultiple: IAbonoMultiple): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}`, abonoMultiple)
    }

    /**
     * Mapea los filtros del objeto filters a HttpParams
     */
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
            case 'nombreCliente':
                return httpParams.set('cliente', value);
            case 'codigoFactura':
                return httpParams.set('codigoFactura', value);
            case 'fechaAbono':
                return this.isValidDateFormat(value)
                    ? httpParams.set('fecha', this.convertToDateFormat(value))
                    : httpParams;
            case 'valorAbono':
                return this.isValidNumber(value)
                    ? httpParams.set('valor', parseFloat(value.replace(/[$,]/g, '')).toString())
                    : httpParams;
            default:
                return httpParams.set(key, value);
        }
    }


    private isValidDateFormat(value: string): boolean {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}[/-]\d{2}[/-]\d{4}$/;
        if (!dateRegex.test(value)) return false;

        const date = new Date(value);
        return !isNaN(date.getTime());
    }

    private convertToDateFormat(dateValue: string): string {
        try {
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                return dateValue;
            }

            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }

            return dateValue;
        } catch (error) {
            console.warn('Error converting date format:', error);
            return dateValue;
        }
    }

    private isValidNumber(value: string): boolean {
        const numericValue = parseFloat(value.replace(/[$,]/g, ''));
        return !isNaN(numericValue) && isFinite(numericValue);
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
}
