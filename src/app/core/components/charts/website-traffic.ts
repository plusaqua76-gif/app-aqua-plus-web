import { isPlatformBrowser, CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { LecturasContadoresService, LecturasData } from '@services/lecturas-contadores.service';
import { Subscription } from 'rxjs';

// UMD global como en tus otros componentes
declare const ApexCharts: any;

type EstadoFiltro = 'completada' | 'pendiente' | 'todas';

interface RadialOptions {
  series: number[];                 // radialBar usa números (porcentajes)
  colors: string[];
  chart: {
    height: string | number;
    width: string | number;
    type: 'radialBar';
    sparkline?: { enabled: boolean }; // sparkline disponible en chart.sparkline
  };
  plotOptions: {
    radialBar: {
      track?: { background?: string };
      dataLabels?: { show: boolean };
      hollow?: { margin: number; size: string };
    };
  };
  grid: {
    show: boolean;
    strokeDashArray: number;
    padding: { left: number; right: number; top: number; bottom: number };
  };
  labels: string[];
  legend: { show: boolean; position: 'bottom' | 'top' | 'left' | 'right'; fontFamily: string };
  tooltip: {
    enabled: boolean;
    x?: { show: boolean };
    custom?: (options: any) => string;
    // Si quisieras formatear el valor, podrías usar y.formatter
    // y: { formatter?: (value: number) => string }
  };
  yaxis: {
    show: boolean;
    labels: { formatter: (value: number) => string };
  };
}

@Component({
  selector: 'app-website-traffic',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `


<div class="max-w-sm w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
  <div class="flex justify-between mb-3">
    <div class="flex items-center">
      <div class="flex justify-center items-center">
        <h5 class="text-xl font-bold leading-none text-gray-900 dark:text-white pe-1">{{ acueductoSeleccionado }}</h5>
        <svg data-popover-target="chart-info" data-popover-placement="bottom" class="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm0 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm1-5.034V12a1 1 0 0 1-2 0v-1.418a1 1 0 0 1 1.038-.999 1.436 1.436 0 0 0 1.488-1.441 1.501 1.501 0 1 0-3-.116.986.986 0 0 1-1.037.961 1 1 0 0 1-.96-1.037A3.5 3.5 0 1 1 11 11.466Z"/>
        </svg>
        <div data-popover id="chart-info" role="tooltip" class="absolute z-10 invisible inline-block text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-xs opacity-0 w-72 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
            <div class="p-3 space-y-2">
                <h3 class="font-semibold text-gray-900 dark:text-white">Lecturas de Contadores por Veredas</h3>
                <p>Muestra el progreso de lectura de contadores de agua en cada vereda del acueducto. Las veredas se clasifican como completadas (100% leídas) o pendientes.</p>
                <h3 class="font-semibold text-gray-900 dark:text-white">Estados</h3>
                <p>Azul: Veredas con todos los contadores leídos. Naranja: Veredas con contadores pendientes por leer.</p>
            </div>
            <div data-popper-arrow></div>
        </div>
      </div>
    </div>
  </div>

  <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
    <div class="grid grid-cols-2 gap-3 mb-2">
      <dl class="bg-blue-50 dark:bg-gray-600 rounded-lg flex flex-col items-center justify-center h-[78px]">
        <dt class="w-8 h-8 rounded-full bg-blue-100 dark:bg-gray-500 text-blue-600 dark:text-blue-300 text-sm font-medium flex items-center justify-center mb-1">{{ (datosLecturas?.resumen?.veredasCompletadas) || 0 }}</dt>
        <dd class="text-blue-600 dark:text-blue-300 text-sm font-medium">Completadas</dd>
      </dl>
      <dl class="bg-orange-50 dark:bg-gray-600 rounded-lg flex flex-col items-center justify-center h-[78px]">
        <dt class="w-8 h-8 rounded-full bg-orange-100 dark:bg-gray-500 text-orange-600 dark:text-orange-300 text-sm font-medium flex items-center justify-center mb-1">{{ (datosLecturas?.resumen?.veredasPendientes) || 0 }}</dt>
        <dd class="text-orange-600 dark:text-orange-300 text-sm font-medium">Pendientes</dd>
      </dl>
    </div>
    <button data-collapse-toggle="more-details" type="button" class="hover:underline text-xs text-gray-500 dark:text-gray-400 font-medium inline-flex items-center" (click)="toggleDetalles()">
      {{ mostrarDetalles ? 'Ocultar detalles' : 'Mostrar más detalles' }}
      <svg class="w-2 h-2 ms-1" [class.rotate-180]="mostrarDetalles" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
      </svg>
    </button>
    <div [class.hidden]="!mostrarDetalles" class="border-gray-200 border-t dark:border-gray-600 pt-3 mt-3 space-y-2">
      <dl class="flex items-center justify-between">
        <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal">Personas completadas:</dt>
        <dd class="bg-blue-100 text-blue-800 text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md dark:bg-blue-900 dark:text-blue-300">
          <svg class="w-2.5 h-2.5 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13V1m0 0L1 5m4-4 4 4"/>
          </svg> {{ getTotalPersonasCompletadas() }} personas
        </dd>
      </dl>
      <dl class="flex items-center justify-between">
        <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal">Personas pendientes:</dt>
        <dd class="bg-orange-100 text-orange-800 text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md dark:bg-orange-900 dark:text-orange-300">
          <svg class="w-2.5 h-2.5 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1v12m0 0L1 9m4 4 4-4"/>
          </svg> {{ getTotalPersonasPendientes() }} personas
        </dd>
      </dl>
      <dl class="flex items-center justify-between">
        <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal">Total de personas:</dt>
        <dd class="bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md dark:bg-gray-600 dark:text-gray-300">{{ getTotalPersonas() }} personas</dd>
      </dl>
      <dl class="flex items-center justify-between">
        <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal">Última actualización:</dt>
        <dd class="bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md dark:bg-gray-600 dark:text-gray-300">{{ ultimaActualizacion }}</dd>
      </dl>
    </div>
  </div>

  <!-- Radial Chart -->
  <div class="py-6" id="radial-chart"></div>

  <!-- Filtros -->
  <div class="grid grid-cols-1 items-center border-t border-gray-200 dark:border-gray-700">
    <div class="flex flex-wrap gap-4 pt-5">

      <!-- Dropdown: estado de lecturas -->
      <div class="dropdown-container relative">
        <button
          (click)="toggleDropdownEstado()"
          class="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 inline-flex items-center dark:hover:text-white"
          type="button">
          {{ estadoSeleccionado }}
          <svg class="w-2.5 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
          </svg>
        </button>
        <div [class.hidden]="!isDropdownEstadoOpen" class="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 mt-1">
          <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
            <li><button (click)="seleccionarEstado('Todas las veredas', 'todas')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Todas las veredas</button></li>
            <li><button (click)="seleccionarEstado('Solo completadas', 'completada')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Solo completadas</button></li>
            <li><button (click)="seleccionarEstado('Solo pendientes', 'pendiente')" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Solo pendientes</button></li>
          </ul>
        </div>
      </div>

      <!-- Dropdown: nombre de vereda -->
      <div class="dropdown-container-acueducto relative">
        <button
          (click)="toggleDropdownAcueducto()"
          class="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 inline-flex items-center dark:hover:text-white"
          type="button">
          {{ acueductoSeleccionado }}
          <svg class="w-2.5 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
          </svg>
        </button>
        <div [class.hidden]="!isDropdownAcueductoOpen" class="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 mt-1">
          <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
            <li *ngFor="let vereda of veredasDisponibles">
              <button (click)="seleccionarAcueducto(vereda)" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">{{ vereda }}</button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Botón de actualizar -->
      <button
        (click)="actualizarLecturas()"
        [disabled]="cargandoActualizacion"
        class="ml-2 text-sm font-medium inline-flex items-center rounded-lg text-green-600 hover:text-green-700 dark:hover:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 disabled:opacity-50">
        <svg [class.animate-spin]="cargandoActualizacion" class="w-2.5 h-2.5 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
        </svg>
        {{ cargandoActualizacion ? 'Actualizando...' : 'Actualizar' }}
      </button>

    </div>
  </div>
</div>


  `,})
export class WebsiteTraffic implements AfterViewInit, OnDestroy {

  private chart: any;
  private readonly subscription = new Subscription();
  public datosLecturas: LecturasData | null = null;

  // Propiedades para la UI
  public mostrarDetalles = false;
  public isDropdownEstadoOpen = false;
  public isDropdownAcueductoOpen = false;
  public estadoSeleccionado = 'Todas las veredas';
  public estadoFiltro: EstadoFiltro = 'todas';
  public acueductoSeleccionado = 'Salto De Bordones';
  public veredasDisponibles: string[] = [];
  public ultimaActualizacion = 'Hace 5 min';
  public cargandoActualizacion = false;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly lecturasService = inject(LecturasContadoresService);


  constructor() {
    // No inicializar en constructor para componentes standalone
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Inicializar veredas disponibles
      this.veredasDisponibles = this.lecturasService.getVeredasDisponibles(this.estadoFiltro);

      this.cargarDatosLecturas();
      // Agregar listener para cerrar dropdowns al hacer clic fuera
      document.addEventListener('click', this.cerrarDropdownsOnOutsideClick.bind(this));
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.subscription.unsubscribe();
    // Remover listener
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('click', this.cerrarDropdownsOnOutsideClick.bind(this));
    }
  }

  /**
   * Cerrar dropdowns al hacer clic fuera
   */
  private cerrarDropdownsOnOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdownEstado = target.closest('.dropdown-container');
    const dropdownAcueducto = target.closest('.dropdown-container-acueducto');

    if (!dropdownEstado) {
      this.isDropdownEstadoOpen = false;
    }
    if (!dropdownAcueducto) {
      this.isDropdownAcueductoOpen = false;
    }
  }

  private cargarDatosLecturas(): void {
    const sub = this.lecturasService.getLecturasData().subscribe({
      next: (data: LecturasData) => {
        this.datosLecturas = data;
        this.actualizarVeredasDisponibles();
        this.actualizarUltimaActualizacion();
        // Usar setTimeout para asegurar que ApexCharts esté completamente cargado
        setTimeout(() => {
          this.initRadial();
        }, 0);
      },
      error: (error: any) => {
        console.error('Error loading lecturas data:', error);
        // Fallback a datos por defecto
        this.initRadial();
      }
    });
    this.subscription.add(sub);
  }

  /**
   * Actualizar las veredas disponibles según el filtro de estado
   */
  private actualizarVeredasDisponibles(): void {
    this.veredasDisponibles = this.lecturasService.getVeredasDisponibles(this.estadoFiltro);

    // Si la vereda actualmente seleccionada no está disponible, seleccionar la primera disponible
    if (this.veredasDisponibles.length > 0 && !this.veredasDisponibles.includes(this.acueductoSeleccionado)) {
      this.acueductoSeleccionado = this.veredasDisponibles[0];
    }
  }

  /**
   * Obtener datos de la vereda seleccionada
   */
  private getVeredaSeleccionada(): any {
    if (!this.datosLecturas || !this.acueductoSeleccionado) return null;
    return this.datosLecturas.veredas.find(v => v.nombre === this.acueductoSeleccionado);
  }

  /**
   * Obtener personas completadas de la vereda seleccionada
   */
  getTotalPersonasCompletadas(): number {
    const vereda = this.getVeredaSeleccionada();
    return vereda ? vereda.personasCompletadas : 0;
  }

  /**
   * Obtener personas pendientes de la vereda seleccionada
   */
  getTotalPersonasPendientes(): number {
    const vereda = this.getVeredaSeleccionada();
    return vereda ? vereda.personasPendientes : 0;
  }

  /**
   * Obtener total de personas de la vereda seleccionada
   */
  getTotalPersonas(): number {
    const vereda = this.getVeredaSeleccionada();
    return vereda ? vereda.personasTotal : 0;
  }

  /**
   * Obtener porcentaje de completado de la vereda seleccionada
   */
  getPorcentajeCompletado(): number {
    const vereda = this.getVeredaSeleccionada();
    return vereda ? vereda.porcentajeCompletado : 0;
  }

  /**
   * Obtener número de contadores completados de la vereda seleccionada
   */
  getContadoresCompletados(): number {
    const vereda = this.getVeredaSeleccionada();
    return vereda ? vereda.contadoresLeidos : 0;
  }

  /**
   * Toggle del panel de detalles
   */
  toggleDetalles(): void {
    this.mostrarDetalles = !this.mostrarDetalles;
  }

  /**
   * Toggle del dropdown de estado
   */
  toggleDropdownEstado(): void {
    this.isDropdownEstadoOpen = !this.isDropdownEstadoOpen;
    this.isDropdownAcueductoOpen = false; // Cerrar el otro dropdown
  }

  /**
   * Toggle del dropdown de acueducto
   */
  toggleDropdownAcueducto(): void {
    this.isDropdownAcueductoOpen = !this.isDropdownAcueductoOpen;
    this.isDropdownEstadoOpen = false; // Cerrar el otro dropdown
  }

  /**
   * Seleccionar estado y filtrar datos
   */
  seleccionarEstado(label: string, estado: EstadoFiltro): void {
    this.estadoSeleccionado = label;
    this.estadoFiltro = estado;
    this.isDropdownEstadoOpen = false;

    // Actualizar veredas disponibles basado en el nuevo filtro
    this.actualizarVeredasDisponibles();

    // Filtrar los datos
    this.filtrarDatosPorEstado(estado);
  }

  /**
   * Seleccionar vereda específica
   */
  seleccionarAcueducto(vereda: string): void {
    this.acueductoSeleccionado = vereda;
    this.isDropdownAcueductoOpen = false;

    // Actualizar gráfica con datos de la nueva vereda seleccionada
    if (this.chart) {
      this.actualizarGraficoRadialParaVereda();
    }
  }

  /**
   * Actualizar lecturas manualmente
   */
  actualizarLecturas(): void {
    this.cargandoActualizacion = true;
    const sub = this.lecturasService.actualizarLecturas().subscribe({
      next: (data: LecturasData) => {
        this.datosLecturas = data;
        this.actualizarVeredasDisponibles();
        this.actualizarUltimaActualizacion();
        this.cargandoActualizacion = false;
        if (this.chart) {
          this.actualizarGraficoRadial();
        }
      },
      error: (error: any) => {
        console.error('Error updating lecturas data:', error);
        this.cargandoActualizacion = false;
      }
    });
    this.subscription.add(sub);
  }

  /**
   * Filtrar datos por estado
   */
  private filtrarDatosPorEstado(estado: EstadoFiltro): void {
    const sub = this.lecturasService.getLecturasByEstado(estado).subscribe({
      next: (data: LecturasData) => {
        this.datosLecturas = data;
        this.actualizarVeredasDisponibles();
        if (this.chart) {
          this.actualizarGraficoRadial();
        }
      },
      error: (error: any) => {
        console.error('Error filtering lecturas data:', error);
      }
    });
    this.subscription.add(sub);
  }

  /**
   * Actualizar el gráfico radial con nuevos datos
   */
  private actualizarGraficoRadial(): void {
    if (this.chart && this.datosLecturas) {
      const porcentajeCompletadas = this.datosLecturas.resumen.totalVeredas > 0 ?
        Math.round((this.datosLecturas.resumen.veredasCompletadas / this.datosLecturas.resumen.totalVeredas) * 100) : 0;
      const porcentajePendientes = 100 - porcentajeCompletadas;

      this.chart.updateSeries([porcentajeCompletadas, porcentajePendientes]);
    }
  }

  /**
   * Actualizar el gráfico radial para mostrar datos de la vereda específica
   */
  private actualizarGraficoRadialParaVereda(): void {
    if (this.chart) {
      const vereda = this.getVeredaSeleccionada();
      if (vereda) {
        const porcentajeCompletado = vereda.porcentajeCompletado;
        const porcentajePendiente = 100 - porcentajeCompletado;

        this.chart.updateSeries([porcentajeCompletado, porcentajePendiente]);
      }
    }
  }

  /**
   * Actualizar timestamp de última actualización
   */
  private actualizarUltimaActualizacion(): void {
    const ahora = new Date();
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    this.ultimaActualizacion = `${horas}:${minutos}`;
  }

  private getChartOptions(): RadialOptions {
    // Calcular porcentajes basados en la vereda seleccionada o datos generales
    const vereda = this.getVeredaSeleccionada();
    let porcentajeCompletadas: number;
    let porcentajePendientes: number;

    if (vereda) {
      // Mostrar datos específicos de la vereda seleccionada
      porcentajeCompletadas = vereda.porcentajeCompletado;
      porcentajePendientes = 100 - porcentajeCompletadas;
    } else {
      // Fallback a datos generales
      porcentajeCompletadas = this.datosLecturas && this.datosLecturas.resumen.totalVeredas > 0 ?
        Math.round((this.datosLecturas.resumen.veredasCompletadas / this.datosLecturas.resumen.totalVeredas) * 100) : 0;
      porcentajePendientes = 100 - porcentajeCompletadas;
    }

    return {
      series: [porcentajeCompletadas, porcentajePendientes],
      colors: ['#1C64F2', '#FDBA8C'], // Azul para completadas, Naranja para pendientes
      chart: {
        height: '350px',
        width: '100%',
        type: 'radialBar',
        sparkline: { enabled: true }, // oculta ejes/ruido cuando está activo
      },
      plotOptions: {
        radialBar: {
          track: { background: '#E5E7EB' }, // track configurable en radialBar options
          dataLabels: { show: false },
          hollow: { margin: 0, size: '32%' },
        },
      },
      grid: {
        show: false,
        strokeDashArray: 4,
        padding: { left: 2, right: 2, top: -23, bottom: -20 },
      },
      labels: ['Contadores Completados', 'Contadores Pendientes'],
      legend: {
        show: true,
        position: 'bottom',
        fontFamily: 'Inter, sans-serif',
      },
      tooltip: {
        enabled: true,
        x: { show: false },
        custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
          const vereda = this.getVeredaSeleccionada();
          if (vereda) {
            const isCompletados = seriesIndex === 0;
            const cantidad = isCompletados ? vereda.contadoresLeidos : vereda.contadoresPendientes;
            const porcentaje = series[seriesIndex];
            const fechaUltimaLectura = vereda.ultimaLectura;

            return `
              <div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                <div class="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  ${isCompletados ? 'Contadores Completados' : 'Contadores Pendientes'}
                </div>
                <div class="text-lg font-bold ${isCompletados ? 'text-blue-600' : 'text-orange-600'} mb-1">
                  ${cantidad} (${porcentaje}%)
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Última lectura: ${fechaUltimaLectura}
                </div>
              </div>
            `;
          }
          return '';
        }
      },
      yaxis: {
        show: false,
        labels: { formatter: (value: number) => `${value}%` },
      },
    };
  }

  private initRadial(): void {
    const el = document.getElementById('radial-chart') as HTMLElement;
    if (el && typeof ApexCharts !== 'undefined') {
      this.chart = new ApexCharts(el, this.getChartOptions());
      this.chart.render().catch((error: any) => {
        console.error('Error rendering radial chart:', error);
      });
    } else {
      console.error('ApexCharts no está cargado o falta #radial-chart');
    }
  }
}
