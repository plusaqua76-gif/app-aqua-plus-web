import { Component, inject, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EnterpriseService } from '../../service/enterprise.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '@services/toast.service';
import { LocationService } from '@shared/services/location.service';
import { IDepartament } from '@interfaces/Idepartament';
import { ICity } from '@interfaces/Icity';
import { ICorregimiento } from '@interfaces/icorregimiento';


@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  isLoading: boolean = false;
  selectedDepartmentId = signal<number | null>(null);
  selectedCityId = signal<number | null>(null);
  departaments = signal<IDepartament[]>([]);
  cities = signal<ICity[]>([]);
  corregimientos = signal<ICorregimiento[]>([]);
  departmentsLoading = signal<boolean>(false);
  citiesLoading = signal<boolean>(false);
  corregimientosLoading = signal<boolean>(false);
  showPassword: boolean = false;
  previewUrl = signal<string | null>(null);
  previewName = signal<string | null>(null);
  previewSizeKB = signal<number | null>(null);
  private lastObjectUrl?: string;
  selectedFile: File | null = null;

  protected readonly router = inject(Router);
  protected readonly fb = inject(FormBuilder);
  protected readonly locationService = inject(LocationService);
  protected readonly enterpriseService = inject(EnterpriseService);
  protected readonly toast = inject(ToastService);

  constructor() {

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

  ngOnInit(): void {
    this.initializeForm();
    this.loadDepartments();

    this.registerForm
      .get('idDepartamento')
      ?.valueChanges.subscribe((departamentoId) => {
        const numericDeptId = departamentoId ? Number(departamentoId) : null;

        if (this.selectedDepartmentId() !== numericDeptId) {
          this.selectedDepartmentId.set(numericDeptId);
          this.registerForm.patchValue({
            idCiudad: '',
            idCorregimiento: ''
          }, { emitEvent: false });

          this.cities.set([]);
          this.corregimientos.set([]);
        }
      });

    this.registerForm.get('idCiudad')?.valueChanges.subscribe((cityId) => {
      const numericCityId = cityId ? Number(cityId) : null;
      if (this.selectedCityId() !== numericCityId) {
        this.selectedCityId.set(numericCityId);
        this.registerForm.patchValue({
          idCorregimiento: ''
        }, { emitEvent: false });
        this.corregimientos.set([]);
      }
    });
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nombreEmpresa: ['', [Validators.required, Validators.minLength(2)]],
      idDepartamento: ['', [Validators.required]],
      idCiudad: ['', [Validators.required]],
      idCorregimiento: [''],
      descripcionDireccion: [''],
      nit: ['', [Validators.required]],
      correo: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    // Limpia preview anterior
    if (this.lastObjectUrl) {
      URL.revokeObjectURL(this.lastObjectUrl);
      this.lastObjectUrl = undefined;
    }
    this.previewUrl.set(null);
    this.previewName.set(null);
    this.previewSizeKB.set(null);
    this.selectedFile = null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.toast.error('Archivo inválido', 'Por favor selecciona una imagen (png, jpg, webp, etc.)');
      input.value = '';
      return;
    }

    this.selectedFile = file;
    const url = URL.createObjectURL(file);
    this.lastObjectUrl = url;
    this.previewUrl.set(url);
    this.previewName.set(file.name);
    this.previewSizeKB.set(Math.round(file.size / 1024));
  }

  clearSelectedFile(inputEl?: HTMLInputElement) {
    if (this.lastObjectUrl) {
      URL.revokeObjectURL(this.lastObjectUrl);
      this.lastObjectUrl = undefined;
    }
    this.previewUrl.set(null);
    this.previewName.set(null);
    this.previewSizeKB.set(null);
    this.selectedFile = null;
    if (inputEl) inputEl.value = '';
  }

  ngOnDestroy(): void {
    if (this.lastObjectUrl) URL.revokeObjectURL(this.lastObjectUrl);
  }

  private fileToBase64(bytes: number[]): Promise<string> {
    return new Promise<string>((resolve) => {
      const blob = new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remover el prefijo "data:image/...;base64," para obtener solo el base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
  }

  // Método para convertir File a array de bytes
  private async fileToBytes(file: File): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const bytes = Array.from(new Uint8Array(arrayBuffer));
        resolve(bytes);
      };
      reader.onerror = error => reject(error);
    });
  }

  loadDepartments(): void {
    this.departmentsLoading.set(true);
    this.locationService.getDepartamentos().subscribe({
      next: (departaments) => {
        this.departaments.set(departaments.response);
        this.departmentsLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar departamentos:', err);
        this.toast.error('Error', 'No se pudieron cargar los departamentos');
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
      error: (err) => {
        console.error('Error al cargar ciudades:', err);
        this.toast.error('Error', 'No se pudieron cargar las ciudades');
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
      error: (err) => {
        this.toast.error('Error', 'No se pudieron cargar los corregimientos');
        this.corregimientosLoading.set(false);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid) {
      this.isLoading = true;

      try {
        const formData = this.registerForm.value;

        // Preparar datos base
        const empresaData: any = {
          usuario: formData.usuario,
          password: formData.password,
          nombreEmpresa: formData.nombreEmpresa,
          nit: formData.nit,
          correo: formData.correo,
          telefono: formData.telefono,
          idDepartamento: formData.idDepartamento,
          idCiudad: formData.idCiudad,
          idCorregimiento: formData.idCorregimiento || null,
          descripcionDireccion: formData.descripcionDireccion || null,
        };

        if (this.selectedFile) {
          try {
            const bytes = await this.fileToBytes(this.selectedFile);
            const base64Image = await this.fileToBase64(bytes);
            empresaData.imagen = base64Image;
          } catch (error) {
            console.error('Error al convertir imagen a base64:', error);
            this.toast.error('Error', 'No se pudo procesar la imagen seleccionada');
            this.isLoading = false;
            return;
          }
        }

        // console.log('Datos a enviar para registrar empresa:', empresaData);

        this.enterpriseService.registerEnterprise(empresaData).subscribe({
          next: (response) => {
            this.isLoading = false;
            // console.log('Registro de empresa exitoso:', response);

            this.toast.success('Empresa registrada', 'Registro exitoso. Usuario por activar.');

            setTimeout(() => {
              this.router.navigate(['/auth/login']);
            }, 1500);
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Error al registrar empresa:', err);

            this.toast.error(
              'Error al registrar empresa',
              err?.error?.message || err?.message || 'Ocurrió un error inesperado.'
            );
          },
        });
      } catch (error) {
        this.isLoading = false;
        console.error('Error inesperado:', error);
        this.toast.error('Error', 'Ocurrió un error inesperado al procesar el formulario');
      }
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `El campo '${fieldName}' es requerido`;
      }
      if (field.errors['minlength']) {
        return `El campo '${fieldName}' debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['pattern']) {
        return `El campo '${fieldName}' debe contener solo números`;
      }
    }
    return '';
  }
}
