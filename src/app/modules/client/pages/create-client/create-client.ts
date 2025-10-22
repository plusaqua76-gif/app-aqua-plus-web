import {
  Component,
  inject,
  OnInit,
  effect,
  signal,
  computed,
  PLATFORM_ID,
} from '@angular/core';
import { DepartamentService } from '../../../auth/service/departament.service';
import { CityService } from '../../../auth/service/city.service';
import { CorregimientoService } from '../../../auth/service/corregimiento.service';
import { TypeDocumentService } from '../../service/typeDocument.service';
import { PersonService } from '../../service/person.service';
import { IDepartament } from '@interfaces/Idepartament';
import { ICity } from '@interfaces/Icity';
import { ICorregimiento } from '@interfaces/icorregimiento';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ITipoDocumento } from '@interfaces/Iuser';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '@services/toast.service';
import { LocationService } from '@shared/services/location.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { EnterpriseClientCounterService } from '../../service/enterpriseClientCounter.service';
import { TypeCounterService } from '../../../counter/service/typeCounter.service';
import { CounterService } from '../../service/couter.service';
import { of, catchError, finalize, switchMap } from 'rxjs';
import { EmpleadoService } from '../../../employee/service/empleado.service';

@Component({
  selector: 'app-create-client',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './create-client.html',
})
export class CreateClient implements OnInit {
  registerForm!: FormGroup;

  selectedDepartmentId = signal<number | null>(null);
  selectedCityId = signal<number | null>(null);
  departaments = signal<IDepartament[]>([]);
  cities = signal<ICity[]>([]);
  corregimientos = signal<ICorregimiento[]>([]);
  departmentsLoading = signal<boolean>(false);
  citiesLoading = signal<boolean>(false);
  corregimientosLoading = signal<boolean>(false);

  // Modal properties
  isModalOpen = signal<boolean>(false);
  searchSerial = signal<string>('');
  selectedSerials = signal<any[]>([]);
  isSearching = signal<boolean>(false);
  activeTab = signal<'search' | 'create'>('search');

  // Counter form properties
  counterForm!: FormGroup;
  selectedCounterDepartmentId = signal<number | null>(null);
  selectedCounterCityId = signal<number | null>(null);
  counterDepartaments = signal<IDepartament[]>([]);
  counterCities = signal<ICity[]>([]);
  counterCorregimientos = signal<ICorregimiento[]>([]);
  counterDepartmentsLoading = signal<boolean>(false);
  counterCitiesLoading = signal<boolean>(false);
  counterCorregimientosLoading = signal<boolean>(false);

  typeDocument: ITipoDocumento[] = [];
  typeDocumentName: string[] = [];

  protected readonly departamentService = inject(DepartamentService);
  protected readonly fb = inject(FormBuilder);
  protected readonly cityService = inject(CityService);
  protected readonly corregimientoService = inject(CorregimientoService);
  protected readonly tipoDocumentoService = inject(TypeDocumentService);
  protected readonly tipoContadorService = inject(TypeCounterService);
  protected readonly personService = inject(PersonService);
  protected readonly locationService = inject(LocationService);
  protected readonly enterpriseClientCounterService = inject(
    EnterpriseClientCounterService
  );
  protected readonly counterService = inject(CounterService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly toast = inject(ToastService);
  protected readonly empleadoService = inject(EmpleadoService);
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

  readonly usuarioCreacion = computed(() => {
    const data = this.userData();
    return data?.nombre || 'admin';
  });

  readonly enterpriceId = computed(() => {
    const data = this.userData();
    const id = data?.empresaId || 0;
    return id;
  });

  // Signals para empleados
  employees = signal<any[]>([]);
  employeesLoading = signal<boolean>(false);

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

    effect(() => {
      const searchResult = this.serialcode.value();
      if (searchResult) {
        this.isSearching.set(false);
      }
    });

    effect(() => {
      const deptId = this.selectedCounterDepartmentId();
      if (deptId) {
        this.loadCounterCities(deptId);
      } else {
        this.counterCities.set([]);
        this.counterCorregimientos.set([]);
      }
    });

    effect(() => {
      const cityId = this.selectedCounterCityId();
      if (cityId) {
        this.loadCounterCorregimientos(cityId);
      } else {
        this.counterCorregimientos.set([]);
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.initializeCounterForm();
    this.loadDepartments();
    this.loadCounterDepartments();
    this.loadEmployees(); // Cargar empleados al inicializar

    this.registerForm
      .get('idDepartamento')
      ?.valueChanges.subscribe((departamentoId) => {
        const numericDeptId = departamentoId ? Number(departamentoId) : null;

        if (this.selectedDepartmentId() !== numericDeptId) {
          this.selectedDepartmentId.set(numericDeptId);
          this.registerForm.patchValue(
            {
              idCiudad: '',
              idCorregimiento: '',
            },
            { emitEvent: false }
          );

          this.cities.set([]);
          this.corregimientos.set([]);
        }
      });

    this.registerForm.get('idCiudad')?.valueChanges.subscribe((cityId) => {
      const numericCityId = cityId ? Number(cityId) : null;
      if (this.selectedCityId() !== numericCityId) {
        this.selectedCityId.set(numericCityId);
        this.registerForm.patchValue(
          {
            idCorregimiento: '',
          },
          { emitEvent: false }
        );
        this.corregimientos.set([]);
      }
    });

    // Eventos para el formulario de contador
    this.counterForm
      .get('idDepartamento')
      ?.valueChanges.subscribe((departamentoId) => {
        const numericDeptId = departamentoId ? Number(departamentoId) : null;
        if (this.selectedCounterDepartmentId() !== numericDeptId) {
          this.selectedCounterDepartmentId.set(numericDeptId);
          this.counterForm.patchValue(
            {
              idCiudad: '',
              idCorregimiento: '',
            },
            { emitEvent: false }
          );
          this.counterCities.set([]);
          this.counterCorregimientos.set([]);
        }
      });

    this.counterForm.get('idCiudad')?.valueChanges.subscribe((cityId) => {
      const numericCityId = cityId ? Number(cityId) : null;
      if (this.selectedCounterCityId() !== numericCityId) {
        this.selectedCounterCityId.set(numericCityId);
        this.counterForm.patchValue(
          {
            idCorregimiento: '',
          },
          { emitEvent: false }
        );
        this.counterCorregimientos.set([]);
      }
    });
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      tipoDocumento: [null, Validators.required],
      numeroDocumento: ['', Validators.required],
      telefono: ['', Validators.required],
      correo: ['', [Validators.required]],
      primerApellido: ['', Validators.required],
      segundoApellido: [''],
      primerNombre: ['', Validators.required],
      segundoNombre: [''],
      idDepartamento: ['', Validators.required],
      idCiudad: ['', Validators.required],
      idCorregimiento: [''],
      direccion: [''],
      idEmpleadoEmpresa: ['', Validators.required],
    });
  }

  private initializeCounterForm(): void {
    this.counterForm = this.fb.group({
      tipoContador: [null, Validators.required],
      serial: ['', Validators.required],
      idDepartamento: ['', Validators.required],
      idCiudad: ['', Validators.required],
      idCorregimiento: [''],
      direccion: ['', Validators.required],
    });
  }

  serialSelected = signal<number | null>(null);
  serialcode = rxResource({
    params: () => ({
      serial: this.searchSerial(),
    }),
    stream: ({ params }) => {
      const { serial } = params;
      if (!serial || serial.trim() === '' || serial.length < 1) {
        return of(null);
      }
      this.isSearching.set(true);
      return this.enterpriseClientCounterService
        .getClientBySerial(serial.trim())
        .pipe(
          finalize(() => this.isSearching.set(false)),
          catchError((error) => {
            console.error('Error al buscar serial:', error);
            this.isSearching.set(false);
            return of(null);
          })
        );
    },
  });

  // searchByCounter = rxResource({
  //   params: (counterId: number) => ({ counterId }),
  //   stream: ({ counterId }) => this.enterpriseClientCounterService.getClientBySerial(counterId)
  // })

  loadTypeDocument = rxResource({
    stream: () => this.tipoDocumentoService.getAllTypeDocument(),
  });

  loadTypeCounter = rxResource({
    stream: () => this.tipoContadorService.getAllTypeCounters(),
  });

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
      },
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
      },
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
      },
    });
  }

  // Métodos específicos para el formulario de contador
  loadCounterDepartments(): void {
    this.counterDepartmentsLoading.set(true);
    this.locationService.getDepartamentos().subscribe({
      next: (departaments) => {
        this.counterDepartaments.set(departaments.response);
        this.counterDepartmentsLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar departamentos para contador:', err);
        this.toast.error('Error', 'No se pudieron cargar los departamentos');
        this.counterDepartmentsLoading.set(false);
      },
    });
  }

  loadCounterCities(departmentId: number): void {
    this.counterCitiesLoading.set(true);
    this.locationService.getCiudades(departmentId).subscribe({
      next: (cities) => {
        this.counterCities.set(cities.response);
        this.counterCitiesLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar ciudades para contador:', err);
        this.toast.error('Error', 'No se pudieron cargar las ciudades');
        this.counterCitiesLoading.set(false);
      },
    });
  }

  loadCounterCorregimientos(cityId: number): void {
    this.counterCorregimientosLoading.set(true);
    this.locationService.getCorregimientos(cityId).subscribe({
      next: (corregimientos) => {
        this.counterCorregimientos.set(corregimientos.response);
        this.counterCorregimientosLoading.set(false);
      },
      error: (err) => {
        this.toast.error('Error', 'No se pudieron cargar los corregimientos');
        this.counterCorregimientosLoading.set(false);
      },
    });
  }

  loadEmployees(): void {
    const enterpriseId = this.enterpriceId();
    if (!enterpriseId) {
      console.warn('No hay enterprise ID disponible');
      return;
    }

    this.employeesLoading.set(true);
    this.empleadoService.getEmployeeByEnterprice(enterpriseId).subscribe({
      next: (response) => {
        this.employees.set(response.response || []);
        this.employeesLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar empleados:', err);
        this.toast.error('Error', 'No se pudieron cargar los empleados');
        this.employees.set([]);
        this.employeesLoading.set(false);
      },
    });
  }

  createClient(): void {
    // Redirigir al usuario a abrir el modal de asignación de contadores
    this.toast.info('Información', 'Para crear un cliente, debe asignar al menos un contador');
    this.assignCounter();
  }

  assignCounter(): void {
    this.openModal();
  }

  openModal(): void {
    this.isModalOpen.set(true);
    this.searchSerial.set('');
    this.selectedSerials.set([]);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.searchSerial.set('');
    this.selectedSerials.set([]);
    this.isSearching.set(false);
  }

  onSearchSerialChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSerial.set(target.value);
  }

  selectSerial(serial: any): void {
    const currentSelected = this.selectedSerials();
    const isAlreadySelected = currentSelected.find((s) => s.id === serial.id);

    if (!isAlreadySelected) {
      this.selectedSerials.set([...currentSelected, serial]);
    }
  }

  removeSelectedSerial(serialId: number): void {
    const currentSelected = this.selectedSerials();
    const filtered = currentSelected.filter((s) => s.id !== serialId);
    this.selectedSerials.set(filtered);
  }

  confirmSelection(): void {
    const selected = this.selectedSerials();
    if (selected.length === 0) {
      this.toast.warning(
        'Advertencia',
        'Debe seleccionar al menos un contador'
      );
      return;
    }

    // Validar que el formulario de cliente esté completo
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.toast.error(
        'Error',
        'Por favor complete todos los campos del cliente antes de asignar contadores'
      );
      return;
    }

    const formData = this.registerForm.value;
    const usuarioCreacion = this.usuarioCreacion();

    // Extraer solo los IDs de los contadores seleccionados
    const contadoresIds = selected.map(item => item.contador?.id || item.id).filter(Boolean);

    const clientPayload = {
      idEmpresa: this.enterpriceId(),
      idTipoDocumento: formData.tipoDocumento ? Number(formData.tipoDocumento) : 1,
      numeroCedula: (formData.numeroDocumento || '').toString().substring(0, 15),
      primerNombre: (formData.primerNombre || '').substring(0, 50),
      segundoNombre: (formData.segundoNombre || '').substring(0, 50),
      primerApellido: (formData.primerApellido || '').substring(0, 50),
      segundoApellido: (formData.segundoApellido || '').substring(0, 50),
      telefono: (formData.telefono || '').toString().substring(0, 15),
      correo: (formData.correo || '').substring(0, 100),
      idCiudad: formData.idCiudad ? Number(formData.idCiudad) : 0,
      idCorregimiento: formData.idCorregimiento ? Number(formData.idCorregimiento) : null,
      descripcionDireccion: (formData.direccion || '').substring(0, 255),
      idEmpleadoEmpresa: formData.idEmpleadoEmpresa ? Number(formData.idEmpleadoEmpresa) : 0,
      contadoresIds: contadoresIds,
      usuarioCreacion: usuarioCreacion.substring(0, 15),
    };

    this.enterpriseClientCounterService.saveClient(clientPayload).subscribe({
      next: (response: any) => {
        this.toast.success('Éxito', 'Cliente y contadores asignados correctamente');
        this.registerForm.reset();
        this.selectedSerials.set([]);
        this.closeModal();
        this.router.navigate(['/shell/client']);
      },
      error: (err: any) => {
        console.error('Error al crear cliente con contadores:', err);
        if (err.status === 200 || err.status === 201 || err.status === 204) {
          this.toast.success('Éxito', 'Cliente y contadores asignados correctamente');
          this.registerForm.reset();
          this.selectedSerials.set([]);
          this.closeModal();
          this.router.navigate(['/shell/client']);
        } else {
          this.toast.error('Error', 'No se pudo crear el cliente con los contadores');
        }
      },
    });
  }

  createCounter(): void {
    if (this.counterForm.invalid) {
      this.counterForm.markAllAsTouched();
      this.toast.error(
        'Error',
        'Por favor complete todos los campos requeridos'
      );
      return;
    }

    const formData = this.counterForm.value;
    const usuarioCreacion = this.usuarioCreacion();

    const addressPayload = {
      departamento: { id: Number(formData.idDepartamento) },
      ciudad: { id: Number(formData.idCiudad) },
      corregimiento: formData.idCorregimiento
        ? { id: Number(formData.idCorregimiento) }
        : { id: 0 },
      descripcion: formData.direccion,
      usuarioCreacion: usuarioCreacion,
    };

    this.personService
      .createDireccionLocation(addressPayload)
      .pipe(
        switchMap((addressResponse) => {
          const counterPayload: any = {
            tipoContador: { id: Number(formData.tipoContador) },
            descripcion: { id: addressResponse.response.id },
            serial: formData.serial,
            activo: true,
            usuarioCreacion: usuarioCreacion,
          };
          return this.counterService.saveCounter(counterPayload);
        }),
        catchError((error) => {
          console.error('Error en el proceso de creación:', error);
          return of(null);
        })
      )
      .subscribe({
        next: (counterResponse) => {
          if (counterResponse) {
            this.toast.success('Éxito', 'Contador creado correctamente');
            this.counterForm.reset();
            this.closeModal();
          }
        },
        error: (err) => {
          console.error('Error al crear contador:', err);
          this.toast.error('Error', 'No se pudo crear el contador');
        },
      });
  }

  cancelClient(): void {
    this.registerForm.reset();
    this.router.navigate(['/shell/client']);
  }

  goBack(): void {
    this.router.navigate(['/shell/client']);
  }
}
