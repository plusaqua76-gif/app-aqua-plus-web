import {
  Component,
  computed,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CounterEnterpriceService } from '../../services/counter-enterprice.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ParamsEnterprice } from '@interfaces/params-enterprice/params-enterprice';
import { ParamKey } from '@interfaces/params-enterprice/param-key';
import { ToastService } from '@services/toast.service';
import { BackFill } from "../../components/drag-and-drop/back-fill";

@Component({
  selector: 'app-days-validity',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4"
    >
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Header -->
        <div class="text-center space-y-4">
          <div
            class="mx-auto w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20"
          >
            <i
              class="fas fa-cogs text-3xl text-green-600 dark:text-green-400"
            ></i>
          </div>
          <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-200">
            Configuración de Parámetros
          </h1>
        </div>

        <!-- Loading -->
        <div class="flex justify-center py-8" *ngIf="paramsLoading()">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
          ></div>
        </div>

        <!-- Content -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-6"
          *ngIf="!paramsLoading()"
        >
          <!-- Keys Menu -->
          <div
            class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/30 p-6"
          >
            <h2
              class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4"
            >
              Parámetros Disponibles
            </h2>

            <div class="space-y-2">
              <button
                *ngFor="let key of availableKeys()"
                (click)="selectKey(key)"
                [class]="
                  selectedKey() === key
                    ? 'w-full p-3 text-left rounded-lg bg-blue-500 text-white'
                    : 'w-full p-3 text-left rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                "
              >
                {{ key }}
              </button>
            </div>
          </div>

          <!-- Parameter Details -->
          <div
            class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/30 p-6"
          >
            <h2
              class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4"
            >
              Detalles
            </h2>

            <!-- No selection -->
            <div
              class="text-center py-8 text-gray-500 dark:text-gray-400"
              *ngIf="!selectedKey()"
            >
              <i class="fas fa-hand-pointer text-3xl mb-3"></i>
              <p>Selecciona un parámetro</p>
            </div>

            <!-- Loading specific param -->
            <div
              class="text-center py-8"
              *ngIf="selectedKey() && specificParamLoading()"
            >
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"
              ></div>
              <p class="text-gray-600 dark:text-gray-400">Cargando...</p>
            </div>

            <!-- Show param data -->
            <div
              *ngIf="
                selectedKey() && specificParamData() && !specificParamLoading()
              "
            >
              <div
                class="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4 mb-4"
              >
                <div class="space-y-3">
                  <div>
                    <span class="text-sm text-gray-600 dark:text-gray-400"
                      >Llave:</span
                    >
                    <div class="font-semibold text-gray-800 dark:text-gray-200">
                      {{ selectedKey() }}
                    </div>
                  </div>
                  <div>
                    <span class="text-sm text-gray-600 dark:text-gray-400"
                      >Valor:</span
                    >
                    <div
                      class="text-2xl font-bold text-green-600 dark:text-green-400"
                    >
                      {{ specificParamData()?.valorParametro || '0' }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Edit Form -->
              <div *ngIf="isEditing()" class="mb-4">
                <form [formGroup]="paramForm" (ngSubmit)="saveParam()">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nuevo Valor
                      </label>
                      <input
                        type="number"
                        formControlName="valorParametro"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Ingrese el valor"
                      />
                      <div *ngIf="paramForm.get('valorParametro')?.invalid && paramForm.get('valorParametro')?.touched"
                           class="text-red-500 text-sm mt-1">
                        El valor es requerido
                      </div>
                    </div>
                    <div class="flex space-x-2">
                      <button
                        type="submit"
                        [disabled]="paramForm.invalid || isSubmitting()"
                        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span *ngIf="!isSubmitting()">Guardar</span>
                        <span *ngIf="isSubmitting()" class="flex items-center">
                          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Guardando...
                        </span>
                      </button>
                      <button
                        type="button"
                        (click)="cancelEdit()"
                        class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <!-- Action Buttons -->
              <div *ngIf="!isEditing()" class="flex space-x-2">
                <button
                  (click)="startEdit()"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                >
                  <i class="fas fa-edit mr-2"></i>
                  Actualizar Valor
                </button>
              </div>
            </div>

            <!-- No param found - Create new -->
            <div
              *ngIf="
                selectedKey() && !specificParamData() && !specificParamLoading()
              "
            >
              <div class="text-center py-6 space-y-4">
                <div class="text-yellow-600 dark:text-yellow-400">
                  <i class="fas fa-exclamation-triangle text-3xl mb-3"></i>
                  <p class="text-lg font-medium">
                    No existe un valor para este parámetro
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Configura un valor inicial para empezar
                  </p>
                </div>

                <!-- Create Form -->
                <div *ngIf="isCreating()" class="mt-4">
                  <form [formGroup]="paramForm" (ngSubmit)="saveParam()">
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Valor Inicial
                        </label>
                        <input
                          type="number"
                          formControlName="valorParametro"
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="Ingrese el valor inicial"
                        />
                        <div *ngIf="paramForm.get('valorParametro')?.invalid && paramForm.get('valorParametro')?.touched"
                             class="text-red-500 text-sm mt-1">
                          El valor es requerido
                        </div>
                      </div>
                      <div class="flex space-x-2 justify-center">
                        <button
                          type="submit"
                          [disabled]="paramForm.invalid || isSubmitting()"
                          class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span *ngIf="!isSubmitting()">Crear Parámetro</span>
                          <span *ngIf="isSubmitting()" class="flex items-center">
                            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creando...
                          </span>
                        </button>
                        <button
                          type="button"
                          (click)="cancelCreate()"
                          class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                <!-- Create Button -->
                <div *ngIf="!isCreating()">
                  <button
                    (click)="startCreate()"
                    class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center mx-auto"
                  >
                    <i class="fas fa-plus mr-2"></i>
                    Configurar Parámetro
                  </button>
                </div>
              </div>
            </div>
          </div>
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
      valorParametro: this.paramForm.get('valorParametro')?.value,
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
        this.getparamasEnterpriceById.reload();
        this.getSpecificParam.reload();
      },
      error: (err: any) => {
        console.error('Error al procesar el parámetro:', err);
        this.toast.error('Error', 'No se pudo procesar el parámetro.');
        this.isSubmitting.set(false);
      }
    });
  }}
