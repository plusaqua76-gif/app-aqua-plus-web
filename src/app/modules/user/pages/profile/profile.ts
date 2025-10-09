import { Component, effect, inject, PLATFORM_ID, OnInit, OnDestroy, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { EnterpriseIdService } from '@services/enterpriceId.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule,isPlatformBrowser } from '@angular/common';
import { ToastService } from '@services/toast.service';
import { LocationService } from '@shared/services/location.service';
import { IDepartament } from '@interfaces/Idepartament';
import { ICity } from '@interfaces/Icity';
import { ICorregimiento } from '@interfaces/icorregimiento';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit, OnDestroy {
  readonly enterpriseService = inject(EnterpriseIdService);
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly fb = inject(FormBuilder);
  readonly toast = inject(ToastService);
  readonly locationService = inject(LocationService);

  profileForm!: FormGroup;
  isLoading = false;
  showPassword = false;

  // Señales para ubicación
  selectedDepartmentId = signal<number | null>(null);
  selectedCityId = signal<number | null>(null);
  departaments = signal<IDepartament[]>([]);
  cities = signal<ICity[]>([]);
  corregimientos = signal<ICorregimiento[]>([]);
  departmentsLoading = signal<boolean>(false);
  citiesLoading = signal<boolean>(false);
  corregimientosLoading = signal<boolean>(false);

  // Manejo de imagen
  previewUrl = signal<string | null>(null);
  previewName = signal<string | null>(null);
  previewSizeKB = signal<number | null>(null);
  private lastObjectUrl?: string;
  selectedFile: File | null = null;

  dataProfile = rxResource({
    stream: () => this.enterpriseService.getEnterpriseInfo()
  });

  constructor() {
    // Effect para cargar ciudades cuando cambia el departamento
    effect(() => {
      const deptId = this.selectedDepartmentId();
      if (deptId) {
        this.loadCities(deptId);
      } else {
        this.cities.set([]);
        this.corregimientos.set([]);
      }
    });

    // Effect para cargar corregimientos cuando cambia la ciudad
    effect(() => {
      const cityId = this.selectedCityId();
      if (cityId) {
        this.loadCorregimientos(cityId);
      } else {
        this.corregimientos.set([]);
      }
    });

    // Effect para cargar datos del perfil en el formulario
    effect(() => {
      const profileData = this.dataProfile.value();
      if (profileData && this.profileForm) {
        this.populateForm(profileData);
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadDepartments();
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    if (this.lastObjectUrl) {
      URL.revokeObjectURL(this.lastObjectUrl);
    }
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      password: [''], // Opcional para actualización
      nombreEmpresa: ['', [Validators.required, Validators.minLength(2)]],
      idDepartamento: ['', [Validators.required]],
      idCiudad: ['', [Validators.required]],
      idCorregimiento: [''],
      descripcionDireccion: [''],
      nit: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
    });
  }

  private setupFormSubscriptions(): void {
    // Suscripción para cambios en departamento
    this.profileForm.get('idDepartamento')?.valueChanges.subscribe((departamentoId) => {
      const numericDeptId = departamentoId ? Number(departamentoId) : null;

      if (this.selectedDepartmentId() !== numericDeptId) {
        this.selectedDepartmentId.set(numericDeptId);
        this.profileForm.patchValue({
          idCiudad: '',
          idCorregimiento: ''
        }, { emitEvent: false });

        this.cities.set([]);
        this.corregimientos.set([]);
      }
    });

    // Suscripción para cambios en ciudad
    this.profileForm.get('idCiudad')?.valueChanges.subscribe((cityId) => {
      const numericCityId = cityId ? Number(cityId) : null;
      if (this.selectedCityId() !== numericCityId) {
        this.selectedCityId.set(numericCityId);
        this.profileForm.patchValue({
          idCorregimiento: ''
        }, { emitEvent: false });
        this.corregimientos.set([]);
      }
    });
  }

  private populateForm(data: any): void {
    this.profileForm.patchValue({
      usuario: data.usuario || '',
      nombreEmpresa: data.nombreEmpresa || '',
      nit: data.nit || '',
      correo: data.correo || '',
      telefono: data.telefono || '',
      idDepartamento: data.idDepartamento || '',
      idCiudad: data.idCiudad || '',
      idCorregimiento: data.idCorregimiento || '',
      descripcionDireccion: data.descripcionDireccion || ''
    });

    // Establecer los IDs seleccionados para cargar ubicaciones
    if (data.idDepartamento) {
      this.selectedDepartmentId.set(Number(data.idDepartamento));
    }
    if (data.idCiudad) {
      this.selectedCityId.set(Number(data.idCiudad));
    }
  }

  // Métodos de carga de ubicaciones (igual que en register)
  private loadDepartments(): void {
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

  private loadCities(departmentId: number): void {
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

  // Métodos de manejo de archivos (igual que en register)
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

  clearSelectedFile(inputEl?: HTMLInputElement): void {
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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Métodos de utilidad para el formulario
  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `El campo es requerido`;
      }
      if (field.errors['minlength']) {
        return `Debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['email']) {
        return `Debe ser un correo válido`;
      }
    }
    return '';
  }

  resetForm(): void {
    const profileData = this.dataProfile.value();
    if (profileData) {
      this.populateForm(profileData);
    }
    this.clearSelectedFile();
    this.profileForm.markAsUntouched();
  }

  // Métodos de conversión de archivos (igual que en register)
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

  private fileToBase64(bytes: number[]): Promise<string> {
    return new Promise<string>((resolve) => {
      const blob = new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
  }

  async onSubmit(): Promise<void> {
    if (!this.profileForm.valid) {
      this.toast.warning('Advertencia', 'Por favor completa todos los campos requeridos');
      return;
    }

    this.isLoading = true;

    try {
      const formData = this.profileForm.value;

      // Preparar datos para actualización
      const updateData: any = {
        usuario: formData.usuario,
        nombreEmpresa: formData.nombreEmpresa,
        nit: formData.nit,
        correo: formData.correo,
        telefono: formData.telefono,
        idDepartamento: formData.idDepartamento,
        idCiudad: formData.idCiudad,
        idCorregimiento: formData.idCorregimiento || null,
        descripcionDireccion: formData.descripcionDireccion || null,
      };

      // Solo incluir contraseña si se ingresó una nueva
      if (formData.password && formData.password.trim()) {
        updateData.password = formData.password;
      }

      // Incluir imagen si se seleccionó una nueva
      if (this.selectedFile) {
        try {
          const bytes = await this.fileToBytes(this.selectedFile);
          const base64Image = await this.fileToBase64(bytes);
          updateData.imagen = base64Image;
        } catch (error) {
          console.error('Error al convertir imagen a base64:', error);
          this.toast.error('Error', 'No se pudo procesar la imagen seleccionada');
          this.isLoading = false;
          return;
        }
      }

      // Aquí deberías llamar al servicio de actualización
      // this.enterpriseService.updateEnterprise(updateData).subscribe({...})

      // Por ahora simularemos la actualización
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.toast.success('Éxito', 'Perfil actualizado correctamente');

      // Recargar datos del perfil
      this.dataProfile.reload();

    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      this.toast.error('Error', 'No se pudo actualizar el perfil');
    } finally {
      this.isLoading = false;
    }
  }
}
