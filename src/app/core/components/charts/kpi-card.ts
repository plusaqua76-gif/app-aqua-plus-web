import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  inject,
  OnInit,
  OnDestroy,
  computed,
  PLATFORM_ID,
} from '@angular/core';
import { ClientesKpiService } from '@services/clientes-kpi.service';
import { Subscription } from 'rxjs';
import { IClienteKPI } from '@interfaces/IClienteKPI';
import { IClienteKPIResponse } from '@interfaces/IClienteKPIResponse';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.Default,
  styles: [
    `
      .progress-bar {
        transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
        animation: progressLoad 1.5s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes progressLoad {
        0% {
          width: 0%;
          opacity: 0.5;
        }
        50% {
          opacity: 0.8;
        }
        100% {
          opacity: 1;
        }
      }

      .progress-container {
        animation: fadeIn 0.8s ease-in-out;
      }

      @keyframes fadeIn {
        0% {
          opacity: 0;
          transform: translateY(10px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .kpi-card {
        animation: slideInUp 0.6s ease-out;
      }

      @keyframes slideInUp {
        0% {
          opacity: 0;
          transform: translateY(20px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .loading-shimmer {
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(255, 255, 255, 0.1) 50%,
          transparent 100%
        );
        animation: shimmer 1.5s infinite;
      }

      @keyframes shimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
    `,
  ],
  template: `
    <div class="rounded-xl bg-slate-800 text-slate-100 p-4 shadow-sm kpi-card">
      <div class="flex items-start justify-between">
        <div class="space-y-1">
          @if (isLoading) {
          <div class="h-4 bg-slate-700 rounded animate-pulse"></div>
          <div class="h-8 bg-slate-700 rounded animate-pulse mt-2"></div>
          } @else {
          <p class="text-sm/5 text-slate-400">
            {{ kpiData?.titulo || 'Sin datos' }}
          </p>
          <div class="text-3xl font-extrabold tracking-tight">
            {{ kpiData?.valor ?? 0 | number }}
          </div>
          }
        </div>

        <div
          class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-700/60"
        >
          @if (isLoading) {
          <div class="h-4 w-4 bg-slate-600 rounded animate-pulse"></div>
          } @else { @if (kpiData?.icono === 'user-plus') {
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          } @else if (kpiData?.icono === 'check-circle') {
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          } @else if (kpiData?.icono === 'exclamation-triangle') {
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          } @else if (kpiData?.icono === 'users') {
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
          } @else {
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-gray-400"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.16 7.16 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 14.4 1h-3.8a.5.5 0 0 0-.49.41l-.36 2.54c-.58.24-1.13.55-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.62 7.97a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.74 13.6a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.31.6.22l2.39-.96c.5.39 1.05.7 1.63.94l.36 2.54c.05.24.25.41.49.41h3.8c.24 0 .45-.17.49-.41l.36-2.54c.58-.24 1.13-.55 1.63-.94l2.39.96c.21.09.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"
            />
          </svg>
          } }
        </div>
      </div>

      <!-- Descripción -->
      <div class="mt-3 flex items-center gap-2 progress-container">
        @if (isLoading) {
        <div class="h-3 bg-slate-700 rounded animate-pulse w-32"></div>
        } @else {
        <span class="text-sm text-slate-400">{{
          kpiData?.descripcion || 'información'
        }}</span>
        }
      </div>

      <!-- Progress -->
      <div class="mt-3 progress-container">
        @if (isLoading) {
        <div
          class="h-2 w-full rounded-full bg-slate-700 relative overflow-hidden"
        >
          <div class="absolute inset-0 loading-shimmer"></div>
        </div>
        } @else {
        <div class="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
          @if (kpiData?.esPositivo) {
          <div
            class="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-400 progress-bar"
            [style.width.%]="progressWidth"
          ></div>
          } @else {
          <div
            class="h-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 progress-bar"
            [style.width.%]="progressWidth"
          ></div>
          }
        </div>
        }
      </div>
    </div>
  `,
})
export class KpiCardComponent implements OnInit, OnDestroy {
  @Input() kpiId?: string;
  @Input() rangoPor: 'emision' | 'vencimiento' = 'emision';
  @Input() exclusivo: boolean = false;

  kpiData: IClienteKPI | null = null;
  isLoading = true;
  progressWidth = 0;
  private subscription?: Subscription;
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);
  private readonly clientesKpiService = inject(ClientesKpiService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadKpiData();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (e) {
      console.error('Error parsing userData from sessionStorage:', e);
      return null;
    }
  });

  readonly empresaId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  });

  readonly currentDate = computed(() => {
    if (!this.isBrowser) return new Date();
    return new Date();
  });

  readonly currentMonth = computed(() => {
    return this.currentDate().getMonth() + 1; // getMonth() retorna 0-11, necesitamos 1-12
  });

  readonly currentYear = computed(() => {
    return this.currentDate().getFullYear();
  });

  private loadKpiData(): void {
    this.isLoading = true;
    this.progressWidth = 0;
    this.cdr.detectChanges();

    const empresaId = this.empresaId();
    if (!empresaId) {
      console.error('No se encontró empresaId en sessionStorage');
      this.isLoading = false;
      return;
    }

    this.subscription = this.clientesKpiService
      .getClientesKPIDinamico({
        empresaId: empresaId,
        anio: this.currentYear(),
        mes: this.currentMonth(),
        rangoPor: this.rangoPor,
        exclusivo: this.exclusivo,
      })
      .subscribe({
        next: (response) => {
          this.kpiData = this.mapResponseToKpiData(response);
          this.isLoading = false;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.animateProgressBar();
          }, 100);
        },
        error: (error) => {
          console.error('Error al cargar datos KPI:', error);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private mapResponseToKpiData(response: IClienteKPIResponse): IClienteKPI {
    const { resumen } = response;

    switch (this.kpiId) {
      case 'clientes-nuevos':
        return {
          id: 'clientes-nuevos',
          titulo: 'Clientes Nuevos',
          valor: resumen.clientesNuevos,
          porcentajeCambio: 0,
          esPositivo: true,
          descripcion: 'este mes',
          icono: 'user-plus',
          progreso: Math.min((resumen.clientesNuevos / 25) * 100, 100),
        };

      case 'clientes-al-dia':
        return {
          id: 'clientes-al-dia',
          titulo: 'Clientes al Día',
          valor: resumen.clientesAlDia.total,
          porcentajeCambio: 0,
          esPositivo: true,
          descripcion: `${resumen.clientesAlDia.porcentaje.toFixed(
            1
          )}% del total`,
          icono: 'check-circle',
          progreso: resumen.clientesAlDia.porcentaje,
        };

      case 'clientes-mora':
        return {
          id: 'clientes-mora',
          titulo: 'Clientes en Mora',
          valor: resumen.clientesMora.total,
          porcentajeCambio: 0,
          esPositivo: false,
          descripcion: `${resumen.clientesMora.porcentaje.toFixed(
            1
          )}% del total`,
          icono: 'exclamation-triangle',
          progreso: resumen.clientesMora.porcentaje,
        };

      case 'clientes-activos':
      default:
        return {
          id: 'clientes-activos',
          titulo: 'Clientes Activos',
          valor: resumen.clientesActivos,
          porcentajeCambio: 0,
          esPositivo: true,
          descripcion: 'total registrados',
          icono: 'users',
          progreso: Math.min((resumen.clientesActivos / 200) * 100, 100),
        };
    }
  }

  private animateProgressBar(): void {
    const targetWidth = this.kpiData?.progreso || 0;
    const duration = 1500; // 1.5 segundos
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      this.progressWidth = targetWidth * easeOutQuart;
      this.cdr.detectChanges();
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  updateKpiData(): void {
    this.loadKpiData();
  }
}
