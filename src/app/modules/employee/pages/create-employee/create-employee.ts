import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, effect, signal, PLATFORM_ID, computed } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICity } from '@interfaces/Icity';
import { ICorregimiento } from '@interfaces/icorregimiento';
import { DepartamentService } from '../../../auth/service/departament.service';
import { CityService } from '../../../auth/service/city.service';
import { CorregimientoService } from '../../../auth/service/corregimiento.service';
import { TypeDocumentService } from '../../../client/service/typeDocument.service';
import { IDepartament } from '@interfaces/Idepartament';
import { ITipoDocumento } from '@interfaces/Iuser';
import { EmpleadoService } from '../../service/empleado.service';
import { ToastService } from '@services/toast.service';
import { Router } from '@angular/router';
import { UserService } from '../../../auth/service/user.service';
import { LocationService } from '@shared/services/location.service';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-create-employee',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './create-employee.html',
})
export class CreateEmployee implements OnInit {   //Pipe ->  refactorizar el codigo, el settimeOut afecta demasiado el performnace de la aplicacion, el consumo de servicios no en entendible, por uqe se genera un objeto empresa si tenemos la interfaz , por uqe se le hace una promise a los metodos es mejor utilizar un observable
  registerForm!: FormGroup;

  selectedDepartmentId = signal<number | null>(null);
  selectedCityId = signal<number | null>(null);
  departaments = signal<IDepartament[]>([]);
  cities = signal<ICity[]>([]);
  corregimientos = signal<ICorregimiento[]>([]);
  departmentsLoading = signal<boolean>(false);
  citiesLoading = signal<boolean>(false);
  corregimientosLoading = signal<boolean>(false);

  typeDocument: ITipoDocumento[] = [];
  typeDocumentName: string[] = [];

  protected readonly departamentService = inject(DepartamentService);
  protected readonly fb = inject(FormBuilder);
  protected readonly cityService = inject(CityService);
  protected readonly corregimientoService = inject(CorregimientoService);
  protected readonly tipoDocumentoService = inject(TypeDocumentService);
  protected readonly empleadoService = inject(EmpleadoService);
  protected readonly toast = inject(ToastService);
  protected readonly router = inject(Router);
  protected readonly userService = inject(UserService);
  protected readonly locationService = inject(LocationService);
    protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

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

    // Prellenar con los datos del usuario al cargar
    this.preloadUserData();

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

  readonly IdDepartamento = computed(() => {
    const data = this.userData();
    const id = data?.empresa?.direccion?.departamento?.id;
    return id || null;
  });

  readonly IdCiudad = computed(() => {
    const data = this.userData();
    const id = data?.empresa?.direccion?.ciudad?.id;
    return id || null;
  });


  private initializeForm(): void {
    this.registerForm = this.fb.group({
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      primerApellido: ['', Validators.required],
      segundoApellido: [''],
      primerNombre: ['', Validators.required],
      segundoNombre: [''],
      idDepartamento: [null, Validators.required],
      idCiudad: [null, Validators.required],
      idCorregimiento: [null],
      direccion: [''],
      telefono: ['', Validators.required],
      codigo: ['', Validators.required],
      usuarioCreacion: [this.nombreUsuario()],
      idEmpresa: [this.empresaId()]
    });
  }

  private preloadUserData(): void {
    const userDeptId = this.IdDepartamento();
    const userCityId = this.IdCiudad();

    // Prellenar formulario de empleado
    if (userDeptId) {
      this.registerForm.patchValue({
        idDepartamento: userDeptId
      });
      this.selectedDepartmentId.set(userDeptId);

      // Cargar ciudades del departamento
      this.loadCities(userDeptId);
    }

    if (userCityId) {
      this.registerForm.patchValue({
        idCiudad: userCityId
      });
      this.selectedCityId.set(userCityId);

      // Cargar corregimientos de la ciudad
      this.loadCorregimientos(userCityId);
    }
  }
loadTypeDocument = rxResource({
  stream: () => this.tipoDocumentoService.getAllTypeDocument()
})

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
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.toast.warning('Formulario inválido', 'Por favor complete todos los campos correctamente.');
      return;
    }

    const formData = {
      ...this.registerForm.value,
      // Mapear los nombres del formulario a los nombres que espera el backend
      idTipoDocumento: this.registerForm.value.tipoDocumento,
      numeroCedula: this.registerForm.value.numeroDocumento,
      descripcionDireccion: this.registerForm.value.direccion
    };

    // Remover los campos del formulario que no necesita el backend
    delete formData.tipoDocumento;
    delete formData.numeroDocumento;
    delete formData.direccion;

    this.empleadoService.saveEmpleado(formData).subscribe({
      next: (response: any) => {
        this.toast.success('Éxito', 'Empleado registrado correctamente');
        this.registerForm.reset();
        this.initializeForm();
       this.router.navigate(['/shell/employee']);
      },
      error: (error: any) => {
        console.error('Error al crear empleado:', error);
      }
    });
  }

}
