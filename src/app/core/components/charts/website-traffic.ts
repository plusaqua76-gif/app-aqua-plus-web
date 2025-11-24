import { isPlatformBrowser, CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, PLATFORM_ID, computed, effect } from '@angular/core';
import { LecturasContadoresService, LecturasData } from '@services/lecturas-contadores.service';
import { LocationService } from '@shared/services/location.service';
import { Subscription } from 'rxjs';

declare const ApexCharts: any;

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
  changeDetection: ChangeDetectionStrategy.Default,
  template: `


<div class="relative z-20 max-w-sm w-full shadow-sm rounded-lg bg-white/20 dark:bg-slate-800/20 backdrop-blur-2xl p-4 md:p-6">
  <div class="flex justify-between mb-3">
    <div class="flex items-center">
      <div class="flex justify-center items-center">
        <h5 class="text-xl font-bold leading-none text-gray-900 dark:text-white pe-1">Lecturas de Contadores</h5>
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

  <div class="rounded-lg  bg-white/20 dark:bg-slate-800/20 backdrop-blur-3xl p-3 border border-gray-200 dark:border-gray-600 mb-4">
    <div class="grid grid-cols-2 gap-3 mb-2">
      <dl class="bg-[#212c3c] rounded-lg flex flex-col items-center justify-center h-[78px]">
        <dt class="w-8 h-8 rounded-full bg-blue-100 dark:bg-gray-500 text-blue-600 dark:text-blue-300 text-sm font-medium flex items-center justify-center mb-1">{{ getTotalPersonasCompletadas() }}</dt>
        <dd class="text-blue-600 dark:text-blue-300 text-sm font-medium">Leídos</dd>
      </dl>
      <dl class="bg-[#212c3c]  rounded-lg flex flex-col items-center justify-center h-[78px]">
        <dt class="w-8 h-8 rounded-full bg-orange-100 dark:bg-gray-500 text-orange-600 dark:text-orange-300 text-sm font-medium flex items-center justify-center mb-1">{{ getTotalPersonasPendientes() }}</dt>
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
        <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal">Contadores leídos:</dt>
        <dd class="bg-blue-100 text-blue-800 text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md dark:bg-blue-900 dark:text-blue-300">
          <svg class="w-2.5 h-2.5 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13V1m0 0L1 5m4-4 4 4"/>
          </svg> {{ getTotalPersonasCompletadas() }} contadores
        </dd>
      </dl>
      <dl class="flex items-center justify-between">
        <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal">Contadores pendientes:</dt>
        <dd class="bg-orange-100 text-orange-800 text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md dark:bg-orange-900 dark:text-orange-300">
          <svg class="w-2.5 h-2.5 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1v12m0 0L1 9m4 4 4-4"/>
          </svg> {{ getTotalPersonasPendientes() }} contadores
        </dd>
      </dl>
      <dl class="flex items-center justify-between">
        <dt class="text-gray-500 dark:text-gray-400 text-sm font-normal">Total de contadores:</dt>
        <dd class="bg-gray-100 text-gray-800 text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md dark:bg-gray-600 dark:text-gray-300">{{ getTotalPersonas() }} contadores</dd>
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
        <div [class.hidden]="!isDropdownAcueductoOpen" class="absolute z-50 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 mt-1">
          <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
            <li *ngFor="let vereda of veredasDisponibles">
              <button (click)="seleccionarAcueducto(vereda)" class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">{{ vereda }}</button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Botón de actualizar -->
      <!-- <button
        (click)="actualizarLecturas()"
        [disabled]="cargandoActualizacion"
        class="ml-2 text-sm font-medium inline-flex items-center rounded-lg text-green-600 hover:text-green-700 dark:hover:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 disabled:opacity-50">
        <svg [class.animate-spin]="cargandoActualizacion" class="w-2.5 h-2.5 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
        </svg>
        {{ cargandoActualizacion ? 'Actualizando...' : 'Actualizar' }}
      </button> -->

    </div>
  </div>
</div>


  `,})
export class WebsiteTraffic implements AfterViewInit, OnDestroy {

  private chart: any;
  private readonly subscription = new Subscription();
  public datosLecturas: LecturasData | null = null;
  public mostrarDetalles = false;
  public isDropdownAcueductoOpen = false;
  public acueductoSeleccionado = 'Todas las veredas';
  public veredasDisponibles: string[] = [];
  public corregimientos: any[] = [];
  public corregimientoSeleccionado: any = null;
  public ultimaActualizacion = 'Hace 5 min';
  public cargandoActualizacion = false;
  public cantidad = 0;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly lecturasService = inject(LecturasContadoresService);
  private readonly locationService = inject(LocationService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly userData = computed(() => {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (e) {
      return null;
    }
  });



  readonly ciudadActualId = computed(() => {
    const data = this.userData();
    return data?.empresa?.direccion?.ciudad?.id || null;
  });

  readonly ciudadId = computed(() => this.ciudadActualId());

  readonly empresaId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  });

  readonly currentDate = computed(() => {
    if (!isPlatformBrowser(this.platformId)) return new Date();
    return new Date();
  });

  readonly currentYear = computed(() => {
    return this.currentDate().getFullYear();
  });

  readonly currentMonth = computed(() => {
    return this.currentDate().getMonth() + 1;
  });

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Usar setTimeout para asegurar que el DOM esté completamente renderizado
      setTimeout(() => {
        // Inicializar la gráfica con datos por defecto
        this.initRadial();
        // Cargar corregimientos dinámicamente (esto internamente cargará las lecturas)
        this.cargarCorregimientos();
      }, 50);
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
    const dropdownAcueducto = target.closest('.dropdown-container-acueducto');

    if (!dropdownAcueducto) {
      this.isDropdownAcueductoOpen = false;
    }
  }

  private cargarDatosLecturas(): void {
    const empresaId = this.empresaId();
    const anio = this.currentYear();
    const mes = this.currentMonth();

    // Si no tenemos datos del usuario, mostrar gráfica vacía
    if (!empresaId) {
      console.warn('No se encontró empresa ID, mostrando gráfica vacía');
      this.datosLecturas = null;
      this.cantidad = 0; // Resetear cantidad cuando no hay empresa ID
      this.initRadial();
      return;
    }

    const sub = this.lecturasService.getLecturasDinamicas(empresaId, this.ciudadId(), undefined, mes, anio).subscribe({
      next: (data: LecturasData) => {
        this.datosLecturas = data;
        this.actualizarVeredasDisponibles();
        this.actualizarUltimaActualizacion(data.resumen.ultimaActualizacion);

        // Actualizar la cantidad de personas completadas (contadoresCompletados del resumen)
        this.cantidad = data.resumen.contadoresCompletados || 0;

        // Forzar detección de cambios para actualizar la UI
        this.cdr.detectChanges();

        // Actualizar la gráfica existente o crear una nueva si no existe
        if (this.chart) {
          this.actualizarGraficoRadial();
        } else {
          setTimeout(() => {
            this.initRadial();
          }, 0);
        }
      },
      error: (error: any) => {
        this.datosLecturas = null;
        this.cantidad = 0; // Resetear cantidad en caso de error

        // Forzar detección de cambios
        this.cdr.detectChanges();

        if (this.chart) {
          this.actualizarGraficoRadial();
        } else {
          this.initRadial();
        }
      }
    });
    this.subscription.add(sub);
  }

  /**
   * Cambiar ciudad y actualizar corregimientos (uso manual desde código)
   */
  private cambiarCiudad(nuevaCiudadId: number): void {
    // Note: No podemos cambiar ciudadId directamente ya que es un computed signal
    // Este método necesitaría ser refactorizado para usar signals writable
    console.warn('cambiarCiudad: Este método necesita ser refactorizado para usar writable signals');
    // Limpiar datos anteriores
    this.datosLecturas = null;
    this.veredasDisponibles = [];
    this.corregimientoSeleccionado = null; // Limpiar corregimiento seleccionado
    this.acueductoSeleccionado = 'Cargando...';
    // Cargar nuevos corregimientos y datos
    this.cargarCorregimientos();
  }

  /**
   * Cargar corregimientos dinámicamente desde el API
   */
  private cargarCorregimientos(): void {
    const sub = this.locationService.getCorregimientos(this.ciudadId()).subscribe({
      next: (response) => {
        if (response.response && response.response.length > 0) {
          this.corregimientos = response.response;
          // Actualizar veredas disponibles con los nombres de los corregimientos
          this.veredasDisponibles = this.corregimientos.map(corr => corr.nombre);

          // Si hay veredas disponibles, seleccionar la primera como default
          if (this.veredasDisponibles.length > 0) {
            this.acueductoSeleccionado = this.veredasDisponibles[0];
            // También establecer el corregimiento seleccionado por defecto
            this.corregimientoSeleccionado = this.corregimientos[0];
          }

          // Forzar detección de cambios
          this.cdr.detectChanges();

          // Una vez cargados los corregimientos, cargar las lecturas dinámicas
          this.cargarDatosLecturas();
        } else {
          // Si no hay corregimientos, mostrar gráfica vacía
          console.warn('No se encontraron corregimientos');
          this.veredasDisponibles = [];
          this.datosLecturas = null;

          // Forzar detección de cambios
          this.cdr.detectChanges();

          if (this.chart) {
            this.actualizarGraficoRadial();
          }
        }
      },
      error: (error) => {
        this.veredasDisponibles = [];
        this.datosLecturas = null;

        // Forzar detección de cambios
        this.cdr.detectChanges();

        if (this.chart) {
          this.actualizarGraficoRadial();
        }
      }
    });
    this.subscription.add(sub);
  }

  /**
   * Actualizar las veredas disponibles según el filtro de estado
   */
  private actualizarVeredasDisponibles(): void {
    // Si tenemos corregimientos dinámicos, usarlos; sino, dejar vacío
    if (this.corregimientos && this.corregimientos.length > 0) {
      this.veredasDisponibles = this.corregimientos.map(corr => corr.nombre);
    } else {
      this.veredasDisponibles = [];
    }

    // Si la vereda actualmente seleccionada no está disponible, seleccionar la primera disponible
    if (this.veredasDisponibles.length > 0 && !this.veredasDisponibles.includes(this.acueductoSeleccionado)) {
      this.acueductoSeleccionado = this.veredasDisponibles[0];
    } else if (this.veredasDisponibles.length === 0) {
      this.acueductoSeleccionado = 'Sin datos';
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
   * Obtener personas completadas (contadores completados)
   */
  getTotalPersonasCompletadas(): number {
    return this.datosLecturas?.resumen?.contadoresCompletados || 0;
  }

  /**
   * Obtener personas pendientes (contadores pendientes)
   */
  getTotalPersonasPendientes(): number {
    return this.datosLecturas?.resumen?.contadoresPendientes || 0;
  }

  /**
   * Obtener total de personas (total de contadores)
   */
  getTotalPersonas(): number {
    return this.datosLecturas?.resumen?.totalContadores || 0;
  }

  /**
   * Obtener veredas completadas del resumen
   */
  getVeredasCompletadas(): number {
    return this.datosLecturas?.resumen?.veredasCompletadas || 0;
  }

  /**
   * Obtener veredas pendientes del resumen
   */
  getVeredasPendientes(): number {
    return this.datosLecturas?.resumen?.veredasPendientes || 0;
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
   * Toggle del dropdown de acueducto
   */
  toggleDropdownAcueducto(): void {
    this.isDropdownAcueductoOpen = !this.isDropdownAcueductoOpen;
  }

  /**
   * Seleccionar vereda específica
   */
  seleccionarAcueducto(vereda: string): void {
    this.acueductoSeleccionado = vereda;
    this.isDropdownAcueductoOpen = false;

    // Buscar el corregimiento seleccionado y guardarlo
    this.corregimientoSeleccionado = this.corregimientos.find(corr => corr.nombre === vereda);

    if (this.corregimientoSeleccionado) {
      // Cargar datos específicos del corregimiento seleccionado
      this.cargarDatosParaCorregimiento(this.corregimientoSeleccionado);
    } else if (this.chart) {
      // Actualizar gráfica con datos de la nueva vereda seleccionada (datos existentes)
      this.actualizarGraficoRadialParaVereda();
    }
  }

  /**
   * Cargar datos específicos para un corregimiento
   * Ahora envía el ID del corregimiento seleccionado al endpoint
   */
  private cargarDatosParaCorregimiento(corregimiento: any): void {
    const empresaId = this.empresaId();
    const anio = this.currentYear();
    const mes = this.currentMonth();

    if (!empresaId) {
      console.warn('No se encontró empresa ID');
      return;
    }

    // Usar el ID del corregimiento seleccionado
    const corregimientoId = corregimiento.id;
    const sub = this.lecturasService.getLecturasDinamicas(
      empresaId,
      this.ciudadId(),
      corregimientoId, // Ahora enviamos el ID del corregimiento
      mes,
      anio
    ).subscribe({
      next: (data: LecturasData) => {
        this.datosLecturas = data;
        this.actualizarUltimaActualizacion(data.resumen.ultimaActualizacion);

        // Actualizar la cantidad de personas completadas para el corregimiento específico
        this.cantidad = data.resumen.contadoresCompletados || 0;

        // Forzar detección de cambios
        this.cdr.detectChanges();

        if (this.chart) {
          this.actualizarGraficoRadial();
        }
      },
      error: (error: any) => {
        this.cantidad = 0;
        if (this.chart) {
          this.actualizarGraficoRadialParaVereda();
        }
      }
    });
    this.subscription.add(sub);
  }

  /**
   * Actualizar lecturas manualmente
   */
  actualizarLecturas(): void {
    this.cargandoActualizacion = true;

    const empresaId = this.empresaId();
    const anio = this.currentYear();
    const mes = this.currentMonth();

    if (!empresaId) {
      // Si no hay empresa ID, no podemos actualizar
      console.warn('No se puede actualizar: falta empresa ID');
      this.cargandoActualizacion = false;
      return;
    }

    // Usar API dinámica para actualizar manteniendo el filtro de corregimiento
    const corregimientoId = this.corregimientoSeleccionado ? this.corregimientoSeleccionado.id : undefined;

    const sub = this.lecturasService.getLecturasDinamicas(
      empresaId,
      this.ciudadId(),
      corregimientoId, // Mantener el filtro de corregimiento seleccionado
      mes,
      anio
    ).subscribe({
      next: (data: LecturasData) => {
        this.datosLecturas = data;
        this.actualizarVeredasDisponibles();
        this.actualizarUltimaActualizacion(data.resumen.ultimaActualizacion);
        this.cargandoActualizacion = false;

        // Actualizar la cantidad de personas completadas
        this.cantidad = data.resumen.contadoresCompletados || 0;

        // Forzar detección de cambios
        this.cdr.detectChanges();

        if (this.chart) {
          this.actualizarGraficoRadial();
        }
      },
      error: (error: any) => {
        this.cargandoActualizacion = false;
        // No mostrar datos mock en caso de error
        this.datosLecturas = null;
        this.cantidad = 0; // Resetear cantidad en caso de error

        // Forzar detección de cambios
        this.cdr.detectChanges();

        if (this.chart) {
          this.actualizarGraficoRadial();
        }
      }
    });
    this.subscription.add(sub);
  }



  /**
   * Actualizar el gráfico radial con nuevos datos
   */
  private actualizarGraficoRadial(): void {
    if (this.chart && this.datosLecturas) {
      const total = this.datosLecturas.resumen.totalContadores;
      const completados = this.datosLecturas.resumen.contadoresCompletados;

      const porcentajeCompletadas = total > 0 ?
        Math.round((completados / total) * 100) : 0;
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
   * Actualizar timestamp de última actualización desde la respuesta del API
   */
  private actualizarUltimaActualizacion(fechaApi?: string): void {
    if (fechaApi) {
      // Usar la fecha del API si está disponible
      const fecha = new Date(fechaApi);
      this.ultimaActualizacion = this.formatearFechaHora(fecha);
    } else {
      // Fallback a fecha actual
      const ahora = new Date();
      this.ultimaActualizacion = this.formatearFechaHora(ahora);
    }
  }

  /**
   * Formatear fecha y hora en formato 12 horas (AM/PM)
   */
  private formatearFechaHora(fecha: Date): string {
    const opciones: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Bogota'
    };

    return fecha.toLocaleString('es-CO', opciones);
  }

  private getChartOptions(): RadialOptions {
    // Calcular porcentajes basados en la nueva estructura de datos
    let porcentajeCompletadas: number;
    let porcentajePendientes: number;

    if (this.datosLecturas?.resumen?.totalContadores && this.datosLecturas.resumen.totalContadores > 0) {
      // Calcular porcentajes basados en contadores completados vs pendientes
      const contadoresCompletados = this.datosLecturas.resumen.contadoresCompletados || 0;
      const total = this.datosLecturas.resumen.totalContadores;

      porcentajeCompletadas = Math.round((contadoresCompletados / total) * 100);
      porcentajePendientes = 100 - porcentajeCompletadas;
    } else {
      // Datos por defecto cuando no hay información
      porcentajeCompletadas = 0;
      porcentajePendientes = 0;
    }

    return {
      series: [porcentajeCompletadas, porcentajePendientes],
      colors: ['#10b94e', '#ff683b'], // Azul para completadas, Naranja para pendientes
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
          let cantidad: number;
          let fechaUltimaLectura: string;

          if (vereda) {
            const isCompletados = seriesIndex === 0;
            cantidad = isCompletados ? vereda.contadoresLeidos : vereda.contadoresPendientes;
            fechaUltimaLectura = vereda.ultimaLectura;
          } else if (this.datosLecturas) {
            // Mostrar datos generales si no hay vereda seleccionada pero hay datos
            const isCompletados = seriesIndex === 0;
            cantidad = isCompletados ? this.datosLecturas.resumen.contadoresCompletados : this.datosLecturas.resumen.contadoresPendientes;
            fechaUltimaLectura = this.datosLecturas.resumen.ultimaActualizacion || 'Sin datos';
          } else {
            // Sin datos - mostrar 0
            cantidad = 0;
            fechaUltimaLectura = 'Sin datos';
          }

          const isCompletados = seriesIndex === 0;
          const porcentaje = series[seriesIndex] || 0;

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
      },
      yaxis: {
        show: false,
        labels: { formatter: (value: number) => `${value}%` },
      },
    };
  }

  private waitForApexCharts(): Promise<void> {
    return new Promise((resolve) => {
      const checkApexCharts = () => {
        if ((globalThis as any).ApexCharts === undefined) {
          setTimeout(checkApexCharts, 100);
        } else {
          resolve();
        }
      };
      checkApexCharts();
    });
  }

  /**
   * Obtener la cantidad de personas completadas (contadores leídos)
   */
  getCantidad(): number {
    return this.cantidad;
  }

  private async initRadial(): Promise<void> {
    const el = document.getElementById('radial-chart') as HTMLElement;

    if (!el) {
      setTimeout(() => {
        this.initRadial();
      }, 100);
      return;
    }

    try {
      // Esperar a que ApexCharts esté disponible
      await this.waitForApexCharts();
      const ApexChartsLib = (globalThis as any).ApexCharts;

      // Si ya existe un chart, destruirlo antes de crear uno nuevo
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }

      const chartOptions = this.getChartOptions();

      this.chart = new ApexChartsLib(el, chartOptions);

      await this.chart.render();

    } catch (error) {
      setTimeout(() => {
        this.initRadial();
      }, 1000);
    }
  }
}
