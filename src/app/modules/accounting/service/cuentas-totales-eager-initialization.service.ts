import { isPlatformBrowser } from "@angular/common";
import { inject, Injectable, PLATFORM_ID, signal, computed } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { catchError, of } from "rxjs";
import { AccountingService } from "./accounting.service";
import { CuentaTotal } from "@interfaces/accounting/ICuentaTotal";
import { IPaginationParams } from "@interfaces/IpaginatedResponse";

@Injectable({
  providedIn: 'root'
})
export class CuentasTotalesEagerInitializationService {
  private readonly accountingService = inject(AccountingService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Signals internos para los parámetros
  private readonly empresaId = signal<number | null>(null);
  private readonly fechaInicio = signal<string>(this.getFirstDayOfMonth());
  private readonly fechaFin = signal<string>(this.getFirstDayOfNextMonth());
  private readonly paginationParams = signal<IPaginationParams>({
    page: 0,
    size: 5
  });

  // rxResource para cargar las cuentas totales
  private cuentasTotalesResource = rxResource({
    params: () => ({
      empresaId: this.empresaId(),
      fechaInicio: this.fechaInicio(),
      fechaFin: this.fechaFin(),
      pagination: this.paginationParams()
    }),
    stream: ({ params }) => {
      const { empresaId, fechaInicio, fechaFin, pagination } = params;
      if (!empresaId) {
        return of(null);
      }
      return this.accountingService
        .getCuentasTotales(
          {
            idEmpresa: empresaId,
            fechaInicio,
            fechaFin
          },
          pagination
        )
        .pipe(
          catchError((error) => {
            console.error('Error loading cuentas totales:', error);
            return of(null);
          }),
        );
    },
  });

  // Signals públicos expuestos
  readonly cuentasTotalesData = this.cuentasTotalesResource.value;
  readonly isLoading = this.cuentasTotalesResource.isLoading;
  readonly error = this.cuentasTotalesResource.error;

  // Computed signal para transformar los datos si es necesario
  readonly transformedData = computed(() => {
    const data = this.cuentasTotalesData();
    if (!data || !data.response) {
      return null;
    }
    return data;
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
        console.error('Error loading empresa ID for cuentas totales:', e);
      }
    }
  }

  // Métodos públicos para actualizar parámetros
  setFechas(fechaInicio: string, fechaFin: string) {
    this.fechaInicio.set(fechaInicio);
    this.fechaFin.set(fechaFin);
  }

  setPagination(params: IPaginationParams) {
    this.paginationParams.set(params);
  }

  // Métodos helper para fechas
  private getFirstDayOfMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  }

  private getFirstDayOfNextMonth(): string {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;
  }
}
