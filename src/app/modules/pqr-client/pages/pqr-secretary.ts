import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@services/toast.service';
import { IClienteNovedad } from '@interfaces/INovelty/IClienteNovedad';
import { IUpdateNoveltyRequest } from '@interfaces/INovelty/IStatusNovelty';
import { PqrEnterprisesService } from '../services/pqr-enterprices.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of, EMPTY } from 'rxjs';

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
              <label class="block mb-2 text-sm font-medium text-gray-300">Buscar cliente</label>
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

            <!-- Filtro por Estado -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-300">Estado</label>
              <input
                type="text"
                [(ngModel)]="filtroEstado"
                (ngModelChange)="aplicarFiltros()"
                placeholder="Estado..."
                class="block w-full rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-400/40"
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
                      <span [class]="getTipoBadgeClass()">
                        {{ pqr.tipoNovedad.novedad }}
                      </span>

                      <!-- Badge de estado -->
                      <span [class]="getEstadoBadgeClass(pqr.estado.descripcion)">
                        {{ pqr.estado.descripcion }}
                      </span>

                      <!-- Badge de activo -->
                      @if (pqr.activo) {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                          Activo
                        </span>
                      } @else {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300">
                          Inactivo
                        </span>
                      }
                    </div>

                    @if (pqr.empresaClienteContador) {
                      <div class="text-sm text-gray-300">
                        <strong>Cliente:</strong>
                        {{ pqr.empresaClienteContador.cliente.nombre }}
                        {{ pqr.empresaClienteContador.cliente.segundoNombre }}
                        {{ pqr.empresaClienteContador.cliente.apellido }}
                        {{ pqr.empresaClienteContador.cliente.segundoApellido }}
                      </div>

                      <div class="text-sm text-gray-300">
                        <strong>Contador:</strong> {{ pqr.empresaClienteContador.contador.serial }}
                      </div>
                    }

                    <div class="text-sm text-gray-400">
                      <strong>Descripción:</strong> {{ pqr.descripcion }}
                    </div>

                    <div class="text-sm text-gray-400">
                      <strong>Tipo de novedad:</strong> {{ pqr.tipoNovedad.descripcion}}
                    </div>
                  </div>

                  <!-- Acciones -->
                  <div class="flex flex-col gap-2 min-w-[200px]">
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
      <div class="fixed inset-0 z-[1002] flex items-center justify-center p-2 sm:p-4 pt-16 sm:pt-20">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" (click)="cerrarModalRespuesta()"></div>

        <div class="relative w-full max-w-md max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-6rem)] flex flex-col bg-black/10 backdrop-blur-xl border-2 border-white/10 rounded-2xl sm:rounded-3xl shadow-xl" (click)="$event.stopPropagation()">

          <!-- Header fijo -->
          <div class="flex-shrink-0 relative p-4 sm:p-6 pb-2 sm:pb-4 border-b border-white/10">
            <!-- Botón de cerrar -->
            <button
              (click)="cerrarModalRespuesta()"
              aria-label="Close"
              class="absolute top-2 right-2 sm:top-3 sm:right-3 h-8 w-8 grid place-content-center text-gray-400 hover:bg-white/10 rounded-lg backdrop-blur-sm z-10"
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

            <!-- Título del modal -->
            <h3 class="text-lg sm:text-xl font-semibold text-white text-center pr-8">
              Responder PQR #{{ pqrSeleccionado()?.id }}
            </h3>

            <!-- Información del cliente -->
            @if (pqrSeleccionado()?.empresaClienteContador) {
              <div class="mt-3 text-center">
                <p class="text-xs sm:text-sm text-gray-400">
                  Cliente:
                  {{ pqrSeleccionado()!.empresaClienteContador.cliente.nombre }}
                  {{ pqrSeleccionado()!.empresaClienteContador.cliente.segundoNombre }}
                  {{ pqrSeleccionado()!.empresaClienteContador.cliente.apellido }}
                  {{ pqrSeleccionado()!.empresaClienteContador.cliente.segundoApellido }}
                </p>
              </div>
            }
          </div>

          <!-- Contenido con scroll -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 pt-2 sm:pt-4">
            <!-- Información del PQR -->
            <div class="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1 sm:gap-0">
                <span class="text-sm text-gray-300">Tipo:</span>
                <span [class]="getTipoBadgeClass()">
                  {{ pqrSeleccionado()!.tipoNovedad.novedad }}
                </span>
              </div>
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span class="text-sm text-gray-300">Estado actual:</span>
                <span [class]="getEstadoBadgeClass(pqrSeleccionado()!.estado.descripcion)">
                  {{ pqrSeleccionado()!.estado.descripcion }}
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
                  rows="4"
                  placeholder="Escriba la respuesta al PQR..."
                  class="w-full px-3 sm:px-4 py-2 bg-transparent border border-gray-600/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 resize-none text-sm"
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
                  class="w-full px-3 sm:px-4 py-2 bg-transparent border border-gray-600/70 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 text-sm"
                >
                  <option value="" class="bg-gray-900">Seleccione un estado</option>
                  @if (statusNovelty.status() === 'loading') {
                    <option value="" class="bg-gray-900">Cargando estados...</option>
                  } @else if (statusNovelty.status() === 'error') {
                    <option value="" class="bg-gray-900">Error al cargar estados</option>
                  } @else if (statusNovelty.value()?.response && statusNovelty.value()!.response.length > 0) {
                    @for (status of statusNovelty.value()!.response; track status.id) {
                      <option [value]="status.codigo" class="bg-gray-900">{{ status.descripcion }}</option>
                    }
                  } @else {
                    <option value="" class="bg-gray-900">No hay estados disponibles</option>
                  }
                </select>
              </div>

              <!-- Información adicional -->
              <div class="text-xs text-gray-400 bg-gray-900/20 p-2 rounded-lg">
                <p>• La respuesta será enviada al cliente</p>
                <p>• El estado del PQR se actualizará automáticamente</p>
              </div>
            </div>
          </div>

          <!-- Footer fijo con botones -->
          <div class="flex-shrink-0 p-4 sm:p-6 pt-2 sm:pt-4 border-t border-white/10">
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                (click)="cerrarModalRespuesta()"
                class="w-full sm:flex-1 px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-300 bg-transparent border border-gray-600/70 rounded-lg hover:bg-gray-600/10 focus:outline-none focus:ring-2 focus:ring-gray-500/40 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="actualizarPQR()"
                [disabled]="!nuevaRespuesta.trim() || !nuevoEstado"
                class="w-full sm:flex-1 px-4 py-2.5 sm:py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar Respuesta
              </button>
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
  pqrSeleccionado = signal<IClienteNovedad | null>(null);

  // Variables de filtros
  busquedaCliente: string = '';
  busquedaContador: string = '';
  filtroEstado: string = '';

  // Variables del modal de respuesta
  nuevaRespuesta: string = '';
  nuevoEstado: string = '';

  // Datos de PQRs/Novedades
  pqrs: IClienteNovedad[] = [];
  pqrsFiltrados: IClienteNovedad[] = [];

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

  statusNovelty = rxResource({
    stream: () => this.pqrService.getStatusPqrById().pipe(
      catchError(error => {
        console.error('Error loading status novelty:', error);
        this.toastService.error('Error', 'No se pudieron cargar los estados de PQR');
        return of({ success: false, response: [], message: 'Error al cargar estados' });
      })
    )
  });

  ngOnInit() {
    // Verificar que tenemos datos de usuario válidos antes de cargar PQRs
    const empresaId = this.empresaId();
    if (!empresaId) {
      console.warn('No se pudo obtener empresaId en ngOnInit');
      this.toastService.error('Error', 'Datos de sesión inválidos. Por favor, inicie sesión nuevamente.');
      return;
    }

    this.cargarPQRs();
  }

  cargarPQRs(): void {
    const empresaId = this.empresaId();

    if (!empresaId) {
      this.toastService.error('Error', 'No se pudo obtener el ID de la empresa');
      this.cargandoPQRs.set(false);
      return;
    }

    this.cargandoPQRs.set(true);

    this.pqrService.getPqrsForSecretary(empresaId).pipe(
      catchError(error => {
        this.cargandoPQRs.set(false);
        return of({ success: false, response: [], message: 'Error al cargar PQRs' });
      })
    ).subscribe({
      next: (response) => {
        if (response.success !== false) {
          this.pqrs = response.response || [];
          this.aplicarFiltros();
        } else {
          this.pqrs = [];
          this.pqrsFiltrados = [];
        }
        this.cargandoPQRs.set(false);
      },
      error: (error) => {
        console.error('Error en subscribe cargando PQRs:', error);
        this.toastService.error('Error', 'Error inesperado al cargar los PQRs');
        this.cargandoPQRs.set(false);
        this.pqrs = [];
        this.pqrsFiltrados = [];
      }
    });
  }

  actualizarLista(): void {
    const empresaId = this.empresaId();
    if (!empresaId) {
      this.toastService.error('Error', 'No se pudo obtener el ID de la empresa para actualizar');
      return;
    }

    this.cargarPQRs();
    this.toastService.success('Actualizado', 'Lista de PQRs actualizada correctamente');
  }

  aplicarFiltros(): void {
    this.pqrsFiltrados = this.pqrs.filter(pqr => {
      const cliente = pqr.empresaClienteContador?.cliente;
      const nombreCompleto = cliente ?
        `${cliente.nombre || ''} ${cliente.segundoNombre || ''} ${cliente.apellido || ''} ${cliente.segundoApellido || ''}`.trim() : '';

      const cumpleBusquedaCliente = !this.busquedaCliente ||
        nombreCompleto.toLowerCase().includes(this.busquedaCliente.toLowerCase());

      const cumpleBusquedaContador = !this.busquedaContador ||
        (pqr.empresaClienteContador?.contador.serial || '').toLowerCase().includes(this.busquedaContador.toLowerCase());

      const cumpleFiltroEstado = !this.filtroEstado ||
        pqr.estado.descripcion.toLowerCase().includes(this.filtroEstado.toLowerCase());

      return cumpleBusquedaCliente && cumpleBusquedaContador && cumpleFiltroEstado;
    });
  }

  abrirModalRespuesta(pqr: IClienteNovedad): void {
    this.pqrSeleccionado.set(pqr);
    this.mostrarModalRespuesta.set(true);
  }

  cerrarModalRespuesta(): void {
    this.mostrarModalRespuesta.set(false);
    this.pqrSeleccionado.set(null);
    this.nuevaRespuesta = '';
    this.nuevoEstado = '';
  }

  actualizarPQR(): void {
    const pqr = this.pqrSeleccionado();

    if (!pqr) {
      this.toastService.error('Error', 'No hay PQR seleccionado');
      return;
    }

    if (!this.nuevaRespuesta.trim()) {
      this.toastService.error('Error', 'La respuesta es obligatoria');
      return;
    }

    if (!this.nuevoEstado) {
      this.toastService.error('Error', 'Debe seleccionar un estado');
      return;
    }

    const updateRequest: IUpdateNoveltyRequest = {
      id: pqr.id,
      descripcion: this.nuevaRespuesta.trim(),
      estado: {
        codigo: this.nuevoEstado
      }
    };

    this.pqrService.updateNovelty(updateRequest).pipe(
      catchError(error => {
        console.error('Error updating PQR:', error);
        this.toastService.error('Error', 'No se pudo actualizar el PQR');
        return of({ success: false, response: null, message: 'Error al actualizar PQR' });
      })
    ).subscribe({
      next: (response) => {
        if (response.success !== false) {
          this.toastService.success('Éxito', 'PQR actualizado correctamente');
          this.cerrarModalRespuesta();
          this.cargarPQRs();
        }
      },
      error: (error) => {
        console.error('Error en subscribe actualizando PQR:', error);
        this.toastService.error('Error', 'Error inesperado al actualizar el PQR');
      }
    });
  }

  getTipoBadgeClass(): string {
    return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300';
  }

  getEstadoBadgeClass(estado?: string): string {
    const estadoTexto = estado || this.pqrSeleccionado()?.estado.descripcion || '';

    switch (estadoTexto.toLowerCase()) {
      case 'terminado':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300';
      case 'pendiente':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300';
      case 'en proceso':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300';
      default:
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300';
    }
  }
}
