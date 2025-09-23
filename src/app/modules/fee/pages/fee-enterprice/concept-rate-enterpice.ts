import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConceptRateService } from '../../services/concept-rate.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';
import { PopupComponent } from '../../../../shared/components/popUp';
import { ToastService } from '@services/toast.service';


@Component({
  selector: 'app-concept-rate-enterpice',
  imports: [CommonModule, PopupComponent, FormsModule],
  styles: [`
    :host ::ng-deep app-pop-up #overlay {
      background: rgba(0, 0, 0, 0.8) !important;
      --tw-backdrop-blur: blur(var(--blur-sm));
      -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
      backdrop-filter: var(--tw-backdrop-blur, ) var(--tw-backdrop-brightness, ) var(--tw-backdrop-contrast, ) var(--tw-backdrop-grayscale, ) var(--tw-backdrop-hue-rotate, ) var(--tw-backdrop-invert, ) var(--tw-backdrop-opacity, ) var(--tw-backdrop-saturate, ) var(--tw-backdrop-sepia, );
    }
  `],
  template: `
    <section class="w-full bg-transparent text-gray-200">
      <div class="w-full px-2 pb-4">
        <div class="">
          <h2 class="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight mb-6">
            Lista de Conceptos de Tarifa
          </h2>

        <!-- Loading state -->
        @if (dataConceptRate.isLoading()) {
          <div class="rounded-xl border border-gray-600/70 bg-transparent p-8 text-center">
            <div class="flex items-center justify-center space-x-2">
              <div class="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <div class="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.1s"></div>
              <div class="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
            </div>
            <p class="text-gray-400 mt-4">Cargando conceptos de tarifa...</p>
          </div>
        }

        <!-- Error state -->
        @else if (dataConceptRate.error()) {
          <div class="rounded-xl border border-red-600/70 bg-red-500/10 p-8 text-center">
            <div class="flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <p class="text-red-400 mb-4">Error al cargar los conceptos de tarifa</p>
            <button
              (click)="reloadData()"
              class="inline-flex items-center px-4 py-2 border border-red-600/70 rounded-lg text-red-400 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/40">
              Reintentar
            </button>
          </div>
        }

        <!-- Content -->
        @else {
          <div class="space-y-6">
            @if (conceptRatesData().length === 0) {
              <div class="rounded-xl border border-gray-600/70 bg-transparent p-8 text-center">
                <div class="flex items-center justify-center mb-4">
                  <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <p class="text-gray-400 text-lg">No hay conceptos de tarifa configurados</p>
                <p class="text-gray-500 text-sm mt-2">Configure conceptos de tarifa para esta empresa</p>
              </div>
            } @else {
              <!-- Summary card -->
              <div class="rounded-xl border border-blue-600/70 bg-blue-500/10 p-4 mb-6">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div class="flex items-center space-x-3 mb-4 sm:mb-0">
                    <div class="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <svg class="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="text-blue-400 font-medium text-sm sm:text-base">Total de conceptos configurados</p>
                      <p class="text-blue-300 text-xs sm:text-sm">Para esta empresa</p>
                    </div>
                  </div>
                  <div class="text-left sm:text-right">
                    <p class="text-2xl font-bold text-blue-400">{{ conceptRatesData().length }}</p>
                    <p class="text-blue-300 text-xs">conceptos</p>
                  </div>
                </div>
              </div>

              @for (conceptRate of conceptRatesData(); track conceptRate.id) {
                <div class="rounded-xl border border-gray-600/70 bg-transparent p-4 hover:border-gray-500/70 transition-colors duration-200">
                  <!-- Mobile Layout -->
                  <div class="block md:hidden">
                    <!-- Header -->
                    <div class="flex items-center justify-between mb-4">
                      <div class="flex-1">
                        <h3 class="text-lg font-semibold text-white mb-1">
                          {{ conceptRate.tipoTarifa.nombre }}
                        </h3>
                        <span class="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                          {{ conceptRate.tipoConcepto.codigo }}
                        </span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <button
                          (click)="editConceptRate(conceptRate.id)"
                          class="inline-flex items-center justify-center w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors"
                          title="Editar concepto">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button
                          (click)="deleteConceptRate(conceptRate.id)"
                          class="inline-flex items-center justify-center w-8 h-8 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
                          title="Eliminar concepto">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <!-- Mobile Content -->
                    <div class="space-y-3">
                      <!-- Tipo de Tarifa -->
                      <div class="flex items-start gap-3">
                        <div class="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div class="flex-1">
                          <span class="text-xs text-gray-400 block mb-1">Tipo de Tarifa</span>
                          <span class="text-sm text-gray-300 block">
                            {{ conceptRate.tipoTarifa.nombre }}
                          </span>
                          <span class="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded inline-block mt-1">
                            {{ conceptRate.tipoTarifa.codigo }}
                          </span>
                        </div>
                      </div>

                      <!-- Valor -->
                      <div class="flex items-start gap-3">
                        <div class="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div class="flex-1">
                          <span class="text-xs text-gray-400 block mb-1">Valor</span>
                          @if (conceptRate.porEstrato && conceptRate.estratos && conceptRate.estratos.length > 0) {
                            <div class="space-y-1">
                              @for (estrato of conceptRate.estratos; track estrato.id) {
                                <div class="flex justify-between items-center">
                                  <span class="text-sm text-gray-300">Estrato {{estrato.estrato}}:</span>
                                  <span class="text-green-400 font-bold">$ {{ estrato.valor | number:'1.2-2' }}</span>
                                </div>
                              }
                            </div>
                          } @else if (conceptRate.valor) {
                            <div class="flex items-baseline gap-2">
                              <span class="text-xl font-bold text-green-400">
                                $ {{ conceptRate.valor | number:'1.2-2' }}
                              </span>
                              <span class="text-xs text-gray-500">COP</span>
                            </div>
                          } @else {
                            <span class="text-gray-500">Sin valor</span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Desktop Layout -->
                  <div class="hidden md:block">
                    <div class="grid grid-cols-12 items-center gap-4">
                      <!-- Header labels -->
                      <div class="col-span-12 grid grid-cols-12 text-xs text-gray-400 mb-2">
                        <span class="col-span-4">Tipo de Tarifa</span>
                        <span class="col-span-4">Tipo de Concepto</span>
                        <span class="col-span-3">Valor</span>
                        <span class="col-span-1 text-center">Acciones</span>
                      </div>

                      <!-- Data row -->
                      <div class="col-span-12 grid grid-cols-12 items-center">
                        <div class="col-span-4">
                          <div class="space-y-1">
                            <span class="text-lg font-semibold block text-white">
                              {{ conceptRate.tipoTarifa.nombre }}
                            </span>
                            <span class="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded inline-block">
                              {{ conceptRate.tipoTarifa.codigo }}
                            </span>
                          </div>
                        </div>

                        <div class="col-span-4">
                          <div class="space-y-1">
                            <span class="text-sm text-gray-400 block">
                              {{ conceptRate.tipoConcepto.descripcion }}
                            </span>
                            <span class="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded inline-block">
                              {{ conceptRate.tipoConcepto.codigo }}
                            </span>
                          </div>
                        </div>

                        <div class="col-span-3">
                          @if (conceptRate.porEstrato && conceptRate.estratos && conceptRate.estratos.length > 0) {
                            <div class="flex flex-col space-y-1">
                              <span class="text-xs text-gray-400">Por Estrato:</span>
                              @for (estrato of conceptRate.estratos; track estrato.id) {
                                <div class="flex justify-between items-center text-sm">
                                  <span class="text-gray-300">Est. {{estrato.estrato}}:</span>
                                  <span class="text-green-400 font-bold">$ {{ estrato.valor | number:'1.2-2' }}</span>
                                </div>
                              }
                            </div>
                          } @else if (conceptRate.valor) {
                            <div class="flex flex-col">
                              <span class="text-xl font-bold text-green-400">
                                $ {{ conceptRate.valor | number:'1.2-2' }}
                              </span>
                              <span class="text-xs text-gray-500">
                                COP
                              </span>
                            </div>
                          } @else {
                            <span class="text-gray-500">Sin valor</span>
                          }
                        </div>

                        <div class="col-span-1">
                          <div class="flex items-center justify-center space-x-1">
                            <button
                              (click)="editConceptRate(conceptRate.id)"
                              class="inline-flex items-center justify-center w-8 h-8 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors"
                              title="Editar concepto">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </button>
                            <button
                              (click)="deleteConceptRate(conceptRate.id)"
                              class="inline-flex items-center justify-center w-8 h-8 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
                              title="Eliminar concepto">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            }
          </div>
        }
        </div>
      </div>
    </section>

    <!-- Popup de confirmación de eliminación -->
    @if (showDeleteConfirm()) {
      <app-pop-up
        [open]="showDeleteConfirm"
        [isConfirmation]="true"
        title="Eliminar Concepto de Tarifa"
        [message]="getDeleteConfirmMessage()"
        confirmText="Eliminar"
        cancelText="Cancelar"
        (confirmAction)="confirmDeleteConceptRate()"
        (cancelAction)="cancelDeleteConceptRate()"
      >
      </app-pop-up>
    }

    <!-- Popup de edición de concepto de tarifa -->
    @if (showEditPopup()) {
      <app-pop-up
        [open]="showEditPopup"
        [isConfirmation]="false"
        title="Editar Concepto de Tarifa"
        maxWidth="w-50 sm:max-w-2xl"
        paddingTop="pt-[20px]"
      >
        <!-- Contenido scrolleable -->
        <div class="overflow-y-auto overflow-x-hidden" style="max-height: calc(100vh - 330px); padding: 0;">
          <div class="space-y-6 px-6">
            @if (editingConceptRate) {
              <!-- Información del concepto -->
              <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-600/50">
                <h4 class="text-sm font-medium text-gray-300 mb-2">Información del Concepto</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-400">Tipo de Tarifa:</span>
                    <p class="text-white font-medium">{{ editingConceptRate.tipoTarifa.nombre }}</p>
                  </div>
                  <div>
                    <span class="text-gray-400">Tipo de Concepto:</span>
                    <p class="text-white font-medium">{{ editingConceptRate.tipoConcepto.descripcion }}</p>
                  </div>
                </div>
              </div>

              <!-- Toggle para tipo de tarifa -->
              <div class="flex items-center space-x-3">
                <label class="flex items-center">
                  <input
                    type="radio"
                    [(ngModel)]="editForm.porEstrato"
                    [value]="false"
                    name="tipoTarifa"
                    class="form-radio text-blue-600"
                  >
                  <span class="ml-2 text-gray-300">Valor único</span>
                </label>
                <label class="flex items-center">
                  <input
                    type="radio"
                    [(ngModel)]="editForm.porEstrato"
                    [value]="true"
                    name="tipoTarifa"
                    class="form-radio text-blue-600"
                  >
                  <span class="ml-2 text-gray-300">Por estratos</span>
                </label>
              </div>

              <!-- Campo valor único -->
              @if (!editForm.porEstrato) {
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-300">Valor</label>
                  <input
                    type="number"
                    [(ngModel)]="editForm.valor"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    class="block w-full rounded-lg border border-gray-600/70 bg-transparent px-3 py-2 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-400/40"
                  >
                </div>
              }

              <!-- Estratos -->
              @if (editForm.porEstrato) {
                <div class="space-y-4">
                  <h4 class="text-sm font-medium text-gray-300">Estratos</h4>

                  <!-- Lista de estratos -->
                  @if (editForm.estratos.length > 0) {
                    <div class="space-y-2">
                      @for (estrato of editForm.estratos; track estrato.estrato) {
                        <div class="flex items-center space-x-3 p-2 bg-gray-800/30 rounded">
                          <span class="text-sm text-gray-400 w-16">Estrato {{ estrato.estrato }}:</span>
                          <input
                            type="number"
                            [value]="estrato.valor"
                            (input)="updateEstratoInEdit(estrato.estrato, +$any($event.target).value)"
                            min="0"
                            step="0.01"
                            class="w-20 sm:flex-1 rounded border border-gray-600/70 bg-transparent px-2 py-1 text-sm text-gray-100 outline-none focus:border-gray-300"
                          >
                          <button
                            type="button"
                            (click)="removeEstratoFromEdit(estrato.estrato)"
                            class="text-red-400 hover:text-red-300"
                            title="Eliminar estrato"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </div>
                      }
                    </div>
                  } @else {
                    <p class="text-gray-400 text-sm">No hay estratos configurados</p>
                  }

                  <!-- Agregar nuevo estrato -->
                  <div class="flex items-end space-x-2">
                    <div class="w-20 sm:flex-1">
                      <label class="block text-xs text-gray-400 mb-1">Estrato</label>
                      <input
                        type="number"
                        #nuevoEstrato
                        min="1"
                        max="6"
                        placeholder="1"
                        class="block w-full rounded border border-gray-600/70 bg-transparent px-2 py-1 text-sm text-gray-100"
                      >
                    </div>
                    <div class="w-20 sm:flex-1">
                      <label class="block text-xs text-gray-400 mb-1">Valor</label>
                      <input
                        type="number"
                        #nuevoValor
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        class="block w-full rounded border border-gray-600/70 bg-transparent px-2 py-1 text-sm text-gray-100"
                      >
                    </div>
                    <button
                      type="button"
                      (click)="addEstratoToEdit(+nuevoEstrato.value, +nuevoValor.value); nuevoEstrato.value = ''; nuevoValor.value = ''"
                      class="w-50 sm:px-3 px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        </div>

        <!-- Botones de acción fijos -->
        <div class="flex justify-end space-x-3 pt-4 mt-4 border-t border-gray-600/50 px-6">
          <button
            type="button"
            (click)="closeEditPopup()"
            class="px-4 py-2 text-sm font-medium text-gray-300 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          <button
            type="button"
            (click)="updateConceptRate()"
            [disabled]="updatingConceptRate() || (!editForm.porEstrato && !editForm.valor) || (editForm.porEstrato && editForm.estratos.length === 0)"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @if (updatingConceptRate()) {
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Actualizando...
            } @else {
              Actualizar
            }
          </button>
        </div>
        </app-pop-up>
    }

    <!-- Popup de confirmación de eliminación de estrato -->
    @if (showDeleteConfirmEstrato()) {
      <app-pop-up
        [open]="showDeleteConfirmEstrato"
        [isConfirmation]="true"
        title="Eliminar Estrato"
        [message]="getDeleteConfirmMessageEstrato()"
        confirmText="Eliminar"
        cancelText="Cancelar"
        (confirmAction)="confirmDeleteEstrato()"
        (cancelAction)="cancelDeleteEstrato()"
      >
      </app-pop-up>
    }
  `
  ,
})
export class ConceptRateEnterpice {

  readonly conceptRateService = inject(ConceptRateService);
  protected readonly toastService = inject(ToastService);

  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);


  showDeleteConfirm = signal(false);
  conceptRateToDelete: any = null;


  showEditPopup = signal(false);
  editingConceptRate: any = null;
  updatingConceptRate = signal(false);

  showDeleteConfirmEstrato = signal(false);
  estratoToDelete: { estrato: number; valor: number } | null = null;

  editForm = {
    valor: null as number | null,
    estratos: [] as any[],
    porEstrato: false
  };

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

  dataConceptRate = rxResource({
    params: () => ({ enterpriseId: this.empresaId() }),
    stream: ({ params: { enterpriseId } }) =>
      enterpriseId
        ? this.conceptRateService.getConceptRateByEnterprise(enterpriseId)
        : EMPTY
  })

conceptRatesData = computed(() => {
  const data = this.dataConceptRate.value()?.response ?? [];
  return data;
});

  reloadData(): void {
    this.dataConceptRate.reload();
  }

  totalConceptRates = computed(() => this.conceptRatesData().length);

  averageValue = computed(() => {
    const data = this.conceptRatesData();
    if (data.length === 0) return 0;
    const total = data.reduce((sum, item) => sum + (item.valor || 0), 0);
    return total / data.length;
  });

  editConceptRate(id: number): void {
    const conceptRate = this.conceptRatesData().find(cr => cr.id === id);
    if (conceptRate) {
      this.editingConceptRate = conceptRate;

      // Copiar datos al formulario
      this.editForm = {
        valor: conceptRate.valor || null,
        estratos: conceptRate.estratos ? [...conceptRate.estratos] : [],
        porEstrato: conceptRate.porEstrato || false
      };

      this.showEditPopup.set(true);
    }
  }

  deleteConceptRate(id: number): void {
    // Buscar el concepto de tarifa para mostrar su información en el popup
    const conceptRate = this.conceptRatesData().find(cr => cr.id === id);
    this.conceptRateToDelete = conceptRate;
    this.showDeleteConfirm.set(true);
  }

  getDeleteConfirmMessage(): string {
    if (!this.conceptRateToDelete) {
      return '¿Está seguro que desea eliminar este concepto de tarifa?';
    }

    const tipoTarifa = this.conceptRateToDelete.tipoTarifa?.nombre || 'Sin nombre';
    const tipoConcepto = this.conceptRateToDelete.tipoConcepto?.descripcion || 'Sin descripción';

    return `¿Está seguro que desea eliminar el concepto de tarifa "${tipoTarifa} - ${tipoConcepto}"? Esta acción no se puede deshacer.`;
  }

  confirmDeleteConceptRate(): void {
    if (this.conceptRateToDelete?.id) {
      this.conceptRateService.deleteConceptRate(this.conceptRateToDelete.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.dataConceptRate.reload();
            this.toastService.success(
              'Éxito',
              'Concepto de tarifa eliminado exitosamente'
            );
          } else {
            this.toastService.error(
              'Error',
              'El concepto de tarifa no se pudo eliminar'
            );
          }
        },
        error: (error) => {
          console.error('Error al eliminar el concepto de tarifa:', error);
          this.toastService.error(
            'Error',
            'El concepto de tarifa no se pudo eliminar. Inténtelo de nuevo.'
          );
        },
        complete: () => {
          this.showDeleteConfirm.set(false);
          this.conceptRateToDelete = null;
        },
      });
    }
  }

  cancelDeleteConceptRate(): void {
    this.showDeleteConfirm.set(false);
    this.conceptRateToDelete = null;
  }

  // Métodos para el popup de edición
  closeEditPopup(): void {
    this.showEditPopup.set(false);
    this.editingConceptRate = null;
    this.updatingConceptRate.set(false);
    this.resetEditForm();
  }

  resetEditForm(): void {
    this.editForm = {
      valor: null,
      estratos: [],
      porEstrato: false
    };
  }

  updateConceptRate(): void {
    if (!this.editingConceptRate) return;

    const empresaId = this.empresaId();
    const usuario = this.nombreUsuario();

    if (!empresaId || !usuario) {
      this.toastService.error('Error', 'No se pudo obtener la información del usuario o empresa');
      return;
    }

    // Validaciones
    if (!this.editForm.porEstrato && !this.editForm.valor) {
      this.toastService.error('Error', 'Por favor, ingrese un valor para el concepto');
      return;
    }

    if (this.editForm.porEstrato && this.editForm.estratos.length === 0) {
      this.toastService.error('Error', 'Por favor, agregue al menos un estrato');
      return;
    }

    this.updatingConceptRate.set(true);

    // Construir payload según el tipo seleccionado
    let payload: any = {
      idTarifaConcepto: this.editingConceptRate.id,
      usuarioModificacion: usuario,
      indCalcularMc: false
    };

    if (this.editForm.porEstrato) {
      // Payload para actualización por estratos
      payload.estratos = this.editForm.estratos.map(estrato => ({
        estrato: estrato.estrato,
        valor: estrato.valor
      }));
    } else {
      // Payload para valor único
      payload.valor = this.editForm.valor;
    }

    // Llamar al servicio con el nuevo endpoint
    this.conceptRateService.updateConcepRateStratum(payload).subscribe({
      next: (response) => {
        this.updatingConceptRate.set(false); // Resetear loading state aquí
        if (response.success) {
          this.toastService.success('Éxito', 'Concepto de tarifa actualizado correctamente');
          this.closeEditPopup();
          this.reloadData();
        } else {
          this.toastService.error('Error', response.message || 'Error al actualizar el concepto de tarifa');
        }
      },
      error: (error) => {
        this.updatingConceptRate.set(false); // Resetear loading state aquí también
        console.error('Error al actualizar concepto de tarifa:', error);
        this.toastService.error('Error', 'Error al actualizar el concepto de tarifa');
      }
    });
  }

  // Métodos para manejar estratos en edición
  addEstratoToEdit(estrato: number, valor: number): void {
    const existe = this.editForm.estratos.find(e => e.estrato === estrato);
    if (!existe && valor > 0) {
      this.editForm.estratos.push({ estrato, valor });
      this.editForm.estratos.sort((a, b) => a.estrato - b.estrato);
    }
  }

  removeEstratoFromEdit(estrato: number): void {
    const estratoObj = this.editForm.estratos.find(e => e.estrato === estrato);
    if (estratoObj) {
      this.estratoToDelete = { estrato: estratoObj.estrato, valor: estratoObj.valor };
      this.showDeleteConfirmEstrato.set(true);
    }
  }

  updateEstratoInEdit(estrato: number, valor: number): void {
    const estratoObj = this.editForm.estratos.find(e => e.estrato === estrato);
    if (estratoObj) {
      estratoObj.valor = valor;
    }
  }

  // Métodos para confirmación de eliminación de estrato
  getDeleteConfirmMessageEstrato(): string {
    return this.estratoToDelete
      ? `¿Está seguro que desea eliminar el estrato ${this.estratoToDelete.estrato} con valor $${this.estratoToDelete.valor.toLocaleString()}? Esta acción no se puede deshacer.`
      : '¿Está seguro que desea eliminar este estrato?';
  }

  confirmDeleteEstrato(): void {
    if (!this.estratoToDelete) {
      this.cancelDeleteEstrato();
      return;
    }

    const estratoNumero = this.estratoToDelete.estrato;
    const estratoInfo = `${this.estratoToDelete.estrato} (Valor: $${this.estratoToDelete.valor.toLocaleString()})`;

    // Buscar el estrato en la base de datos (si tiene ID)
    const estratoEnBD = this.editingConceptRate?.estratos?.find((e: any) => e.estrato === estratoNumero);

    if (estratoEnBD?.id) {
      // Si el estrato existe en BD, eliminarlo usando el endpoint
      this.conceptRateService.deleteConceptStratum(estratoEnBD.id).subscribe({
        next: (response) => {
          if (response?.success !== false) {
            // Eliminar del array local solo si la petición fue exitosa
            this.editForm.estratos = this.editForm.estratos.filter(e => e.estrato !== estratoNumero);
            this.toastService.success(
              'Éxito',
              `Se eliminó exitosamente el estrato ${estratoInfo}`
            );
            // Recargar la lista de tarifas conceptos para reflejar los cambios
            this.dataConceptRate.reload();
          } else {
            this.toastService.error(
              'Error',
              response?.message || 'No se pudo eliminar el estrato'
            );
          }
        },
        error: (error) => {
          console.error('Error al eliminar estrato:', error);
          const errorMessage = error?.error?.message || error?.message || 'Error de conexión';
          this.toastService.error(
            'Error',
            `No se pudo eliminar el estrato ${estratoInfo}: ${errorMessage}`
          );
        },
        complete: () => {
          this.cancelDeleteEstrato();
        }
      });
    } else {
      // Si es un estrato nuevo (solo local), eliminarlo directamente
      this.editForm.estratos = this.editForm.estratos.filter(e => e.estrato !== estratoNumero);
      this.toastService.success(
        'Éxito',
        `Se eliminó el estrato ${estratoInfo}`
      );
      this.cancelDeleteEstrato();
    }
  }

  cancelDeleteEstrato(): void {
    this.showDeleteConfirmEstrato.set(false);
    this.estratoToDelete = null;
  }

}
