import { Component, inject, PLATFORM_ID, computed, effect, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { EnterpriseInformationService } from '../../services/enterprice.service';
import { catchError, EMPTY, of } from 'rxjs';
import { EnterpriseIdService } from '@services/enterpriceId.service';
import { LocationService } from '@shared/services/location.service';
import { ToastService } from '@services/toast.service';
import { IDepartament } from '@interfaces/Idepartament';
import { ICity } from '@interfaces/Icity';
import { ICorregimiento } from '@interfaces/icorregimiento';
import { IEnterpriseResponse } from '@interfaces/Ienterprise';
import { IImageEnterprise } from '../../services/enterprice.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
<div class="min-h-screen py-8">
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

    @let enterpriseResponse = dataEnterprice.value();
    @let enterprise = enterpriseResponse && 'response' in enterpriseResponse ? enterpriseResponse.response : null;

    @if (dataEnterprice.isLoading()) {
      <!-- Loading State -->
      <div class="flex items-center justify-center py-12">
        <div class="backdrop-blur-xl bg-white/20 dark:bg-slate-800/20 rounded-3xl border border-white/20 dark:border-slate-700/30 shadow-2xl p-8">
          <div class="flex items-center space-x-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p class="text-gray-700 dark:text-gray-200">Cargando información...</p>
          </div>
        </div>
      </div>
    } @else if (enterprise) {

      <!-- Profile Card -->
      <div class="relative overflow-hidden shadow-2xl rounded-3xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/20 dark:border-slate-700/30">

        <!-- Close Button -->
        <button class="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 dark:bg-slate-700/50 backdrop-blur-md border border-white/20 dark:border-slate-600/50 flex items-center justify-center hover:bg-white/20 dark:hover:bg-slate-600/50 transition-all duration-300">
          <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Profile Header -->
        <div class="relative px-8 py-12 text-center">
          <div class="absolute inset-0 bg-gradient-to-br from-blue-100/30 to-purple-100/30 dark:from-blue-900/20 dark:to-purple-900/20"></div>

          <div class="relative z-10">
            <!-- Profile Image -->
            <div class="relative inline-block group">
              @if (imagePreview()) {
                <!-- Preview de nueva imagen -->
                <img
                  class="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
                  [src]="imagePreview()!"
                  alt="Preview"
                />
              } @else if (enterpriseInfo.value()?.imagen?.[0]?.imagen) {
                <!-- Imagen actual -->
                <img
                  class="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
                  [src]="'data:' + (enterpriseInfo.value()?.imagen?.[0]?.contentType || 'image/png') + ';base64,' + enterpriseInfo.value()?.imagen?.[0]?.imagen"
                  [alt]="enterprise.nombre"
                  (error)="onImageError($event)"
                />
              } @else {
                <!-- Placeholder -->
                <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-white shadow-xl flex items-center justify-center">
                  <span class="text-3xl font-bold text-white">
                    {{ enterprise.nombre.charAt(0) || "E" }}
                  </span>
                </div>
              }

            <!-- Edit Overlay -->
            <div class="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                 (click)="fileInput.click()">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>              <!-- Input file oculto -->
              <input
                #fileInput
                type="file"
                accept="image/*"
                (change)="onImageFileSelected($event)"
                class="hidden"
              />
            </div>

            <!-- Name and Title -->
            <h1 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">{{ enterprise.nombre }}</h1>
            <p class="mt-2 text-lg text-gray-600 dark:text-gray-300">Información de la Empresa</p>

            <!-- Status Badge -->
            <div class="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                 [class]="enterprise.activo ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'">
              <div class="w-2 h-2 rounded-full mr-2"
                   [class]="enterprise.activo ? 'bg-green-500' : 'bg-red-500'"></div>
              {{ enterprise.activo ? 'Activo' : 'Inactivo' }}
            </div>

            <!-- Image Action Buttons -->
            @if (selectedImageFile()) {
              <div class="mt-4 flex items-center justify-center gap-2">
                <button
                  (click)="updateEnterpriseImage()"
                  [disabled]="isUpdatingImage()"
                  class="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 backdrop-blur-md text-green-700 dark:text-green-300 font-medium rounded-lg hover:border-green-500/50 transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                  @if (isUpdatingImage()) {
                    <div class="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  } @else {
                    Guardar
                  }
                </button>
                <button
                  (click)="cancelImageUpdate()"
                  [disabled]="isUpdatingImage()"
                  class="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 backdrop-blur-md text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:border-gray-500/50 transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                  Cancelar
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Form Content -->
        <form [formGroup]="updateForm" class="px-8 pb-8 space-y-6">

          <!-- Basic Information Section -->
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
              <!-- Nombre -->
              <div>
                <label for="nombre" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                  Nombre de la empresa <span class="text-red-500">*</span>
                </label>
                <input
                  id="nombre"
                  type="text"
                  formControlName="nombre"
                  class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                  placeholder="Nombre de la empresa"
                />
                @if (updateForm.get('nombre')?.invalid && updateForm.get('nombre')?.touched) {
                  <p class="mt-1 text-sm text-red-500">El nombre es requerido</p>
                }
              </div>

              <!-- NIT -->
              <div>
                <label for="nit" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                  NIT <span class="text-red-500">*</span>
                </label>
                <input
                  id="nit"
                  type="text"
                  formControlName="nit"
                  class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                  placeholder="Número de identificación tributaria"
                />
                @if (updateForm.get('nit')?.invalid && updateForm.get('nit')?.touched) {
                  <p class="mt-1 text-sm text-red-500">El NIT es requerido</p>
                }
              </div>

              <!-- Código -->
              <div>
                <label for="codigo" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                  Código <span class="text-red-500">*</span>
                </label>
                <input
                  id="codigo"
                  type="text"
                  formControlName="codigo"
                  class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                  placeholder="Código de la empresa"
                />
                @if (updateForm.get('codigo')?.invalid && updateForm.get('codigo')?.touched) {
                  <p class="mt-1 text-sm text-red-500">El código es requerido</p>
                }
              </div>

              <!-- Estado -->
              <div>
                <label for="activo" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                  Estado
                </label>
                <select
                  id="activo"
                  formControlName="activo"
                  class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Location Section -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Ubicación</h3>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Departamento -->
              <div>
                <label for="idDepartamento" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                  Departamento <span class="text-red-500">*</span>
                </label>
                <select
                  id="idDepartamento"
                  formControlName="idDepartamento"
                  class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer"
                >
                  <option value="">{{ enterprise?.departamento || 'Seleccione departamento' }}</option>
                  @if (departmentsLoading()) {
                    <option disabled>Cargando...</option>
                  } @else {
                    @for (dept of departaments(); track dept.id) {
                      <option [value]="dept.id">{{ dept.nombre }}</option>
                    }
                  }
                </select>
                @if (updateForm.get('idDepartamento')?.invalid && updateForm.get('idDepartamento')?.touched) {
                  <p class="mt-1 text-sm text-red-500">El departamento es requerido</p>
                }
              </div>

              <!-- Ciudad -->
              <div>
                <label for="idCiudad" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                  Ciudad <span class="text-red-500">*</span>
                </label>
                <select
                  id="idCiudad"
                  formControlName="idCiudad"
                  [disabled]="!selectedDepartmentId()"
                  class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{{ enterprise?.ciudad || 'Seleccione ciudad' }}</option>
                  @if (citiesLoading()) {
                    <option disabled>Cargando...</option>
                  } @else {
                    @for (city of cities(); track city.id) {
                      <option [value]="city.id">{{ city.nombre }}</option>
                    }
                  }
                </select>
                @if (updateForm.get('idCiudad')?.invalid && updateForm.get('idCiudad')?.touched) {
                  <p class="mt-1 text-sm text-red-500">La ciudad es requerida</p>
                }
              </div>

              <!-- Corregimiento -->
              <div>
                <label for="idCorregimiento" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                  Corregimiento
                </label>
                <select
                  id="idCorregimiento"
                  formControlName="idCorregimiento"
                  [disabled]="!selectedCityId()"
                  class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{{ enterprise?.corregimiento || 'Seleccione corregimiento' }}</option>
                  @if (corregimientosLoading()) {
                    <option disabled>Cargando...</option>
                  } @else {
                    @for (corr of corregimientos(); track corr.id) {
                      <option [value]="corr.id">{{ corr.nombre }}</option>
                    }
                  }
                </select>
              </div>
            </div>

            <!-- Dirección -->
            <div>
              <label for="direccion" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                Dirección
              </label>
              <textarea
                id="direccion"
                formControlName="direccion"
                rows="3"
                class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 resize-none"
                placeholder="Dirección completa de la empresa"
              ></textarea>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-center gap-4 pt-4">
            <button
              type="button"
              (click)="saveChanges()"
              [disabled]="isUpdating() || updateForm.invalid"
              class="px-8 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 backdrop-blur-md text-blue-700 dark:text-blue-300 font-medium rounded-xl hover:border-blue-500/50 transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg">
              @if (isUpdating()) {
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </div>
              } @else {
                Guardar Cambios
              }
            </button>
          </div>
        </form>
      </div>

    } @else if (enterpriseResponse && !enterpriseResponse.success) {
      <!-- Error State -->
      <div class="bg-red-500/10 dark:bg-red-900/20 border border-red-500/20 dark:border-red-800/50 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl">
        <svg class="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <h3 class="text-lg font-medium text-red-800 dark:text-red-100 mb-2">Error al cargar información</h3>
        <p class="text-red-700 dark:text-red-200">{{ enterpriseResponse.message }}</p>
      </div>
    } @else {
      <!-- No Data State -->
      <div class="bg-yellow-500/10 dark:bg-yellow-900/20 border border-yellow-500/20 dark:border-yellow-800/50 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl">
        <svg class="mx-auto h-16 w-16 text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3 class="text-lg font-medium text-yellow-800 dark:text-yellow-100 mb-2">Sin información</h3>
        <p class="text-yellow-700 dark:text-yellow-200">No se pudo cargar la información de la empresa</p>
      </div>
    }
  </div>
</div>
  `,
  styles: []
})
export class Profile {

  // Signals para formulario
  updateForm!: FormGroup;

  // Signals para imagen
  isUpdatingImage = signal<boolean>(false);
  selectedImageFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  // Signals para ubicación
  selectedDepartmentId = signal<number | null>(null);
  selectedCityId = signal<number | null>(null);
  departaments = signal<IDepartament[]>([]);
  cities = signal<ICity[]>([]);
  corregimientos = signal<ICorregimiento[]>([]);
  departmentsLoading = signal<boolean>(false);
  citiesLoading = signal<boolean>(false);
  corregimientosLoading = signal<boolean>(false);
  isUpdating = signal<boolean>(false);

  private readonly fb = inject(FormBuilder);
  private readonly locationService = inject(LocationService);
  private readonly toast = inject(ToastService);

  constructor() {
    this.initializeForm();

    effect(() => {
      const enterpriseResponse = this.dataEnterprice.value();
      const enterprise = enterpriseResponse && 'response' in enterpriseResponse ? enterpriseResponse.response : null;
      if (enterprise) {
        this.updateFormWithEnterpriseData(enterprise);
        this.loadDepartments();
      }
    });

    // Effects para cascada de ubicación
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
  }

  private initializeForm(): void {
    this.updateForm = this.fb.group({
      nombre: ['', [Validators.required]],
      nit: ['', [Validators.required]],
      codigo: ['', [Validators.required]],
      activo: [true],
      idDepartamento: [''],
      idCiudad: [''],
      idCorregimiento: [''],
      direccion: ['']
    });

    // Configurar cascada de ubicación
    this.updateForm.get('idDepartamento')?.valueChanges.subscribe(value => {
      const deptId = value ? Number(value) : null;
      this.selectedDepartmentId.set(deptId);

      if (deptId) {
        this.updateForm.patchValue({ idCiudad: '', idCorregimiento: '' });
      }
    });

    this.updateForm.get('idCiudad')?.valueChanges.subscribe(value => {
      const cityId = value ? Number(value) : null;
      this.selectedCityId.set(cityId);

      if (cityId) {
        this.updateForm.patchValue({ idCorregimiento: '' });
      }
    });
  }

  private updateFormWithEnterpriseData(enterprise: any): void {
    this.updateForm.patchValue({
      nombre: enterprise.nombre || '',
      nit: enterprise.nit || '',
      codigo: enterprise.codigo || '',
      activo: enterprise.activo !== undefined ? enterprise.activo : true,
      descripcionDireccion: enterprise.descripcionDireccion || ''
    });
  }

  saveChanges(): void {
    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      this.toast.error('Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    const formData = this.updateForm.value;
    const enterpriseResponse = this.dataEnterprice.value();
    const enterprise = enterpriseResponse && 'response' in enterpriseResponse ? enterpriseResponse.response : null;

    if (!enterprise?.id) {
      this.toast.error('Error', 'No se pudo obtener el ID de la empresa');
      return;
    }

    // Crear el payload con la estructura correcta para IEnterpriseResponse
    const updatePayload: IEnterpriseResponse = {
      id: enterprise.id,
      nombre: formData.nombre,
      nit: formData.nit,
      codigo: formData.codigo,
      activo: formData.activo === 'true' || formData.activo === true,
      departamento: this.departaments().find(d => d.id === Number(formData.idDepartamento))?.nombre || enterprise.departamento,
      ciudad: this.cities().find(c => c.id === Number(formData.idCiudad))?.nombre || enterprise.ciudad,
      corregimiento: formData.idCorregimiento ?
        this.corregimientos().find(c => c.id === Number(formData.idCorregimiento))?.nombre || enterprise.corregimiento :
        enterprise.corregimiento,
      descripcionDireccion: formData.direccion || enterprise.descripcionDireccion
    };

    this.isUpdating.set(true);

    this.enterpriseInformationService.updateEnterprice(updatePayload).subscribe({
      next: (response: any) => {
        this.toast.success('Éxito', 'Empresa actualizada correctamente');
        this.isUpdating.set(false);
        // Recargar los datos
        this.dataEnterprice.reload();
      },
      error: (error: any) => {
        console.error('Error al actualizar la empresa:', error);
        this.toast.error('Error', 'Error al actualizar la empresa');
        this.isUpdating.set(false);
      }
    });
  }

  // Métodos para cargar ubicaciones
  loadDepartments(): void {
    this.departmentsLoading.set(true);
    this.locationService.getDepartamentos().subscribe({
      next: (departaments) => {
        this.departaments.set(departaments.response);
        this.departmentsLoading.set(false);
      },
      error: () => {
        this.departmentsLoading.set(false);
      }
    });
  }

  loadCities(departmentId: number): void {
    this.citiesLoading.set(true);
    this.locationService.getCiudades(departmentId).subscribe({
      next: (cities) => {
        this.cities.set(cities.response);
        this.citiesLoading.set(false);
      },
      error: () => {
        this.citiesLoading.set(false);
      }
    });
  }

  loadCorregimientos(cityId: number): void {
    this.corregimientosLoading.set(true);
    this.locationService.getCorregimientos(cityId).subscribe({
      next: (corregimientos) => {
        this.corregimientos.set(corregimientos.response);
        this.corregimientosLoading.set(false);
      },
      error: () => {
        this.corregimientosLoading.set(false);
      }
    });
  }

  // Métodos para manejo de imagen
  onImageFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.toast.error('Error', 'Por favor seleccione un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toast.error('Error', 'La imagen no debe ser mayor a 5MB');
        return;
      }

      this.selectedImageFile.set(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  updateEnterpriseImage(): void {
    const file = this.selectedImageFile();
    if (!file) return;

    const enterpriseId = this.enterpriceId();
    if (!enterpriseId) {
      this.toast.error('Error', 'No se encontró el ID de la empresa');
      return;
    }

    this.isUpdatingImage.set(true);

    // Para actualizar imagen, necesitamos convertir a base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      const currentImagePath = this.enterpriseInfo.value()?.imagen?.[0]?.ruta || '';
      const imageData: IImageEnterprise = {
        ruta: currentImagePath,
        imagen: base64Data
      };

      this.enterpriseInformationService.updateImageEnterprice(imageData).subscribe({
        next: (response: any) => {
          this.toast.success('Éxito', 'Imagen actualizada correctamente');
          this.selectedImageFile.set(null);
          this.imagePreview.set(null);
          this.isUpdatingImage.set(false);
          // Recargar información de la empresa
          this.enterpriseInfo.reload();
        },
        error: (error: any) => {
          console.error('Error al actualizar imagen:', error);
          this.toast.error('Error', 'Error al actualizar la imagen');
          this.isUpdatingImage.set(false);
        }
      });
    };

    reader.readAsDataURL(file);
  }

  cancelImageUpdate(): void {
    this.selectedImageFile.set(null);
    this.imagePreview.set(null);
  }

  onImageError(event: any) {
    console.error('Error loading image:', event);
  }

  private readonly enterpriseInformationService = inject(EnterpriseInformationService);
  private readonly enterpriseIdService = inject(EnterpriseIdService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (e) {
      return null;
    }
  });

  readonly empresaId = computed(() => {
    const data = this.userData();
    return data?.empresaId || 0;
  });

  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || 'admin';
  });

  readonly enterpriceId = computed(() => {
    const data = this.userData();
    const id = data?.empresaId || 0;
    return id;
  });

  dataEnterprice = rxResource({
    params: () => ({ enterpriseId: this.empresaId() }),
    stream: ({ params: { enterpriseId } }) =>
      enterpriseId
        ? this.enterpriseInformationService
            .getEnterpriseInformation(enterpriseId)
            .pipe(
              catchError((error) => {
                console.error('Error loading enterprise data:', error);
                return of({
                  success: false,
                  message: 'Error al cargar los datos de la empresa'
                });
              })
            )
        : EMPTY,
  });

  enterpriseInfo = rxResource({
    stream: () => this.enterpriseIdService.getEnterpriseInfo(),
  });
}
