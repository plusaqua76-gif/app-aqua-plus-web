import { isPlatformBrowser } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable, PLATFORM_ID, signal } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { rxResource } from "@angular/core/rxjs-interop";
import { ResponseResolutionDian } from "@interfaces/invoice/invoice.interface";
import { ApiResponse } from "@interfaces/Iresponse";
import { catchError, map, of } from "rxjs";
import { CarteraEdadesFacturas } from "@interfaces/accounting/ICarteraEdadesFacturas";
import { IndicadoresFinancieros } from "@interfaces/accounting/IResultsAccounting";



@Injectable({
  providedIn: 'root'
})
export class CalculosContablesService  {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private idEnterprice = signal<number | null>(null);
  private idYear = signal<number | null>(null);
  private idMonth = signal<number | null>(null);

  private enterpriceDianResource = rxResource({
    params: () => ({
      empresaId: this.idEnterprice(),
      anio: this.idYear(),
      mes: this.idMonth(),
    }),
    stream: ({ params }) => {
      const { empresaId, anio, mes } = params;

      if (!empresaId || !anio || !mes) return of(null);

      return this.http.get<ApiResponse<IndicadoresFinancieros>>(
        `${this.apiUrl}/factura/metricas-financieras/${empresaId}`,
        {
          params: {
            anio: anio.toString(),
            mes: mes.toString(),
          }
        }
      ).pipe(
        map(response => response.response),
        catchError(() => of(null))
      );
    }
  });

  readonly enterpriceResolutionSignal = this.enterpriceDianResource.value;
  readonly isLoading = this.enterpriceDianResource.isLoading;
  readonly error = this.enterpriceDianResource.error;

  constructor() {
    if (this.isBrowser) {
      try {
        const userDataString = sessionStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          if (userData?.empresaId) {
            this.idEnterprice.set(userData.empresaId);
          }
        }

        const currentDate = new Date();
        this.idYear.set(currentDate.getFullYear());
        this.idMonth.set(currentDate.getMonth() + 1);
      } catch (e) {
        console.error('Error loading empresa DIAN:', e);
      }
    }
  }

}
