import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@services/toast.service';
import { INovedadPQR } from '@interfaces/IClienteNovedad';
import { PqrEnterprisesService } from '../services/pqr-enterprices.service';
import { PQR_CONFIG } from '../config/pqr.config';

@Component({
  selector: 'app-pqr-secretary',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="w-full bg-transparent text-gray-200">
      <div class="mx-auto max-w-7xl px-4 py-8">

        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 class="text-2xl md:text-3xl font-semibold tracking-tight">
              Gestión de PQRs - Secretaría
            </h2>
            <p class="text-gray-400 mt-1">Administra las peticiones, quejas y reclamos de los clientes</p>
          </div>

          <div class="flex gap-3">
            <button
              type="button"
              (click)="actualizarLista()"
              [disabled]="cargandoPQRs()"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-600/70 bg-transparent px-6 py-3 text-sm text-gray-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-gray-400/40 transition-colors disabled:opacity-50"
            >
              <svg [class]="cargandoPQRs() ? 'h-5 w-5 animate-spin' : 'h-5 w-5'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Actualizar
            </button>
          </div>
        </div>

        <!-- Filtros -->
        <div class="mb-6 p-4 rounded-xl border border-gray-600/70 bg-white/5">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Búsqueda por Cliente -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-300">Cliente</label>
              <input
                type="text"
                [(ngModel)]="busquedaCliente"
                (ngModelChange)="aplicarFiltros()"
                placeholder="Nombre del cliente..."
                class="block w-full rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-400/40"
              />
            </div>

            <!-- Búsqueda por Contador -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-300">Contador</label>
              <input
                type="text"
                [(ngModel)]="busquedaContador"
                (ngModelChange)="aplicarFiltros()"
                placeholder="Serial del contador..."
                class="block w-full rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-400/40"
              />
            </div>

            <!-- Filtro por Fecha -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-300">Fecha</label>
              <input
                type="date"
                [(ngModel)]="filtroFecha"
                (ngModelChange)="aplicarFiltros()"
                class="block w-full rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 text-sm text-gray-100 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-400/40"
              />
            </div>
          </div>
        </div>



        <!-- Lista de PQRs -->
        <div class="space-y-4">
          @if (cargandoPQRs()) {
            <div class="flex justify-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
            </div>
          } @else if (pqrsFiltrados.length === 0) {
            <div class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-300">No hay PQRs</h3>
              <p class="mt-1 text-sm text-gray-400">No se encontraron PQRs que coincidan con los filtros aplicados.</p>
            </div>
          } @else {
            @for (pqr of pqrsFiltrados; track pqr.id) {
              <div class="rounded-xl border border-gray-600/70 bg-white/5 p-6 hover:bg-white/10 transition-colors">
                <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                  <!-- Información principal -->
                  <div class="flex-1 space-y-3">
                    <div class="flex flex-wrap items-center gap-3">
                      <h3 class="text-lg font-semibold text-gray-100">PQR #{{ pqr.id }}</h3>

                      <!-- Badge de tipo -->
                      <span [class]="getTipoBadgeClass(pqr.tipo)">
                        {{ pqr.tipo }}
                      </span>

                      <!-- Badge de prioridad -->
                      <span [class]="getPrioridadBadgeClass(pqr.prioridad)">
                        {{ pqr.prioridad }}
                      </span>

                      <!-- Badge de estado -->
                      <span [class]="getEstadoBadgeClass(pqr.estado)">
                        {{ pqr.estado }}
                      </span>
                    </div>

                    <div class="text-sm text-gray-300">
                      <strong>Cliente:</strong> {{ pqr.cliente }} - {{ pqr.documento }}
                    </div>

                    @if (pqr.serial) {
                      <div class="text-sm text-gray-300">
                        <strong>Contador:</strong> {{ pqr.serial }}
                      </div>
                    }

                    <div class="text-sm text-gray-300">
                      <strong>Fecha:</strong> {{ pqr.fecha }}
                    </div>

                    <div class="text-sm text-gray-400">
                      <strong>Descripción:</strong> {{ pqr.descripcion }}
                    </div>

                    @if (pqr.respuesta) {
                      <div class="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div class="text-sm text-green-400 font-medium mb-1">Respuesta:</div>
                        <div class="text-sm text-gray-300">{{ pqr.respuesta }}</div>
                      </div>
                    }
                  </div>

                  <!-- Acciones -->
                  <div class="flex flex-col gap-2 min-w-[200px]">
                    @if (pqr.estado !== 'Cerrado') {
                      <button
                        type="button"
                        (click)="abrirModalRespuesta(pqr)"
                        class="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-600/70 bg-blue-600/10 px-4 py-2 text-sm text-blue-400 hover:bg-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition-colors"
                      >
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                        Responder
                      </button>
                    }

                    <button
                      type="button"
                      (click)="cambiarEstado(pqr)"
                      [disabled]="pqr.estado === 'Cerrado'"
                      class="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-600/70 bg-transparent px-4 py-2 text-sm text-gray-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-gray-400/40 transition-colors disabled:opacity-50"
                    >
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      Cambiar Estado
                    </button>
                  </div>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </section>

    <!-- Modal para responder PQR -->
    @if (mostrarModalRespuesta()) {
      <div class="fixed inset-0 z-[1002] overflow-y-auto">
        <div class="fixed inset-0 z-[1002] flex items-start justify-center bg-black/50 backdrop-blur-sm pt-[75px]" (click)="cerrarModalRespuesta()">
          <div class="relative w-full p-4 max-h-[calc(100vh-85px)] overflow-hidden max-w-md" (click)="$event.stopPropagation()">
            <div class="relative bg-black/10 backdrop-blur-xl border-2 border-white/10 rounded-3xl shadow-xl">
              <!-- Botón de cerrar -->
              <button
                (click)="cerrarModalRespuesta()"
                aria-label="Close"
                class="absolute top-3 end-2.5 h-8 w-8 grid place-content-center text-gray-400 hover:bg-white/10 rounded-lg backdrop-blur-sm"
              >
                <svg class="h-3 w-3" viewBox="0 0 14 14" fill="none">
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
              </button>

              <!-- Contenido del modal -->
              <div class="p-8 text-left">
                <!-- Título del modal -->
                <h3 class="text-xl font-semibold text-white mb-6 text-center">
                  Responder PQR #{{ pqrSeleccionado()?.id }}
                </h3>

                <!-- Información del cliente -->
                <div class="mb-4 text-center">
                  <p class="text-sm text-gray-400">
                    Cliente: {{ pqrSeleccionado()?.cliente }}
                  </p>
                </div>

                <!-- Información del PQR -->
                <div class="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-sm text-gray-300">Tipo:</span>
                    <span [class]="getTipoBadgeClass(pqrSeleccionado()?.tipo || '')">
                      {{ pqrSeleccionado()?.tipo }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-300">Estado actual:</span>
                    <span [class]="getEstadoBadgeClass(pqrSeleccionado()?.estado || '')">
                      {{ pqrSeleccionado()?.estado }}
                    </span>
                  </div>
                  @if (pqrSeleccionado()?.descripcion) {
                    <p class="text-xs text-blue-300 mt-2">{{ pqrSeleccionado()?.descripcion }}</p>
                  }
                </div>

                <div class="space-y-4">
                  <!-- Campo de respuesta -->
                  <div>
                    <label for="nuevaRespuesta" class="block text-sm font-medium text-gray-300 mb-2">
                      Nueva respuesta
                    </label>
                    <textarea
                      id="nuevaRespuesta"
                      [(ngModel)]="nuevaRespuesta"
                      rows="6"
                      placeholder="Escriba la respuesta al PQR..."
                      class="w-full px-4 py-2 bg-transparent border border-gray-600/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 resize-none"
                    ></textarea>
                  </div>

                  <!-- Campo de estado -->
                  <div>
                    <label for="nuevoEstado" class="block text-sm font-medium text-gray-300 mb-2">
                      Nuevo estado
                    </label>
                    <select
                      id="nuevoEstado"
                      [(ngModel)]="nuevoEstado"
                      class="w-full px-4 py-2 bg-transparent border border-gray-600/70 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
                    >
                      <option value="En Proceso" class="bg-gray-900">En Proceso</option>
                      <option value="Resuelto" class="bg-gray-900">Resuelto</option>
                      <option value="Cerrado" class="bg-gray-900">Cerrado</option>
                    </select>
                  </div>

                  <!-- Información adicional -->
                  <div class="text-xs text-gray-400">
                    <p>• La respuesta será enviada al cliente</p>
                    <p>• El estado del PQR se actualizará automáticamente</p>
                  </div>

                  <!-- Botones -->
                  <div class="flex gap-3 pt-4">
                    <button
                      type="button"
                      (click)="cerrarModalRespuesta()"
                      class="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-transparent border border-gray-600/70 rounded-lg hover:bg-gray-600/10 focus:outline-none focus:ring-2 focus:ring-gray-500/40 transition-colors"
                      [disabled]="guardandoRespuesta()"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      (click)="guardarRespuesta()"
                      class="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      [disabled]="!nuevaRespuesta.trim() || guardandoRespuesta()"
                    >
                      @if (guardandoRespuesta()) {
                        <span class="flex items-center justify-center gap-2">
                          <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15"/>
                          </svg>
                          Procesando...
                        </span>
                      } @else {
                        Enviar Respuesta
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class PqrSecretary implements OnInit {
  protected readonly toastService = inject(ToastService);
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);
  private readonly pqrService = inject(PqrEnterprisesService);

  // Señales para el estado del componente
  cargandoPQRs = signal(false);
  mostrarModalRespuesta = signal(false);
  pqrSeleccionado = signal<INovedadPQR | null>(null);
  guardandoRespuesta = signal(false);

  // Variables de filtros
  busquedaCliente: string = '';
  busquedaContador: string = '';
  filtroFecha: string = '';

  // Variables del modal
  nuevaRespuesta: string = '';
  nuevoEstado: 'En Proceso' | 'Resuelto' | 'Cerrado' = 'En Proceso';

  // Datos de PQRs/Novedades
  pqrs: INovedadPQR[] = [];
  pqrsFiltrados: INovedadPQR[] = [];

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

  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });

  ngOnInit() {
    this.cargarPQRs();
  }

  cargarPQRs(): void {
    this.cargandoPQRs.set(true);
    const empresaId = this.empresaId();

    if (!empresaId) {
      this.toastService.error('Error', 'No se pudo obtener el ID de la empresa');
      this.cargandoPQRs.set(false);
      return;
    }

    this.pqrService.getPqrsForSecretary(empresaId).subscribe({
      next: (pqrs) => {
        this.pqrs = pqrs;
        this.aplicarFiltros();
        this.cargandoPQRs.set(false);
      },
      error: (error) => {
        console.error('Error cargando PQRs:', error);
        this.toastService.error('Error', 'No se pudieron cargar los PQRs');
        this.cargandoPQRs.set(false);
      }
    });
  }

  actualizarLista(): void {
    this.cargarPQRs();
    this.toastService.success('Actualizado', 'Lista de PQRs actualizada correctamente');
  }

  aplicarFiltros(): void {
    this.pqrsFiltrados = this.pqrs.filter(pqr => {
      const cumpleBusquedaCliente = !this.busquedaCliente ||
        pqr.cliente.toLowerCase().includes(this.busquedaCliente.toLowerCase()) ||
        pqr.documento.includes(this.busquedaCliente);

      const cumpleBusquedaContador = !this.busquedaContador ||
        (pqr.serial?.toLowerCase().includes(this.busquedaContador.toLowerCase()) ?? false);

      const cumpleFiltroFecha = !this.filtroFecha ||
        pqr.fecha.startsWith(this.filtroFecha);

      return cumpleBusquedaCliente && cumpleBusquedaContador && cumpleFiltroFecha;
    });
  }

  /**
   * Aplicar filtros usando el servicio (para filtros más complejos)
   */
  aplicarFiltrosConServicio(): void {
    const empresaId = this.empresaId();
    if (!empresaId) return;

    const filtros = {
      cliente: this.busquedaCliente,
      fechaInicio: this.filtroFecha,
      fechaFin: this.filtroFecha
    };

    // Remover filtros vacíos
    Object.keys(filtros).forEach(key => {
      if (!filtros[key as keyof typeof filtros]) {
        delete filtros[key as keyof typeof filtros];
      }
    });

    this.cargandoPQRs.set(true);
    this.pqrService.getFilteredPqrsForSecretary(empresaId, filtros).subscribe({
      next: (pqrs) => {
        this.pqrs = pqrs;
        this.aplicarFiltros(); // Aplicar filtros locales adicionales (contador)
        this.cargandoPQRs.set(false);
      },
      error: (error) => {
        console.error('Error aplicando filtros:', error);
        this.aplicarFiltros(); // Fallback a filtros locales
        this.cargandoPQRs.set(false);
      }
    });
  }



  abrirModalRespuesta(pqr: INovedadPQR): void {
    this.pqrSeleccionado.set(pqr);
    this.nuevaRespuesta = pqr.respuesta || '';
    this.nuevoEstado = pqr.estado === 'Pendiente' ? 'En Proceso' : 'Resuelto';
    this.mostrarModalRespuesta.set(true);
  }

  cerrarModalRespuesta(): void {
    this.mostrarModalRespuesta.set(false);
    this.pqrSeleccionado.set(null);
    this.nuevaRespuesta = '';
    this.nuevoEstado = 'En Proceso';
  }

  guardarRespuesta(): void {
    if (!this.nuevaRespuesta.trim() || this.guardandoRespuesta()) {
      return;
    }

    const pqr = this.pqrSeleccionado();
    if (!pqr) return;

    const usuario = this.nombreUsuario() || 'Sistema';
    this.guardandoRespuesta.set(true);

    // Usar configuración para mapear estado a ID
    const estadoId = PQR_CONFIG.ESTADO_ID_MAPPING[this.nuevoEstado];

    if (!estadoId) {
      this.toastService.error('Error', 'Estado no válido');
      this.guardandoRespuesta.set(false);
      return;
    }

    const respuesta = {
      novedadId: pqr.id,
      respuesta: this.nuevaRespuesta,
      estadoId: estadoId,
      usuario: usuario,
      fecha: new Date()
    };

    this.pqrService.responderPqr(respuesta).subscribe({
      next: () => {
        // Actualizar el PQR en la lista local
        const index = this.pqrs.findIndex(p => p.id === pqr.id);
        if (index !== -1) {
          this.pqrs[index] = {
            ...this.pqrs[index],
            respuesta: this.nuevaRespuesta,
            estado: this.nuevoEstado
          };
        }

        this.aplicarFiltros();
        this.toastService.success('Éxito', 'Respuesta enviada correctamente');
        this.cerrarModalRespuesta();
        this.guardandoRespuesta.set(false);
      },
      error: (error) => {
        console.error('Error guardando respuesta:', error);
        this.toastService.error('Error', 'No se pudo enviar la respuesta');
        this.guardandoRespuesta.set(false);
      }
    });
  }

  cambiarEstado(pqr: INovedadPQR): void {
    const estadosDisponibles: ('Pendiente' | 'En Proceso' | 'Resuelto' | 'Cerrado')[] =
      ['Pendiente', 'En Proceso', 'Resuelto', 'Cerrado'];

    const estadoActualIndex = estadosDisponibles.indexOf(pqr.estado);
    const siguienteEstado = estadosDisponibles[estadoActualIndex + 1];

    if (siguienteEstado) {
      const usuario = this.nombreUsuario() || 'Sistema';

      const estadoId = PQR_CONFIG.ESTADO_ID_MAPPING[siguienteEstado];

      if (estadoId) {
        this.pqrService.changeEstadoPqr(pqr.id, estadoId, usuario).subscribe({
          next: () => {
            const index = this.pqrs.findIndex(p => p.id === pqr.id);
            if (index !== -1) {
              this.pqrs[index] = { ...this.pqrs[index], estado: siguienteEstado };
            }
            this.aplicarFiltros();
            this.toastService.success('Estado actualizado', `PQR #${pqr.id} cambió a ${siguienteEstado}`);
          },
          error: (error) => {
            console.error('Error actualizando estado:', error);
            this.toastService.error('Error', 'No se pudo actualizar el estado');
          }
        });
      }
    }
  }

  getTipoBadgeClass(tipo: string): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const colorClass = PQR_CONFIG.TIPO_COLORS[tipo as keyof typeof PQR_CONFIG.TIPO_COLORS] || PQR_CONFIG.TIPO_COLORS.Default;
    return `${baseClasses} ${colorClass}`;
  }

  getPrioridadBadgeClass(prioridad: string): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const colorClass = PQR_CONFIG.PRIORIDAD_COLORS[prioridad as keyof typeof PQR_CONFIG.PRIORIDAD_COLORS] || PQR_CONFIG.PRIORIDAD_COLORS.Baja;
    return `${baseClasses} ${colorClass}`;
  }

  getEstadoBadgeClass(estado: string): string {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const colorClass = PQR_CONFIG.ESTADO_COLORS[estado as keyof typeof PQR_CONFIG.ESTADO_COLORS] || PQR_CONFIG.ESTADO_COLORS.Pendiente;
    return `${baseClasses} ${colorClass}`;
  }
}
