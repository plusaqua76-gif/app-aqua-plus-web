import {
  Component,
  computed,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { CounterEnterpriceService } from '../../services/counter-enterprice.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ParamsEnterprice } from '@interfaces/params-enterprice/params-enterprice';
import { ParamKey } from '@interfaces/params-enterprice/param-key';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-days-validity',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div
      class="min-h-screen  shadow-sm rounded-lg bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl  p-4"
    >
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Header -->
        <div class="text-center space-y-4">
          <!-- <div
            class="mx-auto w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20"
          >
            <i
              class="fas fa-cogs text-3xl text-green-600 dark:text-green-400"
            ></i>
          </div> -->
          <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-200">
            Configuración de Parámetros
          </h1>
        </div>

        <!-- Parámetros de Configuración -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
            Parámetros de Configuración
          </h2>
          <div class="relative">
            <!-- Carousel Container with visible overflow -->
            <div class="flex items-center justify-center overflow-hidden py-8">
              <div class="flex gap-6 transition-transform duration-700 ease-in-out"
                   [style.transform]="'translateX(' + getTranslateX() + ')'">

                <!-- Cards de Parámetros Dinámicas -->
                @for (paramConfig of parametrosConfig; track paramConfig.key; let idx = $index) {
                  <div class="flex-shrink-0 transition-all duration-700 relative"
                       [class.scale-90]="currentSlide() !== idx"
                       [class.opacity-40]="currentSlide() !== idx"
                       [class.scale-100]="currentSlide() === idx"
                       [class.opacity-100]="currentSlide() === idx"
                       [class.pointer-events-none]="currentSlide() !== idx">

                    <!-- Card Principal -->
                    <div [ngClass]="{
                      'bg-sky-700': paramConfig.color === 'sky',
                      'bg-emerald-700': paramConfig.color === 'emerald',
                      'bg-purple-700': paramConfig.color === 'purple',
                      'shadow-sky-500': paramConfig.color === 'sky',
                      'shadow-emerald-500': paramConfig.color === 'emerald',
                      'shadow-purple-500': paramConfig.color === 'purple'
                    }"
                    class="rounded-2xl shadow-sm outline outline-slate-400 -outline-offset-8">
                      <div [ngClass]="{
                        'after:bg-sky-700': paramConfig.color === 'sky',
                        'after:bg-emerald-700': paramConfig.color === 'emerald',
                        'after:bg-purple-700': paramConfig.color === 'purple',
                        'before:bg-sky-400': paramConfig.color === 'sky',
                        'before:bg-emerald-400': paramConfig.color === 'emerald',
                        'before:bg-purple-400': paramConfig.color === 'purple'
                      }"
                      class="group overflow-hidden relative after:duration-500 before:duration-500 duration-500 hover:after:duration-500 hover:after:translate-x-24 hover:before:translate-y-12 hover:before:-translate-x-32 hover:duration-500 after:absolute after:w-24 after:h-24 after:rounded-full after:blur-xl after:bottom-32 after:right-16 before:absolute before:w-20 before:h-20 before:rounded-full before:blur-xl before:top-20 before:right-16 flex justify-center items-center h-56 w-80 bg-neutral-900 rounded-2xl outline outline-slate-400 -outline-offset-8">
                        <div class="z-10 flex flex-col items-center gap-2 w-full px-4">
                          <i [class]="'fas ' + paramConfig.icon + ' text-slate-400 text-6xl'"></i>
                          <p class="text-gray-50 text-center font-semibold">{{ paramConfig.label }}</p>
                          <div class="mt-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <p class="text-sm text-gray-300">Valor Actual:</p>
                            <p class="text-2xl font-bold text-white">
                              {{ getParamValue(paramConfig.key) ?? 'No configurado' }}
                            </p>
                          </div>
                        </div>

                        <!-- Toggle Button -->
                        <button
                          (click)="toggleCard(idx)"
                          [ngClass]="{
                            'bg-sky-600 hover:bg-sky-500': paramConfig.color === 'sky',
                            'bg-emerald-600 hover:bg-emerald-500': paramConfig.color === 'emerald',
                            'bg-purple-600 hover:bg-purple-500': paramConfig.color === 'purple'
                          }"
                          class="absolute bottom-4 right-4 z-20 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-300 shadow-lg">
                          <i [class]="expandedCard() === idx ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Expandable Section -->
                    <div [class]="expandedCard() === idx ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'"
                         class="transition-all duration-300 ease-in-out overflow-hidden">
                      <div [ngClass]="{
                        'border-sky-500/30': paramConfig.color === 'sky',
                        'border-emerald-500/30': paramConfig.color === 'emerald',
                        'border-purple-500/30': paramConfig.color === 'purple'
                      }"
                      class="bg-neutral-800/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border w-80">
                        <div class="space-y-3">
                          <!-- Descripción -->
                          <div class="bg-neutral-700/50 rounded-lg p-3">
                            <p class="text-xs text-gray-400 mb-1 flex items-center gap-1">
                              <i class="fas fa-info-circle"></i>
                              Descripción:
                            </p>
                            <p class="text-sm text-gray-200 leading-relaxed">{{ paramConfig.description }}</p>
                          </div>

                          <!-- Código Llave -->
                          <div class="flex items-center justify-between">
                            <div class="flex-1">
                              <p class="text-xs text-gray-400 mb-1">Código Llave:</p>
                              <p class="text-sm text-gray-200 font-mono">{{ paramConfig.key }}</p>
                            </div>
                          </div>

                          <!-- Input de Valor -->
                          <div class="flex items-center gap-2">
                            <div class="flex-1">
                              <p class="text-xs text-gray-400 mb-1">Valor:</p>
                              <input
                                type="number"
                                [disabled]="!isEditingParam(paramConfig.key)"
                                [(ngModel)]="paramValues()[paramConfig.key]"
                                [placeholder]="getParamValue(paramConfig.key)?.toString() ?? 'Ingrese un valor'"
                                [ngClass]="{
                                  'focus:ring-sky-500': paramConfig.color === 'sky',
                                  'focus:ring-emerald-500': paramConfig.color === 'emerald',
                                  'focus:ring-purple-500': paramConfig.color === 'purple'
                                }"
                                class="w-full px-3 py-2 bg-neutral-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>

                            <!-- Botón Editar/Guardar -->
                            <button
                              type="button"
                              (click)="isEditingParam(paramConfig.key) ? saveParamValue(paramConfig.key) : startEditParam(paramConfig.key)"
                              [disabled]="isSubmitting()"
                              [ngClass]="{
                                'border-green-600/50 text-green-400 hover:bg-green-600/10': isEditingParam(paramConfig.key),
                                'border-sky-600/50 text-sky-400 hover:bg-sky-600/10': !isEditingParam(paramConfig.key) && paramConfig.color === 'sky',
                                'border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/10': !isEditingParam(paramConfig.key) && paramConfig.color === 'emerald',
                                'border-purple-600/50 text-purple-400 hover:bg-purple-600/10': !isEditingParam(paramConfig.key) && paramConfig.color === 'purple'
                              }"
                              class="inline-flex items-center justify-center h-8 w-8 rounded-lg border transition-colors duration-200 mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
                              [title]="isEditingParam(paramConfig.key) ? 'Guardar' : 'Editar'">
                              <div *ngIf="isSubmitting()" class="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              <svg *ngIf="!isEditingParam(paramConfig.key) && !isSubmitting()"
                                class="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              <svg *ngIf="isEditingParam(paramConfig.key) && !isSubmitting()"
                                class="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </button>

                            <!-- Botón Cancelar (solo visible al editar) -->
                            <button
                              *ngIf="isEditingParam(paramConfig.key)"
                              type="button"
                              (click)="cancelEditParam(paramConfig.key)"
                              class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-red-600/50 text-red-400 hover:bg-red-600/10 transition-colors duration-200 mt-5"
                              title="Cancelar">
                              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
            </div>

            <!-- Navigation Buttons -->
            <button
              (click)="prevSlide()"
              class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-300 z-10">
              <i class="fas fa-chevron-left text-xl"></i>
            </button>

            <button
              (click)="nextSlide()"
              class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-300 z-10">
              <i class="fas fa-chevron-right text-xl"></i>
            </button>

              <!-- Indicators -->
            <!-- <div class="flex justify-center gap-2 mt-6">
              <button
                *ngFor="let slide of [0, 1, 2]"
                (click)="goToSlide(slide)"
                [class]="currentSlide() === slide ? 'bg-blue-600 w-8' : 'bg-gray-400 w-3'"
                class="h-3 rounded-full transition-all duration-300">
              </button>
            </div> -->
          </div>
        </div>        <!-- Loading -->
        <div class="flex justify-center py-8" *ngIf="paramsLoading()">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
          ></div>
        </div>
      </div>
    </div>
  `,
})
export class DaysValidity {
  protected readonly counterEnterpriceService = inject(CounterEnterpriceService);
  protected toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  selectedKey = signal<string | null>(null);
  isEditing = signal<boolean>(false);
  isCreating = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  // Carousel controls
  currentSlide = signal<number>(0);
  expandedCard = signal<number | null>(null);
  totalSlides = 3; // Solo 3 parámetros configurables

  // Card editing controls
  editingCards = signal<Set<number>>(new Set());
  cardValues: number[] = [42, 100, 75, 50, 25];

  // Parámetros configurables
  readonly parametrosConfig = [
    {
      key: 'CONSUMIN',
      label: 'Consumo Mínimo',
      description: 'Cantidad mínima de consumo de agua permitida en metros cúbicos (m³) antes de aplicar cargos adicionales.',
      color: 'sky',
      icon: 'fa-water'
    },
    {
      key: 'CONSUNORM',
      label: 'Consumo Normal',
      description: 'Rango de consumo de agua considerado normal en metros cúbicos (m³) para la facturación estándar.',
      color: 'emerald',
      icon: 'fa-tint'
    },
    {
      key: 'DIAS_VENCIDA',
      label: 'Días de Vigencia',
      description: 'Número de días que tiene el cliente para realizar el pago de la factura antes de que se considere vencida.',
      color: 'purple',
      icon: 'fa-calendar-check'
    }
  ];

  // Estados de edición para cada parámetro
  editingParams = signal<Set<string>>(new Set());
  paramValues = signal<{ [key: string]: number | null }>({});

  paramForm: FormGroup = this.fb.group({
    valorParametro: ['', [Validators.required]]
  });

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

  readonly enterpriceId = computed(() => {
    const data = this.userData();
    const id = data?.empresaId || 0;
    return id;
  });

  readonly usuarioCreacion = computed(() => {
    const data = this.userData();
    const username = data?.nombre || '';
    return username;
  });

  getparamasEnterpriceById = rxResource({
    params: () => ({
      idEnterprice: this.enterpriceId(),
    }),
    stream: ({ params }) => {
      if (!params.idEnterprice || params.idEnterprice === 0) {
        return of(null);
      }
      return this.counterEnterpriceService
        .getparamasEnterpriceById(params.idEnterprice)
        .pipe(
          catchError((error) => {
            return of(null);
          })
        );
    },
  });

  getSpecificParam = rxResource({
    params: () => ({
      idEmpresa: this.enterpriceId(),
      key: this.selectedKey(),
    }),
    stream: ({ params }) => {
      if (!params.idEmpresa || params.idEmpresa === 0 || !params.key) {
        return of(null);
      }
      return this.counterEnterpriceService
        .getParamsEnterprice(params.idEmpresa, params.key)
        .pipe(
          catchError((error) => {
            return of(null);
          })
        );
    },
  });

  readonly paramsLoading = computed(() =>
    this.getparamasEnterpriceById.isLoading()
  );

  readonly paramsData = computed(() => {
    const response = this.getparamasEnterpriceById.value();
    return response?.response || [];
  });

  readonly availableKeys = computed(() => {
    const params = this.paramsData();
    const uniqueKeys = [
      ...new Set(params.map((param: ParamsEnterprice) => param.llave)),
    ];
    return uniqueKeys.sort();
  });

  // Obtener el valor actual de un parámetro
  getParamValue(key: string): number | null {
    const params = this.paramsData();
    const param = params.find((p: ParamsEnterprice) => p.llave === key);
    return param?.valorParametro ? Number(param.valorParametro) : null;
  }

  // Obtener la configuración de un parámetro
  getParamConfig(key: string) {
    return this.parametrosConfig.find(p => p.key === key);
  }

  // Verificar si un parámetro está en modo edición
  isEditingParam(key: string): boolean {
    return this.editingParams().has(key);
  }

  // Iniciar edición de un parámetro
  startEditParam(key: string): void {
    const currentValue = this.getParamValue(key);
    this.paramValues.update(values => ({
      ...values,
      [key]: currentValue ?? null
    }));
    this.editingParams.update(editing => {
      const newSet = new Set(editing);
      newSet.add(key);
      return newSet;
    });
  }

  // Cancelar edición de un parámetro
  cancelEditParam(key: string): void {
    this.editingParams.update(editing => {
      const newSet = new Set(editing);
      newSet.delete(key);
      return newSet;
    });
    this.paramValues.update(values => {
      const newValues = { ...values };
      delete newValues[key];
      return newValues;
    });
  }

  // Guardar un parámetro específico
  saveParamValue(key: string): void {
    const value = this.paramValues()[key];
    if (value === null || value === undefined) {
      this.toast.error('Error', 'Por favor ingrese un valor válido.');
      return;
    }

    this.isSubmitting.set(true);
    const currentParam = this.paramsData().find((p: ParamsEnterprice) => p.llave === key);
    const isUpdate = !!currentParam;

    const paramData: ParamKey = {
      empresa: {
        id: this.enterpriceId()
      },
      llave: key,
      valorParametro: value.toString(),
      activo: true,
      usuarioCreacion: this.usuarioCreacion()
    };

    if (isUpdate && currentParam) {
      paramData.id = currentParam.id;
    }

    const config = this.getParamConfig(key);
    const successMessage = isUpdate
      ? `${config?.label} actualizado correctamente.`
      : `${config?.label} creado correctamente.`;

    this.counterEnterpriceService.createParamsEnterprice(paramData).subscribe({
      next: (res: any) => {
        this.toast.success('Éxito', successMessage);
        this.cancelEditParam(key);
        this.isSubmitting.set(false);
        // Recargar todos los parámetros
        this.getparamasEnterpriceById.reload();
        // Si el parámetro editado es el seleccionado, recargar también los detalles
        if (this.selectedKey() === key) {
          this.getSpecificParam.reload();
        }
      },
      error: (err: any) => {
        console.error('Error al procesar el parámetro:', err);
        this.toast.error('Error', 'No se pudo procesar el parámetro.');
        this.isSubmitting.set(false);
      }
    });
  }

  readonly specificParamLoading = computed(() =>
    this.getSpecificParam.isLoading()
  );
  readonly specificParamData = computed((): ParamsEnterprice | null => {
    const response = this.getSpecificParam.value();
    const data = response?.response as any as ParamsEnterprice;
    return data || null;
  });

  selectKey(key: string): void {
    this.selectedKey.set(key);
    this.cancelEdit();
    this.cancelCreate();
  }

  startEdit(): void {
    const currentValue = this.specificParamData()?.valorParametro || '';
    this.paramForm.patchValue({
      valorParametro: currentValue
    });
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.paramForm.reset();
  }

  startCreate(): void {
    this.paramForm.reset();
    this.isCreating.set(true);
  }

  cancelCreate(): void {
    this.isCreating.set(false);
    this.paramForm.reset();
  }

  saveParam(): void {
    if (this.paramForm.invalid) return;

    this.isSubmitting.set(true);
    const currentParam = this.specificParamData();
    const isUpdate = !!currentParam;

    const paramData: ParamKey = {
      empresa: {
        id: this.enterpriceId()
      },
      llave: this.selectedKey() || '',
      valorParametro: this.paramForm.get('valorParametro')?.value?.toString() || '',
      activo: true,
      usuarioCreacion: this.usuarioCreacion()
    };

    // Si es una actualización, agregar el ID del parámetro existente
    if (isUpdate && currentParam) {
      paramData.id = currentParam.id;
    }

    const successMessage = isUpdate ? 'Parámetro actualizado correctamente.' : 'Parámetro creado correctamente.';

    this.counterEnterpriceService.createParamsEnterprice(paramData).subscribe({
      next: (res: any) => {
        this.toast.success('Éxito', successMessage);
        this.isEditing.set(false);
        this.isCreating.set(false);
        this.isSubmitting.set(false);
        this.paramForm.reset();
        // Recargar ambos conjuntos de datos
        this.getparamasEnterpriceById.reload();
        this.getSpecificParam.reload();
      },
      error: (err: any) => {
        console.error('Error al procesar el parámetro:', err);
        this.toast.error('Error', 'No se pudo procesar el parámetro.');
        this.isSubmitting.set(false);
      }
    });
  }

  // Carousel methods
  getTranslateX(): string {
    // Calcula el desplazamiento para centrar la card activa
    // Cada card tiene 320px (w-80) + 24px gap = 344px
    const cardWidth = 344;
    const offset = this.currentSlide() * cardWidth;
    return `calc(50% - ${offset}px - 172px)`;
  }

  nextSlide(): void {
    this.currentSlide.update(current =>
      current === this.totalSlides - 1 ? 0 : current + 1
    );
    this.expandedCard.set(null);
  }

  prevSlide(): void {
    this.currentSlide.update(current =>
      current === 0 ? this.totalSlides - 1 : current - 1
    );
    this.expandedCard.set(null);
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
    this.expandedCard.set(null);
  }

  toggleCard(cardIndex: number): void {
    if (this.expandedCard() === cardIndex) {
      this.expandedCard.set(null);
    } else {
      this.expandedCard.set(cardIndex);
    }
  }

  isEditingCard(cardIndex: number): boolean {
    return this.editingCards().has(cardIndex);
  }

  toggleEditCard(cardIndex: number): void {
    const editing = new Set(this.editingCards());
    if (editing.has(cardIndex)) {
      editing.delete(cardIndex);
    } else {
      editing.add(cardIndex);
    }
    this.editingCards.set(editing);
  }
}
