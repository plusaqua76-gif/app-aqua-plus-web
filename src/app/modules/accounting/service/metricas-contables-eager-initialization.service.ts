import { isPlatformBrowser } from "@angular/common";
import { inject, Injectable, PLATFORM_ID, signal, computed } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { catchError, of } from "rxjs";
import { AccountingService } from "./accounting.service";
import { TrendDirection } from "@components/charts/trend-sparkline";

@Injectable({
  providedIn: 'root'
})
export class MetricasContablesEagerInitializationService {
  private readonly accountingService = inject(AccountingService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Signals internos para los parámetros
  private readonly empresaId = signal<number | null>(null);
  private readonly año = signal<number>(new Date().getFullYear());
  private readonly mes = signal<number>(new Date().getMonth() + 1);
  private readonly cantidadPeriodos = signal<number>(6);

  // rxResource para cargar las métricas
  private metricasResource = rxResource({
    params: () => ({
      empresa: this.empresaId(),
      año: this.año(),
      mes: this.mes(),
      cantidadPeriodos: this.cantidadPeriodos(),
    }),
    stream: ({ params }) => {
      const { empresa, año, mes, cantidadPeriodos } = params;
      if (!empresa) {
        return of(null);
      }
      return this.accountingService
        .getMetricasContables({
          empresa,
          año,
          mes,
          cantidadPeriodos,
        })
        .pipe(
          catchError((error) => {
            console.error('Error loading métricas contables:', error);
            return of(null);
          }),
        );
    },
  });

  // Signals públicos expuestos
  readonly metricsData = this.metricasResource.value;
  readonly isLoading = this.metricasResource.isLoading;
  readonly error = this.metricasResource.error;

  // Computed signals para acceder a cada métrica con type safety
  readonly activosData = computed(() => {
    const data = this.metricsData()?.response?.activosData;
    if (data) {
      return {
        ...data,
        tendencia: data.tendencia as TrendDirection,
      };
    }
    return null;
  });

  readonly pasivosData = computed(() => {
    const data = this.metricsData()?.response?.pasivosData;
    if (data) {
      return {
        ...data,
        tendencia: data.tendencia as TrendDirection,
      };
    }
    return null;
  });

  readonly carteraData = computed(() => {
    const data = this.metricsData()?.response?.carteraData;
    if (data) {
      return {
        ...data,
        tendencia: data.tendencia as TrendDirection,
      };
    }
    return null;
  });

  readonly patrimonioData = computed(() => {
    const data = this.metricsData()?.response?.patrimonioData;
    if (data) {
      return {
        ...data,
        tendencia: data.tendencia as TrendDirection,
      };
    }
    return null;
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
        console.error('Error loading empresa ID for métricas contables:', e);
      }
    }
  }

  // Métodos públicos para actualizar parámetros si es necesario
  setFecha(año: number, mes: number) {
    this.año.set(año);
    this.mes.set(mes);
  }

  setCantidadPeriodos(cantidad: number) {
    this.cantidadPeriodos.set(cantidad);
  }
}
