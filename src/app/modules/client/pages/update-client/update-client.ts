import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, signal, effect, PLATFORM_ID, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '@services/toast.service';
import { PersonService } from '../../service/person.service';
import { TypeDocumentService } from '../../service/typeDocument.service';
import { IDepartament } from '@interfaces/Idepartament';
import { ICity } from '@interfaces/Icity';
import { ICorregimiento } from '@interfaces/icorregimiento';
import { ITipoDocumento } from '@interfaces/Iuser';
import { IPerson } from '@interfaces/Iperson';
import { LocationService } from '@shared/services/location.service';


@Component({
  selector: 'app-update-client',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-client.html',
  providers: [DatePipe]
})
export class UpdateClient implements OnInit {

  updateForm!: FormGroup;

  selectedDepartmentId = signal<number | null>(null);
  selectedCityId = signal<number | null>(null);
  selectedClient = signal<IPerson | null>(null);

  departamentos = signal<IDepartament[]>([]);
  ciudades = signal<ICity[]>([]);
  corregimientos = signal<ICorregimiento[]>([]);
  tiposDocumento = signal<ITipoDocumento[]>([]);

  departmentsLoading = signal<boolean>(false);
  citiesLoading = signal<boolean>(false);
  corregimientosLoading = signal<boolean>(false);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly personService = inject(PersonService);
  private readonly locationService = inject(LocationService);
  private readonly typeDocumentService = inject(TypeDocumentService);
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

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

  readonly usuarioModificacion = computed(() => {
    const data = this.userData();
    return data?.nombre || 'admin';
  });

  constructor() {
    effect(() => {
      const deptId = this.selectedDepartmentId();
      if (deptId) {
        this.loadCities(deptId);
      } else {
        this.ciudades.set([]);
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
    this.loadInitialData();
    this.setupFormValueChanges();

    const navigation = this.router.getCurrentNavigation();
    const clienteData = navigation?.extras?.state?.['clienteData'] || history.state?.clienteData;

    if (clienteData) {
      this.selectedClient.set(clienteData);
      this.loadClientFromData(clienteData);
    } else {
      this.toast.error('Error', 'No se pudo obtener la información del cliente');
      this.router.navigate(['/client']);
    }
  }  private initializeForm(): void {
    this.updateForm = this.fb.group({
      tipoDocumento: [null, [Validators.required]],
      numeroDocumento: ['', [Validators.required]],
      primerNombre: ['', [Validators.required]],
      segundoNombre: [''],
      primerApellido: ['', [Validators.required]],
      segundoApellido: [''],
      idDepartamento: ['', [Validators.required]],
      idCiudad: ['', [Validators.required]],
      idCorregimiento: [''],
      direccion: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
    });
  }

  private loadInitialData(): void {
    this.loadDepartments();
    this.loadTypeDocuments();
  }

  private loadDepartments(): void {
    this.departmentsLoading.set(true);
    this.locationService.getDepartamentos().subscribe({
      next: (response) => {
        this.departamentos.set(response.response);
        this.departmentsLoading.set(false);
      },
      error: () => {
        this.departmentsLoading.set(false);
        this.toast.error('Error', 'No se pudieron cargar los departamentos');
      }
    });
  }

  private loadCities(departmentId: number): void {
    this.citiesLoading.set(true);
    this.locationService.getCiudades(departmentId).subscribe({
      next: (response) => {
        this.ciudades.set(response.response);
        this.citiesLoading.set(false);
      },
      error: () => {
        this.citiesLoading.set(false);
        this.toast.error('Error', 'No se pudieron cargar las ciudades');
      }
    });
  }

  private loadCorregimientos(cityId: number): void {
    this.corregimientosLoading.set(true);
    this.locationService.getCorregimientos(cityId).subscribe({
      next: (response) => {
        this.corregimientos.set(response.response);
        this.corregimientosLoading.set(false);
      },
      error: () => {
        this.corregimientosLoading.set(false);
        this.toast.error('Error', 'No se pudieron cargar los corregimientos');
      }
    });
  }

  private loadTypeDocuments(): void {
    this.typeDocumentService.getAllTypeDocument().subscribe({
      next: (response) => {
        this.tiposDocumento.set(response.response);
      },
      error: () => {
        this.toast.error('Error', 'No se pudieron cargar los tipos de documento');
      }
    });
  }

  private setupFormValueChanges(): void {
    this.updateForm.get('idDepartamento')?.valueChanges.subscribe((departamentoId) => {
      const numericDeptId = departamentoId ? Number(departamentoId) : null;

      if (this.selectedDepartmentId() !== numericDeptId) {
        this.selectedDepartmentId.set(numericDeptId);
        this.updateForm.patchValue({
          idCiudad: '',
          idCorregimiento: ''
        }, { emitEvent: false });
      }
    });

    this.updateForm.get('idCiudad')?.valueChanges.subscribe((cityId) => {
      const numericCityId = cityId ? Number(cityId) : null;
      if (this.selectedCityId() !== numericCityId) {
        this.selectedCityId.set(numericCityId);
        this.updateForm.patchValue({
          idCorregimiento: ''
        }, { emitEvent: false });
      }
    });
  }

  private loadClientFromData(clienteData: any): void {
    if (!clienteData) return;
    this.updateForm.patchValue({
      tipoDocumento: 1, // Valor por defecto
      numeroDocumento: clienteData.numeroCedula || clienteData.numeroIdentificacion || '',
      primerNombre: clienteData.nombre || '',
      segundoNombre: clienteData.segundoNombre || '',
      primerApellido: clienteData.apellido || '',
      segundoApellido: clienteData.segundoApellido || '',
      telefono: clienteData.telefono || '',
      correo: clienteData.correo || '',
      direccion: clienteData.direccionDescripcion || clienteData.direccion || ''
    });

    this.loadClientLocation(clienteData);
  }

  private loadClientLocation(clienteData: any): void {
    // Método legacy mantenido por compatibilidad
    if (clienteData.codigoDepart) {
      this.selectedDepartmentId.set(Number(clienteData.codigoDepart));
      this.updateForm.patchValue({ idDepartamento: clienteData.codigoDepart });

      if (clienteData.codigoMuni) {
        setTimeout(() => {
          this.selectedCityId.set(Number(clienteData.codigoMuni));
          this.updateForm.patchValue({ idCiudad: clienteData.codigoMuni });

          if (clienteData.codigoVereda) {
            setTimeout(() => {
              this.updateForm.patchValue({ idCorregimiento: clienteData.codigoVereda });
            }, 300);
          }
        }, 200);
      }
    }
  }

  onSubmit(): void {
    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      this.toast.error('Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    const clienteSeleccionado = this.selectedClient();
    if (!clienteSeleccionado?.id) {
      this.toast.error('Error', 'No se pudo obtener la información del cliente');
      return;
    }

    const formData = this.updateForm.value;
    const usuarioModificacion = this.usuarioModificacion();

    const updatePayload = {
      id: clienteSeleccionado.id,
      tipoDocumento: { id: formData.tipoDocumento ? Number(formData.tipoDocumento) : 1 },
      numeroCedula: formData.numeroDocumento || '',
      nombre: formData.primerNombre || '',
      segundoNombre: formData.segundoNombre || '',
      apellido: formData.primerApellido || '',
      segundoApellido: formData.segundoApellido || '',
      telefono: formData.telefono || '',
      correo: formData.correo || '',
      direccion: {
        id: clienteSeleccionado.direccion?.id || 0,
        ciudad: { id: formData.idCiudad ? Number(formData.idCiudad) : 0 },
        corregimiento: formData.idCorregimiento ? { id: Number(formData.idCorregimiento) } : null,
        descripcion: formData.direccion || ''
      },
      usuarioModificacion: usuarioModificacion
    };

    this.personService.savaOrUpdatePerson(updatePayload as any).subscribe({
      next: (response: any) => {
        this.toast.success('Éxito', 'Cliente actualizado correctamente');
        this.router.navigate(['/shell/client']);
      },
      error: (err: any) => {
        console.error('Error al actualizar cliente:', err);
        // Manejar casos donde el backend devuelve 200 pero con error HTTP
        if (err.status === 200 || err.status === 201 || err.status === 204) {
          this.toast.success('Éxito', 'Cliente actualizado correctamente');
          this.router.navigate(['/shell/client']);
        } else {
          this.toast.error('Error', 'No se pudo actualizar el cliente');
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/shell/client']);
  }
}
