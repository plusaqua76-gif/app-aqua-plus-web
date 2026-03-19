import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { END_POINT_SERVICE } from "../../../../environments/environment.variables";
import { Router } from "@angular/router";
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError, Observable, throwError } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { IDeudaCliente, IDeudaClienteResponse } from "@interfaces/IdeudaFactura";
import { IPaginatedResponse, IPaginationParams } from "@interfaces/IpaginatedResponse";
import { IDeudaDetalle } from "@interfaces/IDeudaDetalle";

export interface IConsolidationDeuda {
  idTipoDeuda: number;
  nombreTipoDeuda: string;
  codigoTipoDeuda: string;
  numeroCuotas: number;
  valorCuota: number;
  abonosRealizados: number;
  cuotasCanceladas: number;
  cuotasPendientes: number;
  nuevoSaldo: number;
}

@Injectable({
    providedIn: 'root'
})
export class DeudaService {

    readonly apiUrl = `${environment.apiUrl}/${END_POINT_SERVICE.GET_DEUDA}`;
    protected readonly router = inject(Router)
    protected readonly http = inject(HttpClient)

    getConsolidationByClienteId(idClient: number): Observable<ApiResponse<IConsolidationDeuda>> {
      return this.http.get<ApiResponse<IConsolidationDeuda>>(`${this.apiUrl}/consolidado/${idClient}`)
    }

    getDebByCodeClienteContadorId(billCode: string): Observable<ApiResponse<IDeudaCliente[]>> {
        return this.http.get<ApiResponse<IDeudaCliente[]>>(`${this.apiUrl}/cliente-deuda/${billCode}`)
    }

    getDebtByIdClient(id: number): Observable<ApiResponse<IDeudaDetalle>> {
      return this.http.get<ApiResponse<IDeudaDetalle>>(`${this.apiUrl}/${id}`)
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

    }


    saveDeuda(deuda: IDeudaCliente): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${this.apiUrl}`, deuda)
    }

    deleteDeudaById(id: number): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`)

    }
    getDeudaById(id: number): Observable<ApiResponse<IDeudaCliente>> {
        return this.http.get<ApiResponse<IDeudaCliente>>(`${this.apiUrl}/${id}`)

    }
    updateDeuda(deuda: IDeudaCliente): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.apiUrl}`, deuda)

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

    case 'clienteNombre':
      return httpParams.set('clienteNombreLike', value);

    case 'facturaCodigo':
      return httpParams.set('facturaCodigoLike', value);

    case 'descripcion':
      return httpParams.set('descripcionLike', value);

    case 'fechaDeuda':
      return this.isValidDateFormat(value)
        ? httpParams.set('fechaDeuda', value)
        : httpParams;

    case 'valorTotal':
      return this.isValidNumber(value)
        ? httpParams.set(
            'valorTotal',
            parseFloat(value.replace(/[$,]/g, '')).toString()
          )
        : httpParams;

    case 'totalAbonado':
      return this.isValidNumber(value)
        ? httpParams.set(
            'totalAbonado',
            parseFloat(value.replace(/[$,]/g, '')).toString()
          )
        : httpParams;

    case 'saldoPendiente':
      return this.isValidNumber(value)
        ? httpParams.set(
            'saldoPendiente',
            parseFloat(value.replace(/[$,]/g, '')).toString()
          )
        : httpParams;

    case 'valorMes':
      return this.isValidNumber(value)
        ? httpParams.set(
            'valorMes',
            parseFloat(value.replace(/[$,]/g, '')).toString()
          )
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
