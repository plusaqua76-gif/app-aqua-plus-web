import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { map, of } from 'rxjs';
import { CounterService } from '../../service/counter.service';
import { ITypeCounter } from '@interfaces/ItypeCounter';
import { AddressService } from '../../service/address.service';
import { ToastService } from '@services/toast.service';
import { TypeCounterService } from '../../service/typeCounter.service';
import { LocationService } from '@shared/services/location.service';
import { IDepartament } from '@interfaces/Idepartament';
import { ICity } from '@interfaces/Icity';
import { ICorregimiento } from '@interfaces/icorregimiento';

@Component({
  selector: 'app-update-counter',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex items-center justify-center py-4">
    <div class="max-w-4xl w-full mx-auto p-6">
        @if (dataenterpriseClientCounter.isLoading() || formLoading()) {
            <div class="flex justify-center items-center py-8">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span class="ml-3 text-gray-600 dark:text-gray-300">Cargando datos del contador...</span>
            </div>
        } @else if (!formLoading() && updateForm) {
            <form [formGroup]="updateForm" (ngSubmit)="onSubmit()" class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg dark:shadow-gray-700/50 border border-gray-200 dark:border-gray-700">
                <h2 class="text-2xl font-semibold text-center mb-6 text-gray-900 dark:text-white">Editar Contador</h2>

                <!-- Datos de Dirección -->
                <div class="mb-8">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Dirección</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <!-- Departamento -->
                        <div class="flex flex-col">
                            <label class="mb-1 font-medium text-gray-700 dark:text-white">Departamento:</label>
                            <select
                                formControlName="idDepartamento"
                                class="p-3 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            >
                                <option value="">Seleccionar departamento</option>
                                @for (dept of departaments(); track dept.id) {
                                    <option [value]="dept.id">{{ dept.nombre }}</option>
                                }
                            </select>
                        </div>

                        <!-- Ciudad -->
                        <div class="flex flex-col">
                            <label class="mb-1 font-medium text-gray-700 dark:text-white">Ciudad:</label>
                            <select
                                formControlName="idCiudad"
                                [disabled]="!cities().length"
                                class="p-3 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-50"
                            >
                                <option value="">Seleccionar ciudad</option>
                                @for (city of cities(); track city.id) {
                                    <option [value]="city.id">{{ city.nombre }}</option>
                                }
                            </select>
                        </div>

                        <!-- Corregimiento -->
                        <div class="flex flex-col">
                            <label class="mb-1 font-medium text-gray-700 dark:text-white">Corregimiento:</label>
                            <select
                                formControlName="idCorregimiento"
                                [disabled]="!corregimientos().length"
                                class="p-3 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:opacity-50"
                            >
                                <option value="">Seleccionar corregimiento</option>
                                @for (corr of corregimientos(); track corr.id) {
                                    <option [value]="corr.id">{{ corr.nombre }}</option>
                                }
                            </select>
                        </div>

                        <!-- Dirección -->
                        <div class="flex flex-col lg:col-span-3">
                            <label class="mb-1 font-medium text-gray-700 dark:text-white">Dirección Específica:</label>
                            <input
                                type="text"
                                formControlName="direccion"
                                class="p-3 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            />
                        </div>
                    </div>
                </div>

                <!-- Datos del Contador -->
                <div class="mb-8">
                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Información del Contador</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <!-- Tipo de Contador -->
                        <div class="flex flex-col">
                            <label class="mb-1 font-medium text-gray-700 dark:text-white">Tipo de Contador:</label>
                            <select
                                formControlName="tipoContador"
                                class="p-3 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            >
                                <option value="">Seleccionar tipo</option>
                                @for (tipo of tiposContador(); track tipo.id) {
                                    <option [value]="tipo.id">{{ tipo.nombre }}</option>
                                }
                            </select>
                        </div>

                        <!-- Número de Serie -->
                        <div class="flex flex-col">
                            <label class="mb-1 font-medium text-gray-700 dark:text-white">Número de Serie:</label>
                            <input
                                type="text"
                                formControlName="serial"
                                class="p-3 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            />
                        </div>
                    </div>
                </div>

                <!-- Botones -->
                <div class="flex justify-center gap-4 mt-8">
                    <button
                        type="button"
                        (click)="router.navigate(['/counter'])"
                        class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-md shadow-md cursor-pointer transition-colors duration-200"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        [disabled]="updateForm.invalid || formLoading()"
                        class="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-md shadow-md dark:shadow-gray-700/50 cursor-pointer transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Actualizar Contador
                    </button>
                </div>
            </form>
        } @else if (dataenterpriseClientCounter.error()) {
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 class="text-red-800 dark:text-red-200 font-medium mb-2">Error al cargar el contador</h3>
                <p class="text-red-600 dark:text-red-300">No se pudo cargar la información del contador. Por favor, intente nuevamente.</p>
            </div>
        }
    </div>
</div>
  `
})
export class UpdateCounter implements OnInit {
  updateForm!: FormGroup;
  counterId: number | null = null;

  // Signals para manejar selects en cascada
  selectedDepartmentId = signal<number | null>(null);
  selectedCityId = signal<number | null>(null);
  departaments = signal<IDepartament[]>([]);
  cities = signal<ICity[]>([]);
  corregimientos = signal<ICorregimiento[]>([]);
  tiposContador = signal<ITypeCounter[]>([]);

  // Loading states
  departmentsLoading = signal<boolean>(false);
  citiesLoading = signal<boolean>(false);
  corregimientosLoading = signal<boolean>(false);
  formLoading = signal<boolean>(true);

  private readonly route = inject(ActivatedRoute);
  public readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly counterService = inject(CounterService);
  private readonly typeCounterService = inject(TypeCounterService);
  private readonly addressService = inject(AddressService);
  private readonly locationService = inject(LocationService);
  protected readonly toast = inject(ToastService);

  dataenterpriseClientCounter = rxResource({
    params: () => {
      const counterId = Number(this.route.snapshot.paramMap.get('id'));
      return counterId || null;
    },
    stream: ({ params: counterId }) => {
      if (counterId) {
        const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
        const enterpriseId = userData?.empresaId;
        if (enterpriseId) {
          return this.counterService.getAllCounterByIdEnterprise(enterpriseId).pipe(
            map(counters => counters.find(counter => counter.id === counterId) || null)
          );
        }
      }
      return of(null);
    }
  });

  constructor() {
    this.initializeForm();
    effect(() => {
      const deptId = this.selectedDepartmentId();
      if (deptId) {
        this.loadCities(deptId);
      } else {
        this.cities.set([]);
        this.corregimientos.set([]);
      }
    });

    effect(() => {
      const cityId = this.selectedCityId();
      if (cityId) {
        this.loadCorregimientos(cityId);
      } else {
        this.corregimientos.set([]);
      }
    });
    effect(() => {
      const counterRow = this.dataenterpriseClientCounter.value();
      const isLoading = this.dataenterpriseClientCounter.isLoading();
      const hasError = this.dataenterpriseClientCounter.error();

      if (counterRow) {
        this.counterId = counterRow.id;
        this.populateForm(counterRow);
        this.formLoading.set(false);
      } else if (!isLoading && hasError) {
        this.formLoading.set(false);
      } else if (!isLoading && !counterRow) {
        this.formLoading.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFormSubscriptions();
  }

  private initializeForm(): void {
    this.updateForm = this.fb.group({
      idDepartamento: ['', Validators.required],
      idCiudad: ['', Validators.required],
      idCorregimiento: [''],
      direccion: ['', Validators.required],
      tipoContador: [null, Validators.required],
      serial: ['', Validators.required]
    });
  }  private loadInitialData(): void {
    this.loadDepartments();
    this.loadTiposContador();
  }

  private setupFormSubscriptions(): void {
    this.updateForm.get('idDepartamento')?.valueChanges.subscribe((departamentoId) => {
      const numericDeptId = departamentoId ? Number(departamentoId) : null;
      if (this.selectedDepartmentId() !== numericDeptId) {
        this.selectedDepartmentId.set(numericDeptId);
        this.updateForm.patchValue({
          idCiudad: '',
          idCorregimiento: ''
        }, { emitEvent: false });
        this.cities.set([]);
        this.corregimientos.set([]);
      }
    });

    this.updateForm.get('idCiudad')?.valueChanges.subscribe((cityId) => {
      const numericCityId = cityId ? Number(cityId) : null;
      if (this.selectedCityId() !== numericCityId) {
        this.selectedCityId.set(numericCityId);
        this.updateForm.patchValue({
          idCorregimiento: ''
        }, { emitEvent: false });
        this.corregimientos.set([]);
      }
    });
  }

  private populateForm(counterRow: any): void {
    // Por ahora populamos con los datos básicos disponibles
    // En una implementación completa, necesitarías un servicio que devuelva todos los datos del contador
    this.updateForm.patchValue({
      serial: counterRow.serial,
      direccion: counterRow.direccion,
      // Los demás datos del cliente y dirección necesitarían venir del backend
    });

    // Buscar y seleccionar el tipo de contador
    const types = this.tiposContador();
    const matchingType = types.find(type => type.nombre === counterRow.tipoContador);
    if (matchingType) {
      this.updateForm.patchValue({ tipoContador: matchingType.id });
    }
  }

  private loadDepartments(): void {
    this.departmentsLoading.set(true);
    this.locationService.getDepartamentos().subscribe({
      next: (departaments) => {
        this.departaments.set(departaments.response);
        this.departmentsLoading.set(false);
      },
      error: (err) => {
        this.toast.error('Error', 'No se pudieron cargar los departamentos');
        this.departmentsLoading.set(false);
      }
    });
  }

  private loadCities(departmentId: number): void {
    this.citiesLoading.set(true);
    this.locationService.getCiudades(departmentId).subscribe({
      next: (cities) => {
        this.cities.set(cities.response);
        this.citiesLoading.set(false);
      },
      error: (err) => {
        this.toast.error('Error', 'No se pudieron cargar las ciudades');
        this.citiesLoading.set(false);
      }
    });
  }

  private loadCorregimientos(cityId: number): void {
    this.corregimientosLoading.set(true);
    this.locationService.getCorregimientos(cityId).subscribe({
      next: (corregimientos) => {
        this.corregimientos.set(corregimientos.response);
        this.corregimientosLoading.set(false);
      },
      error: (err) => {
        this.toast.error('Error', 'No se pudieron cargar los corregimientos');
        this.corregimientosLoading.set(false);
      }
    });
  }

  private loadTiposContador(): void {
    this.typeCounterService.getAllTypeCounters().subscribe({
      next: (response) => {
        this.tiposContador.set(response.response);
      },
      error: (err) => {
        this.toast.error('Error', 'No se pudieron cargar los tipos de contador');
      }
    });
  }

  onSubmit(): void {
    if (this.updateForm.valid && this.counterId) {
      this.toast.success('Éxito', 'Contador actualizado correctamente.');
      this.router.navigate(['/counter']);
    } else {
      this.toast.error('Error', 'Por favor completa todos los campos requeridos');
      this.updateForm.markAllAsTouched();
    }
  }
}

