import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { RateTypeService } from '../services/rate-type.service';
import { PopupComponent } from '../../../shared/components/popUp';
import { RateTypesListComponent } from '../components/rate-types-list.component';
import { IrateTypes } from '@interfaces/IrateTypes';
import { ToastService } from '@services/toast.service';

// Interfaces
interface TipoConcept {
  id: number;
  nombre: string;
  tipoTarifaId: number;
}

interface TipoTarifa {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface NuevoTipoTarifa {
  nombre: string;
  descripcion: string;
}

interface Estrato {
  id: number;
  numero: number;
  valor: number;
}

interface TarifaItem {
  id: number;
  tipoTarifa: string;
  tipoConcepto: string;
  valor: number;
  estratos: Estrato[];
}

@Component({
  selector: 'app-fee',
  imports: [CommonModule, FormsModule, PopupComponent, RateTypesListComponent],
  styles: [`
    .form-group {
      position: relative;
      margin-bottom: 20px;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 12px 50px 12px 45px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      color: #ffffff;
      font-size: 14px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .form-group input::placeholder,
    .form-group textarea::placeholder {
      color: #ada5b4;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #0062ff;
      background: rgba(255, 255, 255, 0.15);
    }

    .form-group .icon {
      position: absolute;
      left: 16px;
      top: 73%;
      transform: translateY(-50%);
      color: #ada5b4;
      font-size: 16px;
      z-index: 10;
    }

    .form-group.textarea-group .icon {
      position: absolute;
      left: 16px;
      top: 47%;
      transform: translateY(-50%);
      color: #ada5b4;
      font-size: 16px;
      z-index: 10;
    }
    .form-group input {
      height: 48px;
      line-height: 24px;
    }

    .form-group textarea {
      min-height: 88px;
      padding-top: 16px;
      line-height: 20px;
    }
  `],
  template: `

<section class="w-full bg-transparent text-gray-200">
  <div class="mx-auto max-w-7xl px-4 py-8">
    <h2 class="text-2xl md:text-3xl font-semibold tracking-tight mb-8">
      Configuracion de tarifas
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-start">
      <div class="space-y-6">
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-300">Tipo de tarifa</label>
          <div class="flex gap-3">
            <div class="relative flex-1">
              <select
                [(ngModel)]="selectedTipoTarifa"
                class="block w-full appearance-none rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 pr-10 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-400/40">
                <option [value]="null" class="bg-gray-900">Seleccione una tarifa</option>
                @for (tarifa of typeRatesData(); track tarifa.id) {
                  <option [value]="tarifa.id" class="bg-gray-900">{{ tarifa.nombre }}</option>
                }
              </select>
            </div>

            <button type="button"
              (click)="abrirPopupTipoTarifa()"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 text-sm text-gray-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-gray-400/40">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" />
              </svg>
            </button>

            <button type="button"
              (click)="abrirPopupVisualizarTarifas()"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 text-sm text-gray-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-gray-400/40"
              title="Visualizar tipos de tarifa">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Tipo concepto -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-300">Tipo concepto</label>
          <div class="flex gap-3">
            <div class="relative flex-1">
              <select
                [(ngModel)]="selectedTipoConcepto"
                class="block w-full appearance-none rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 pr-10 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-400/40">
                <option [value]="null" class="bg-gray-900">Seleccione un concepto</option>
                @for (concepto of tiposConcepto; track concepto.id) {
                  <option [value]="concepto.id" class="bg-gray-900">{{ concepto.nombre }}</option>
                }
              </select>
              <!-- <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg class="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.107l3.71-3.877a.75.75 0 111.08 1.04l-4.24 4.43a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                    clip-rule="evenodd" />
                </svg>
              </span> -->
            </div>

            <button type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 text-sm text-gray-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-gray-400/40">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" />
              </svg>
              Agregar Concepto
            </button>
          </div>
        </div>

        <!-- Valor tarifa concepto -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-300">Valor tarifa concepto</label>
          <input
            type="number"
            [(ngModel)]="valorTarifa"
            placeholder="0"
            class="block w-full rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-400/40" />
        </div>

        <!-- Agregar estrato + botón Agregar -->
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            (click)="toggleTablaEstratos()"
            class="inline-flex items-center gap-2 rounded-xl border border-gray-600/70 bg-transparent px-5 py-3 text-sm text-gray-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-gray-400/40">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" />
            </svg>
            {{ mostrarTablaEstratos ? 'Ocultar estratos' : 'Agregar estrato' }}
          </button>

          <button
            type="button"
            (click)="agregarTarifa()"
            [disabled]="!canAddTarifa()"
            class="inline-flex items-center justify-center rounded-xl border border-gray-600/70 bg-transparent px-5 py-3 text-sm font-medium text-gray-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-gray-400/40 disabled:opacity-50 disabled:cursor-not-allowed">
            Agregar
          </button>
        </div>

        <!-- Tabla Estratos Editable -->
        @if (mostrarTablaEstratos) {
          <div class="space-y-4">
            <!-- Agregar nuevo estrato -->
            <div class="rounded-xl border border-gray-600/70 bg-transparent p-4">
              <h4 class="text-sm font-medium text-gray-300 mb-3">Agregar nuevo estrato</h4>
              <div class="flex gap-3">
                <div class="flex-1">
                  <label class="block mb-1 text-xs text-gray-400">Número de estrato</label>
                  <input
                    type="number"
                    [(ngModel)]="nuevoEstratoNumero"
                    min="1"
                    class="block w-full rounded-lg border border-gray-600/70 bg-transparent px-3 py-2 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-400/40" />
                </div>
                <div class="flex-1">
                  <label class="block mb-1 text-xs text-gray-400">Valor</label>
                  <input
                    type="number"
                    [(ngModel)]="nuevoEstratoValor"
                    min="0"
                    placeholder="0"
                    class="block w-full rounded-lg border border-gray-600/70 bg-transparent px-3 py-2 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-400/40" />
                </div>
                <div class="flex items-end">
                  <button
                    type="button"
                    (click)="agregarNuevoEstrato()"
                    [disabled]="!nuevoEstratoValor || nuevoEstratoValor <= 0"
                    class="inline-flex items-center justify-center rounded-lg border border-gray-600/70 bg-transparent px-3 py-2 text-sm text-gray-200 hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-gray-400/40 disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Tabla de estratos -->
            <div class="overflow-hidden rounded-xl border border-gray-600/70">
              <table class="min-w-full divide-y divide-gray-600/70">
                <thead>
                  <tr>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-200">Estrato</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-200">Valor</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-200">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-600/70">
                  @if (estratosActuales.length === 0) {
                    <tr>
                      <td colspan="3" class="px-6 py-4 text-sm text-gray-400 text-center">No hay estratos configurados</td>
                    </tr>
                  } @else {
                    @for (estrato of estratosActuales; track estrato.id) {
                      <tr>
                        <td class="px-6 py-4 text-sm">{{ estrato.numero }}</td>
                        <td class="px-6 py-4 text-sm">
                          <input
                            type="number"
                            [value]="estrato.valor"
                            (input)="actualizarEstratoValor(estrato.id, +$any($event.target).value)"
                            min="0"
                            class="block w-full rounded border border-gray-600/70 bg-transparent px-2 py-1 text-sm text-gray-100 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-400/40" />
                        </td>
                        <td class="px-6 py-4 text-sm">
                          <button
                            type="button"
                            (click)="eliminarEstrato(estrato.id)"
                            class="inline-flex items-center justify-center rounded border border-red-600/70 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 focus:outline-none focus:ring-1 focus:ring-red-500/40">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>

      <div class="hidden md:block">
        <div class="w-px h-full bg-gray-400/50 mx-auto rounded"></div>
      </div>
      <div class="flex flex-col gap-8">
        @if (tarifasAgregadas.length === 0) {
          <div class="rounded-xl border border-gray-600/70 bg-transparent p-8 text-center">
            <p class="text-gray-400">No hay tarifas agregadas</p>
          </div>
        } @else {
          @for (tarifa of tarifasAgregadas; track tarifa.id) {
            <div class="rounded-xl border border-gray-600/70 bg-transparent p-5">
              <div class="grid grid-cols-12 items-center gap-4">
                <div class="col-span-12 grid grid-cols-12 text-xs text-gray-400">
                  <span class="col-span-3">Tipo de tarifa</span>
                  <span class="col-span-3">Tipo concepto</span>
                  <span class="col-span-3">Valor tarifa concepto</span>
                  <span class="col-span-1">Estratos</span>
                  <span class="col-span-2"></span>
                </div>
                <div class="col-span-12 grid grid-cols-12 items-center">
                  <div class="col-span-3">
                    <span class="text-lg font-semibold">{{ tarifa.tipoTarifa }}</span>
                  </div>
                  <div class="col-span-3">
                    <span class="text-lg font-semibold">{{ tarifa.tipoConcepto }}</span>
                  </div>
                  <div class="col-span-3">
                    <span class="text-lg font-bold">$ {{ tarifa.valor | number:'1.0-0' }}</span>
                  </div>
                  <div class="col-span-1">
                    <span class="text-sm text-gray-300">{{ tarifa.estratos.length }}</span>
                  </div>
                  <div class="col-span-2 flex justify-end">
                    <button
                      type="button"
                      (click)="eliminarTarifa(tarifa.id)"
                      class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-600/70 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                      aria-label="Eliminar">
                      <svg class="h-4 w-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a2 2 0 012-2h4a2 2 0 012 2m-8 0H5" />
                      </svg>
                    </button>
                  </div>
                </div>
                @if (tarifa.estratos && tarifa.estratos.length > 0) {
                  <div class="col-span-12 mt-4 pt-4 border-t border-gray-600/50">
                    <div class="mb-2">
                      <span class="text-xs text-gray-400">Estratos configurados:</span>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      @for (estrato of tarifa.estratos; track estrato.id) {
                        <div class="flex items-center justify-between rounded border border-gray-600/50 px-2 py-1 text-xs">
                          <span class="text-gray-300">Estrato {{ estrato.numero }}</span>
                          <span class="font-medium text-gray-200">$ {{ estrato.valor | number:'1.0-0' }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        }

        <!-- Botón Guardar -->
        <div class="mt-auto">
          <div class="flex md:justify-end">
            <button
              type="button"
              (click)="guardarTarifas()"
              [disabled]="tarifasAgregadas.length === 0"
              class="inline-flex w-full md:w-auto items-center justify-center rounded-2xl border border-gray-600/70 bg-transparent px-8 py-3 text-sm font-medium text-gray-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-gray-400/40 disabled:opacity-50 disabled:cursor-not-allowed">
              Guardar ({{ tarifasAgregadas.length }})
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Popup para visualizar tipos de tarifa -->
  <app-pop-up
    [open]="showPopupVisualizarTarifas"
    title="Tipos de Tarifa"
    [isConfirmation]="false">
    <div class="space-y-4">
      <div class="max-h-96 overflow-y-auto">
        <app-rate-types-list
          [rateTypes]="typeRatesData()"
          (edit)="onEditRateType($event)"
          (delete)="onDeleteRateType($event)">
        </app-rate-types-list>
      </div>

      <div class="flex justify-end pt-4 border-t border-gray-600/50">
        <button
          type="button"
          (click)="cerrarPopupVisualizarTarifas()"
          class="px-6 py-3 text-sm font-medium text-gray-300 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all duration-300">
          Cerrar
        </button>
      </div>
    </div>
  </app-pop-up>

  <!-- Popup para agregar/editar tipo de tarifa -->
  <app-pop-up
    [open]="showPopupTipoTarifa"
    [title]="editandoTipoTarifa() ? 'Editar Tipo de Tarifa' : 'Agregar Nuevo Tipo de Tarifa'"
    [isConfirmation]="false">
    <div class="space-y-6">
      <!-- Campo Nombre -->
      <div class="form-group">
        <label class="block mb-3 text-sm font-medium text-gray-300">
          Nombre
        </label>
        <i class="fa fa-tag icon"></i>
        <input
          type="text"
          [(ngModel)]="nuevoTipoTarifa.nombre"
          placeholder="Ingrese el nombre"
          autocomplete="off"
          required />
      </div>

      <div class="form-group textarea-group">
        <label class="block mb-3 text-sm font-medium text-gray-300">
          Descripción
        </label>
        <i class="fa fa-align-left icon"></i>
        <textarea
          [(ngModel)]="nuevoTipoTarifa.descripcion"
          placeholder="Descripción opcional del tipo de tarifa"
          rows="3"></textarea>
      </div>

      <div class="flex justify-end gap-3 pt-4">
        <button
          type="button"
          (click)="cerrarPopupTipoTarifa()"
          class="px-6 py-3 text-sm font-medium text-gray-300 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all duration-300">
          Cancelar
        </button>
        <button
          type="button"
          (click)="guardarNuevoTipoTarifa()"
          [disabled]="!nuevoTipoTarifa.nombre.trim() || guardandoTipoTarifa()"
          class="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-px active:translate-y-0">
          @if (guardandoTipoTarifa()) {
            <i class="fa fa-spinner fa-spin mr-2"></i>
            {{ editandoTipoTarifa() ? 'Actualizando...' : 'Guardando...' }}
          } @else {
            {{ editandoTipoTarifa() ? 'Actualizar' : 'Guardar' }}
          }
        </button>
      </div>
    </div>
  </app-pop-up>



    <!-- Popup de confirmación para eliminar tipo de tarifa -->
    <app-pop-up
      [open]="showDeleteConfirm"
      [isConfirmation]="true"
      title="Eliminar Tipo de Tarifa"
      [message]="getDeleteConfirmMessage()"
      confirmText="Eliminar"
      cancelText="Cancelar"
      (confirmAction)="confirmDeleteRateType()"
      (cancelAction)="cancelDeleteRateType()">
    </app-pop-up>
</section>




  `,
})
export class FeeComponent {

  private readonly rateTypeService = inject(RateTypeService);
    protected readonly toastService = inject(ToastService);
    readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  // Propiedades del popup para agregar/editar tipo de tarifa
  showPopupTipoTarifa = signal(false);
  guardandoTipoTarifa = signal(false);
  editandoTipoTarifa = signal(false);
  rateTypeToEdit: IrateTypes | null = null;
  nuevoTipoTarifa: NuevoTipoTarifa = {
    nombre: '',
    descripcion: ''
  };

  // Propiedades del popup para visualizar tipos de tarifa
  showPopupVisualizarTarifas = signal(false);

  // Propiedades del popup de confirmación para eliminar tipo de tarifa
  showDeleteConfirm = signal(false);
  rateTypeToDelete: IrateTypes | null = null;

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

  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });

    typeRates = rxResource({
    stream: () => this.rateTypeService.getRateTypes()
  })
  typeRatesData = computed(() => this.typeRates.value()?.response ?? []);


  selectedTipoTarifa: any = null;
  selectedTipoConcepto: any = null;
  valorTarifa: number | null = null;

  mostrarTablaEstratos: boolean = false;
  estratosActuales: Estrato[] = [];
  nuevoEstratoNumero: number = 1;
  nuevoEstratoValor: number | null = null;

  tarifasAgregadas: TarifaItem[] = [];

  // Mock data para tipos de concepto (simplificados)
  tiposConcepto: TipoConcept[] = [
    { id: 1, nombre: 'Calles', tipoTarifaId: 1 },
    { id: 2, nombre: 'Parques', tipoTarifaId: 1 },
    { id: 3, nombre: 'Plazas', tipoTarifaId: 1 },
    { id: 4, nombre: 'Mercados', tipoTarifaId: 1 },
    { id: 5, nombre: 'Vías principales', tipoTarifaId: 2 },
    { id: 6, nombre: 'Vías secundarias', tipoTarifaId: 2 },
    { id: 7, nombre: 'Zonas deportivas', tipoTarifaId: 2 },
    { id: 8, nombre: 'Consumo básico', tipoTarifaId: 3 },
    { id: 9, nombre: 'Consumo complementario', tipoTarifaId: 3 },
    { id: 10, nombre: 'Residencial', tipoTarifaId: 4 },
    { id: 11, nombre: 'Comercial', tipoTarifaId: 4 },
    { id: 12, nombre: 'Industrial', tipoTarifaId: 4 }
  ];

  // Contador para IDs únicos
  private nextId = 1;

  // Verificar si se puede agregar una tarifa
  canAddTarifa(): boolean {
    const canAdd = !!(
      this.selectedTipoTarifa &&
      this.selectedTipoConcepto &&
      this.valorTarifa !== null &&
      this.valorTarifa > 0
    );

    return canAdd;
  }  // Agregar una nueva tarifa
  agregarTarifa(): void {
    if (!this.canAddTarifa()) {
      return;
    }

    // Convertir a número si es string
    const tipoTarifaId = typeof this.selectedTipoTarifa === 'string' ?
      parseInt(this.selectedTipoTarifa) : this.selectedTipoTarifa;
    const tipoConceptoId = typeof this.selectedTipoConcepto === 'string' ?
      parseInt(this.selectedTipoConcepto) : this.selectedTipoConcepto;

    const tipoTarifaNombre = this.typeRatesData().find(t => t.id === tipoTarifaId)?.nombre || '';
    const tipoConceptoNombre = this.tiposConcepto.find(c => c.id === tipoConceptoId)?.nombre || '';

    console.log('Datos para agregar:', {
      selectedTipoTarifa: this.selectedTipoTarifa,
      selectedTipoConcepto: this.selectedTipoConcepto,
      tipoTarifaId,
      tipoConceptoId,
      tipoTarifaNombre,
      tipoConceptoNombre,
      valorTarifa: this.valorTarifa
    });

    const nuevaTarifa: TarifaItem = {
      id: this.nextId++,
      tipoTarifa: tipoTarifaNombre,
      tipoConcepto: tipoConceptoNombre,
      valor: this.valorTarifa!,
      estratos: [...this.estratosActuales]
    };

    this.tarifasAgregadas.push(nuevaTarifa);

    console.log('Tarifa agregada:', nuevaTarifa);
    console.log('Lista completa:', this.tarifasAgregadas);

    // Limpiar el formulario
    this.limpiarFormulario();
  }

  // Eliminar una tarifa específica
  eliminarTarifa(id: number): void {
    this.tarifasAgregadas = this.tarifasAgregadas.filter(tarifa => tarifa.id !== id);
  }

  // Limpiar el formulario
  private limpiarFormulario(): void {
    this.selectedTipoTarifa = null;
    this.selectedTipoConcepto = null;
    this.valorTarifa = null;
    this.estratosActuales = [];
    this.mostrarTablaEstratos = false;
  }

  // Métodos para manejo de estratos
  toggleTablaEstratos(): void {
    this.mostrarTablaEstratos = !this.mostrarTablaEstratos;
    if (this.mostrarTablaEstratos && this.estratosActuales.length === 0) {
      // Inicializar con 3 estratos por defecto
      this.estratosActuales = [
        { id: 1, numero: 1, valor: 1000 },
        { id: 2, numero: 2, valor: 2000 },
        { id: 3, numero: 3, valor: 3000 }
      ];
    }
  }

  agregarNuevoEstrato(): void {
    if (this.nuevoEstratoValor !== null && this.nuevoEstratoValor > 0) {
      const maxId = this.estratosActuales.length > 0 ?
        Math.max(...this.estratosActuales.map(e => e.id)) : 0;

      const nuevoEstrato: Estrato = {
        id: maxId + 1,
        numero: this.nuevoEstratoNumero,
        valor: this.nuevoEstratoValor
      };

      this.estratosActuales.push(nuevoEstrato);
      this.estratosActuales.sort((a, b) => a.numero - b.numero);

      // Limpiar campos
      this.nuevoEstratoNumero = Math.max(...this.estratosActuales.map(e => e.numero)) + 1;
      this.nuevoEstratoValor = null;
    }
  }

  eliminarEstrato(id: number): void {
    this.estratosActuales = this.estratosActuales.filter(estrato => estrato.id !== id);
  }

  actualizarEstratoValor(estratoId: number, nuevoValor: number): void {
    const estrato = this.estratosActuales.find(e => e.id === estratoId);
    if (estrato) {
      estrato.valor = nuevoValor;
    }
  }

  guardarTarifas(): void {
    if (this.tarifasAgregadas.length === 0) {
      return;
    }

    this.toastService.success(
      'Éxito',
      'Estado actualizado correctamente'
    );
  }

  // Métodos para el popup de tipo de tarifa
  abrirPopupTipoTarifa(): void {
    // Configurar modo de creación
    this.editandoTipoTarifa.set(false);
    this.rateTypeToEdit = null;
    this.showPopupTipoTarifa.set(true);
    this.nuevoTipoTarifa = {
      nombre: '',
      descripcion: ''
    };
  }

  cerrarPopupTipoTarifa(): void {
    this.showPopupTipoTarifa.set(false);
    this.editandoTipoTarifa.set(false);
    this.guardandoTipoTarifa.set(false); // Resetear estado de carga
    this.rateTypeToEdit = null;
    this.nuevoTipoTarifa = {
      nombre: '',
      descripcion: ''
    };
  }

  guardarNuevoTipoTarifa(): void {
    if (!this.nuevoTipoTarifa.nombre.trim() || this.guardandoTipoTarifa()) {
      return;
    }

    const usuario = this.nombreUsuario();
    if (!usuario) {
      alert('Error: No se pudo obtener el usuario actual');
      return;
    }

    // Activar indicador de carga
    this.guardandoTipoTarifa.set(true);

    // Timeout de seguridad para resetear el estado de carga
    const timeoutId = setTimeout(() => {
      console.warn('Timeout de seguridad - reseteando estado de carga');
      this.guardandoTipoTarifa.set(false);
    }, 30000); // 30 segundos

    // Generar código basado en las 3 primeras letras del nombre
    // Si estamos editando, conservar el código original
    const codigo = this.editandoTipoTarifa() && this.rateTypeToEdit?.codigo
      ? this.rateTypeToEdit.codigo
      : this.nuevoTipoTarifa.nombre
          .trim()
          .substring(0, 3)
          .toUpperCase()
          .padEnd(3, 'X'); // Si tiene menos de 3 letras, completa con 'X'

    // Crear el objeto para enviar al servicio
    const tipoTarifaData: IrateTypes = {
      nombre: this.nuevoTipoTarifa.nombre.trim(),
      descripcion: this.nuevoTipoTarifa.descripcion.trim() || '',
      codigo: codigo,
      usuarioCreacion: usuario
    };

    // Si estamos editando, conservar el ID
    if (this.editandoTipoTarifa() && this.rateTypeToEdit?.id) {
      tipoTarifaData.id = this.rateTypeToEdit.id;
    }

    console.log('Enviando tipo de tarifa:', tipoTarifaData);

    // Usar el mismo endpoint (POST) tanto para crear como para actualizar
    // La diferencia es que al actualizar se envía el ID en el objeto
    const operation = this.rateTypeService.saveRateType(tipoTarifaData);

    operation.subscribe({
      next: (response) => {
        clearTimeout(timeoutId); // Cancelar timeout
        console.log('Operación exitosa:', response);

        if (response.success) {
          const mensaje = this.editandoTipoTarifa()
            ? 'Tipo de tarifa actualizado exitosamente'
            : 'Tipo de tarifa guardado exitosamente';

          this.toastService.success('Éxito', mensaje);
          this.cerrarPopupTipoTarifa();
          this.typeRates.reload();
        } else {
          const errorMsg = this.editandoTipoTarifa()
            ? 'Error al actualizar el tipo de tarifa: '
            : 'Error al guardar el tipo de tarifa: ';
          alert(errorMsg + (response.message || 'Error desconocido'));
        }

        // Resetear el estado de carga en cualquier caso
        this.guardandoTipoTarifa.set(false);
      },
      error: (error) => {
        clearTimeout(timeoutId); // Cancelar timeout
        console.error('Error en la operación:', error);
        const errorMsg = this.editandoTipoTarifa()
          ? 'Error al actualizar el tipo de tarifa. Por favor, inténtelo de nuevo.'
          : 'Error al guardar el tipo de tarifa. Por favor, inténtelo de nuevo.';
        alert(errorMsg);

        // Resetear el estado de carga en caso de error
        this.guardandoTipoTarifa.set(false);
      },
      complete: () => {
        clearTimeout(timeoutId); // Cancelar timeout
        console.log('Operación completada - reseteando estado de carga');
        this.guardandoTipoTarifa.set(false);
      }
    });
  }

  // Métodos para el popup de visualizar tarifas
  abrirPopupVisualizarTarifas(): void {
    this.showPopupVisualizarTarifas.set(true);
  }

  cerrarPopupVisualizarTarifas(): void {
    this.showPopupVisualizarTarifas.set(false);
  }

  onEditRateType(rateType: IrateTypes): void {
    console.log('Editar tipo de tarifa:', rateType);
    // Configurar el modo de edición
    this.editandoTipoTarifa.set(true);
    this.rateTypeToEdit = rateType;

    // Cargar los datos en el formulario
    this.nuevoTipoTarifa = {
      nombre: rateType.nombre,
      descripcion: rateType.descripcion || ''
    };

    // Abrir el popup
    this.showPopupTipoTarifa.set(true);
  }

  onDeleteRateType(rateType: IrateTypes): void {
    console.log('onDeleteRateType llamado con:', rateType);
    // Guardar el tipo de tarifa a eliminar y mostrar popup de confirmación
    this.rateTypeToDelete = rateType;
    console.log('Mostrando popup de confirmación...');
    this.showDeleteConfirm.set(true);
    console.log('showDeleteConfirm establecido a:', this.showDeleteConfirm());
  }

  getDeleteConfirmMessage(): string {
    return this.rateTypeToDelete
      ? `¿Está seguro que desea eliminar el tipo de tarifa "${this.rateTypeToDelete.nombre}"? Esta acción no se puede deshacer.`
      : '¿Está seguro que desea eliminar este tipo de tarifa?';
  }

  confirmDeleteRateType(): void {
    console.log('confirmDeleteRateType llamado');
    if (this.rateTypeToDelete?.id) {
      console.log('Eliminando tipo de tarifa con ID:', this.rateTypeToDelete.id);
      this.rateTypeService.deleteRateType(this.rateTypeToDelete.id).subscribe({
        next: (response) => {
          console.log('Respuesta del servicio:', response);
          if (response.success) {
            this.typeRates.reload();
            alert('Tipo de tarifa eliminado exitosamente');
          } else {
            alert('Error al eliminar el tipo de tarifa: ' + (response.message || 'Error desconocido'));
          }
        },
        error: (error) => {
          console.error('Error al eliminar tipo de tarifa:', error);
          alert('Error al eliminar el tipo de tarifa. Por favor, intenta nuevamente.');
        },
        complete: () => {
          this.showDeleteConfirm.set(false);
          this.rateTypeToDelete = null;
        }
      });
    }
  }

  cancelDeleteRateType(): void {
    console.log('cancelDeleteRateType llamado');
    this.showDeleteConfirm.set(false);
    this.rateTypeToDelete = null;
  }
}
