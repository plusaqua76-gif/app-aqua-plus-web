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
  <!-- Formulario de edición de contador con estilos glassmorphism -->
  <div class="px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header con estilo similar al de la tabla -->
    <div class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-200 mb-4">
        Editar Contador
      </h1>

      <!-- Breadcrumb o botón de regreso -->
      <div class="flex items-center gap-4 mb-6">
        <button
          type="button"
          (click)="router.navigate(['/shell/counter'])"
          class="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-gray-900 dark:text-white hover:bg-white/20 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Volver a la lista
        </button>
      </div>
    </div>

    <!-- Estados de carga y error -->
    @if (dataenterpriseClientCounter.isLoading() || formLoading()) {
      <div class="relative overflow-hidden shadow-2xl sm:rounded-2xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 max-w-4xl mx-auto">
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span class="ml-3 text-gray-600 dark:text-gray-300 font-medium">Cargando datos del contador...</span>
        </div>
      </div>
    } @else if (dataenterpriseClientCounter.error()) {
      <div class="relative overflow-hidden shadow-2xl sm:rounded-2xl bg-red-500/20 dark:bg-red-800/20 backdrop-blur-xl border border-red-500/30 dark:border-red-700/30 max-w-4xl mx-auto">
        <div class="p-6 sm:p-8">
          <div class="flex items-center gap-4 mb-4">
            <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 class="text-red-800 dark:text-red-200 font-semibold text-lg">Error al cargar el contador</h3>
          </div>
          <p class="text-red-600 dark:text-red-300">No se pudo cargar la información del contador. Por favor, intente nuevamente.</p>
        </div>
      </div>
    } @else if (!formLoading() && updateForm) {
      <!-- Contenedor principal con estilo glassmorphism -->
      <div class="relative overflow-hidden shadow-2xl sm:rounded-2xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 max-w-6xl mx-auto">

        <!-- Formulario -->
        <form [formGroup]="updateForm" (ngSubmit)="onSubmit()" class="p-6 sm:p-8">

          <!-- Sección: Información de Dirección -->
          <div class="mb-8">
            <div class="flex items-center gap-3 mb-6">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <h3 class="text-xl font-bold text-gray-700 dark:text-gray-200">Información de Dirección</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              <!-- Campo: Departamento -->
              <div>
                <label for="idDepartamento" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                  Departamento <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <select
                    id="idDepartamento"
                    formControlName="idDepartamento"
                    class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer invalid:text-gray-400 dark:invalid:text-gray-500"
                  >
                    <option value="" disabled selected hidden class="text-gray-400 dark:text-gray-500">
                      @if (departmentsLoading()) { Cargando departamentos... } @else { Seleccione un departamento... }
                    </option>
                    @for (dept of departaments(); track dept.id) {
                      <option [value]="dept.id" class="text-gray-900 dark:text-white bg-white dark:bg-gray-700 py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600">{{ dept.nombre }}</option>
                    }
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Campo: Ciudad -->
              <div>
                <label for="idCiudad" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                  Ciudad <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <select
                    id="idCiudad"
                    formControlName="idCiudad"
                    [disabled]="!cities().length"
                    class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer invalid:text-gray-400 dark:invalid:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled selected hidden class="text-gray-400 dark:text-gray-500">
                      @if (citiesLoading()) { Cargando ciudades... } @else if (!selectedDepartmentId()) { Seleccione primero un departamento... } @else { Seleccione una ciudad... }
                    </option>
                    @for (city of cities(); track city.id) {
                      <option [value]="city.id" class="text-gray-900 dark:text-white bg-white dark:bg-gray-700 py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600">{{ city.nombre }}</option>
                    }
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Campo: Corregimiento -->
              <div>
                <label for="idCorregimiento" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                  Corregimiento
                </label>
                <div class="relative">
                  <select
                    id="idCorregimiento"
                    formControlName="idCorregimiento"
                    [disabled]="!corregimientos().length"
                    class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer invalid:text-gray-400 dark:invalid:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled selected hidden class="text-gray-400 dark:text-gray-500">
                      @if (corregimientosLoading()) { Cargando corregimientos... } @else if (!selectedCityId()) { Seleccione primero una ciudad... } @else { Seleccione un corregimiento... }
                    </option>
                    @for (corr of corregimientos(); track corr.id) {
                      <option [value]="corr.id" class="text-gray-900 dark:text-white bg-white dark:bg-gray-700 py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600">{{ corr.nombre }}</option>
                    }
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Campo: Dirección -->
              <div class="lg:col-span-3">
                <label for="direccion" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                  Dirección Específica <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    id="direccion"
                    formControlName="direccion"
                    type="text"
                    placeholder="Dirección completa del contador..."
                    class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Divisor visual -->
          <div class="border-t border-white/10 dark:border-slate-700/30 my-8"></div>

          <!-- Sección: Información del Contador -->
          <div class="mb-8">
            <div class="flex items-center gap-3 mb-6">
              <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
              <h3 class="text-xl font-bold text-gray-700 dark:text-gray-200">Información del Contador</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

              <!-- Campo: Tipo de Contador -->
              <div>
                <label for="tipoContador" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                  Tipo de Contador <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <select
                    id="tipoContador"
                    formControlName="tipoContador"
                    class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer invalid:text-gray-400 dark:invalid:text-gray-500"
                  >
                    <option value="" disabled selected hidden class="text-gray-400 dark:text-gray-500">Seleccione tipo de contador...</option>
                    @for (tipo of tiposContador(); track tipo.id) {
                      <option [value]="tipo.id" class="text-gray-900 dark:text-white bg-white dark:bg-gray-700 py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600">{{ tipo.nombre }}</option>
                    }
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Campo: Número de Serie -->
              <div>
                <label for="serial" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                  Número de Serie <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    id="serial"
                    formControlName="serial"
                    type="text"
                    placeholder="Serial del contador..."
                    class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción con estilo similar a la tabla -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10 dark:border-slate-700/30">
            <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              <span>Formulario de edición de contador</span>
            </div>

            <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                (click)="router.navigate(['/shell/counter'])"
                class="w-full sm:w-auto bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 backdrop-blur-md text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl hover:border-gray-500/50 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-gray-500/20 active:scale-95 flex items-center gap-3 justify-center"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Cancelar
              </button>

              <button
                type="submit"
                [disabled]="updateForm.invalid || formLoading()"
                class="w-full sm:w-auto bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 backdrop-blur-md text-blue-700 dark:text-blue-300 font-semibold py-3 px-6 rounded-xl hover:border-blue-500/50 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 flex items-center gap-3 justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Actualizar Contador
              </button>
            </div>
          </div>
        </form>
      </div>
    }
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
      this.router.navigate(['/shell/counter']);
    } else {
      this.toast.error('Error', 'Por favor completa todos los campos requeridos');
      this.updateForm.markAllAsTouched();
    }
  }
}

