import { isPlatformBrowser } from "@angular/common";
import { inject, Injectable, PLATFORM_ID, signal, computed } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { catchError, of } from "rxjs";
import { AccountingService } from "./accounting.service";
import { EconomicResultData } from "@components/charts/economic-result-chart";

@Injectable({
  providedIn: 'root'
})
export class ResultadosContablesEagerInitializationService {
  private readonly accountingService = inject(AccountingService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Signals internos para los parámetros
  private readonly empresaId = signal<number | null>(null);
  private readonly año = signal<number>(new Date().getFullYear());
  private readonly mes = signal<number>(new Date().getMonth() + 1);

  // rxResource para cargar los resultados contables
  private resultadosResource = rxResource({
    params: () => ({
      empresa: this.empresaId(),
      año: this.año(),
      mes: this.mes(),
    }),
    stream: ({ params }) => {
      const { empresa, año, mes } = params;
      if (!empresa) {
        return of(null);
      }
      return this.accountingService
        .getResultadosContables({
          empresa,
          año,
          mes,
          cantidadPeriodos: 1,
        })
        .pipe(
          catchError((error) => {
            console.error('Error loading resultados contables:', error);
            return of(null);
          }),
        );
    },
  });

  // Signals públicos expuestos
  readonly resultsData = this.resultadosResource.value;
  readonly isLoading = this.resultadosResource.isLoading;
  readonly error = this.resultadosResource.error;

  // Computed signal para transformar IResultsAccounting a EconomicResultData
  readonly economicData = computed<EconomicResultData | null>(() => {
    const apiResponse = this.resultsData();

    if (!apiResponse) {
      return null;
    }

    const data = apiResponse.response;

    if (!data) {
      return null;
    }



    const transformed = {
      ingresos: data.ingresos,
      costos: data.costos,
      gastos: data.gastos,
      resultado: data.resultado,
      periodo: `${data.periodo.anio}-${String(data.periodo.mes).padStart(2, '0')}`,
      fechaInicio: data.periodo.desde,
      fechaFin: data.periodo.hasta,
    };

    return transformed;
  });

  constructor() {
    if (this.isBrowser) {
      try {
        const userDataString = sessionStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          if (userData?.empresaId) {
            this.empresaId.set(Number(userData.empresaId));
          }
        }
      } catch (e) {
        console.error('Error loading empresa ID for resultados contables:', e);
      }
    }
  }

  // Métodos públicos para actualizar parámetros si es necesario
  setFecha(año: number, mes: number) {
    this.año.set(año);
    this.mes.set(mes);
  }
}
