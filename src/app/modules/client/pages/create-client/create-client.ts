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
import { of, catchError, finalize, switchMap, EMPTY } from 'rxjs';
import { EmpleadoService } from '../../../employee/service/empleado.service';
import { ConceptRateService } from '../../../fee/services/concept-rate.service';
import { Checkbox } from '../../../../shared/components/checkbox';

@Component({
  selector: 'app-create-client',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, Checkbox],
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

  // Tarifas modal properties
  isTarifasModalOpen = signal<boolean>(false);
  selectedTarifas = signal<any[]>([]); // Estructura: { contadorId, tarifas: [{idTipoTarifa, nombre, aplica}] }
  tempSelectedTarifas = signal<any[]>([]); // Temporal para el modal
  currentCounterForTarifas = signal<any | null>(null); // Contador activo para configurar tarifas

  // Checkbox signal for discapacidad
  personaDiscapacidad = signal<boolean>(false);

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
  protected readonly enterpriseClientCounterService = inject(EnterpriseClientCounterService);
  readonly conceptRateService = inject(ConceptRateService);
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

    // Prellenar con los datos del usuario al cargar
    this.preloadUserData();

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
      tipoDocumento: ['', Validators.required],
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
      tipoContador: ['', Validators.required],
      serial: ['', Validators.required],
      idDepartamento: [{ value: '', disabled: true }, Validators.required],
      idCiudad: [{ value: '', disabled: true }, Validators.required],
      idCorregimiento: [''],
      direccion: ['', Validators.required],
      estrato: ['', [Validators.required, Validators.min(1), Validators.max(6)]],
      digitosContador: ['', [Validators.required, Validators.min(1)]],
    });
  }

  private preloadUserData(): void {
    const userDeptId = this.IdDepartamento();
    const userCityId = this.IdCiudad();

    // Prellenar formulario principal
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

    // Prellenar formulario del contador
    if (userDeptId) {
      this.counterForm.patchValue({
        idDepartamento: userDeptId
      });
      this.selectedCounterDepartmentId.set(userDeptId);
      this.loadCounterCities(userDeptId);
    }

    if (userCityId) {
      this.counterForm.patchValue({
        idCiudad: userCityId
      });
      this.selectedCounterCityId.set(userCityId);
      this.loadCounterCorregimientos(userCityId);
    }
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
            this.isSearching.set(false);
            return of(null);
          })
        );
    },
  });

  loadTypeDocument = rxResource({
    stream: () => this.tipoDocumentoService.getAllTypeDocument(),
  });

  loadTypeCounter = rxResource({
    stream: () => this.tipoContadorService.getAllTypeCounters(),
  });

  dataConceptRate = rxResource({
    params: () => ({ enterpriseId: this.enterpriceId() }),
    stream: ({ params: { enterpriseId } }) =>
      enterpriseId? this.conceptRateService.getConceptRateByEnterprise(enterpriseId) : EMPTY
  })

  // Computed para obtener tarifas únicas (similar a availableMenus en admin-roles)
  availableTarifas = computed(() => {
    const data = this.dataConceptRate.value();
    if (!data?.response || data?.success === false) return [];

    // Extraer tarifas únicas usando Map para evitar duplicados
    const uniqueTarifas = new Map();
    data.response.forEach(item => {
      if (item?.tipoTarifa && !uniqueTarifas.has(item.tipoTarifa.id)) {
        uniqueTarifas.set(item.tipoTarifa.id, item.tipoTarifa);
      }
    });

    return Array.from(uniqueTarifas.values());
  });

  loadDepartments(): void {
    this.departmentsLoading.set(true);
    this.locationService.getDepartamentos().subscribe({
      next: (departaments) => {
        this.departaments.set(departaments.response);
        this.departmentsLoading.set(false);
      },
      complete: () => {
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
      complete: () => {
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
      complete: () => {
        this.corregimientosLoading.set(false);
      }
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
      complete: () => {
        this.counterDepartmentsLoading.set(false);
      }
    });
  }

  loadCounterCities(departmentId: number): void {
    this.counterCitiesLoading.set(true);
    this.locationService.getCiudades(departmentId).subscribe({
      next: (cities) => {
        this.counterCities.set(cities.response);
        this.counterCitiesLoading.set(false);
      },
      complete: () => {
        this.counterCitiesLoading.set(false);
      }
    });
  }

  loadCounterCorregimientos(cityId: number): void {
    this.counterCorregimientosLoading.set(true);
    this.locationService.getCorregimientos(cityId).subscribe({
      next: (corregimientos) => {
        this.counterCorregimientos.set(corregimientos.response);
        this.counterCorregimientosLoading.set(false);
      },
      complete: () => {
        this.counterCorregimientosLoading.set(false);
      }
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
      complete: () => {
        this.employeesLoading.set(false);
      }
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
      discapacidad: this.personaDiscapacidad(),
      contadoresIds: contadoresIds,
      usuarioCreacion: usuarioCreacion.substring(0, 15),
      tarifasContador: this.buildTarifasCliente()
    };

    this.enterpriseClientCounterService.saveClient(clientPayload).subscribe({
      next: (response: any) => {
        this.toast.success('Éxito', 'Cliente y contadores asignados correctamente');
        this.registerForm.reset();
        this.selectedSerials.set([]);
        this.closeModal();
        this.router.navigate(['/shell/client']);
      }
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
      departamento: { id: this.IdDepartamento() },
      ciudad: { id: this.IdCiudad() },
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
            nuid: this.generateNuid(),
            estrato: Number(formData.estrato),
            digitos: Number(formData.digitosContador),
            activo: true,
            usuarioCreacion: usuarioCreacion,
          };
          return this.counterService.saveCounter(counterPayload);
        })
      )
      .subscribe({
        next: (counterResponse) => {
          if (counterResponse) {
            this.toast.success('Éxito', 'Contador creado correctamente');

            // Obtener el serial del contador creado
            const createdSerial = formData.serial;

            // Resetear el formulario
            this.counterForm.reset();

            // Prellenar ubicación nuevamente después de resetear
            const userDeptId = this.IdDepartamento();
            const userCityId = this.IdCiudad();
            if (userDeptId) {
              this.counterForm.patchValue({ idDepartamento: userDeptId });
              this.selectedCounterDepartmentId.set(userDeptId);
            }
            if (userCityId) {
              this.counterForm.patchValue({ idCiudad: userCityId });
              this.selectedCounterCityId.set(userCityId);
            }

            // Cambiar al tab de búsqueda
            this.activeTab.set('search');

            // Buscar el contador recién creado
            this.searchSerial.set(createdSerial);
          }
        }
      });
  }

  cancelClient(): void {
    this.registerForm.reset();
    this.router.navigate(['/shell/client']);
  }

  goBack(): void {
    this.router.navigate(['/shell/client']);
  }

  // Método para generar un número aleatorio de 8 dígitos para nuid
  private generateNuid(): number {
    return Math.floor(10000000 + Math.random() * 90000000);
  }

  // Métodos para manejar tarifas (mejorados y simplificados)
  openTarifasModal(contador: any): void {
    this.currentCounterForTarifas.set(contador);
    this.isTarifasModalOpen.set(true);

    // Buscar tarifas existentes para este contador
    const contadorId = contador.contador?.id || contador.id;
    const existingTarifas = this.selectedTarifas().find(t => t.contadorId === contadorId);

    // Copiar selección actual a temporal
    this.tempSelectedTarifas.set(existingTarifas ? [...existingTarifas.tarifas] : []);
  }

  closeTarifasModal(): void {
    this.isTarifasModalOpen.set(false);
    // Descartar cambios temporales
    this.tempSelectedTarifas.set([]);
    this.currentCounterForTarifas.set(null);
  }

  applyTarifas(): void {
    const contador = this.currentCounterForTarifas();
    if (!contador) return;

    const contadorId = contador.contador?.id || contador.id;
    const currentTarifas = [...this.selectedTarifas()];

    // Buscar si ya existe una configuración para este contador
    const existingIndex = currentTarifas.findIndex(t => t.contadorId === contadorId);

    if (existingIndex >= 0) {
      // Actualizar las tarifas existentes
      currentTarifas[existingIndex] = {
        contadorId: contadorId,
        tarifas: [...this.tempSelectedTarifas()]
      };
    } else {
      // Agregar nueva configuración de tarifas
      currentTarifas.push({
        contadorId: contadorId,
        tarifas: [...this.tempSelectedTarifas()]
      });
    }

    this.selectedTarifas.set(currentTarifas);
    this.isTarifasModalOpen.set(false);
    this.tempSelectedTarifas.set([]);
    this.currentCounterForTarifas.set(null);
  }

  // Método simplificado para seleccionar/deseleccionar tarifas
  onTarifaSelect(tarifaId: number): void {
    const currentSelected = this.tempSelectedTarifas();
    const isCurrentlySelected = currentSelected.some(t => t.idTipoTarifa === tarifaId);

    if (isCurrentlySelected) {
      // Remover de la selección
      const updated = currentSelected.filter(t => t.idTipoTarifa !== tarifaId);
      this.tempSelectedTarifas.set(updated);
    } else {
      // Agregar a la selección - buscar la tarifa en las disponibles
      const tarifaData = this.availableTarifas().find(tarifa => tarifa.id === tarifaId);
      if (tarifaData) {
        this.tempSelectedTarifas.set([
          ...currentSelected,
          {
            idTipoTarifa: tarifaId,
            nombre: tarifaData.nombre,
            aplica: true
          }
        ]);
      }
    }
  }

  isTarifaSelected(tarifaId: number): boolean {
    return this.tempSelectedTarifas().some(t => t.idTipoTarifa === tarifaId);
  }

  getTarifasSeleccionadasCount(contadorId?: number): number {
    if (contadorId) {
      const tarifasContador = this.selectedTarifas().find(t => t.contadorId === contadorId);
      return tarifasContador ? tarifasContador.tarifas.length : 0;
    }
    return this.selectedTarifas().reduce((sum, t) => sum + t.tarifas.length, 0);
  }

  private buildTarifasCliente(): any[] {
    const tarifasArray: any[] = [];

    this.selectedTarifas().forEach(contadorConfig => {
      contadorConfig.tarifas.forEach((tarifa: any) => {
        tarifasArray.push({
          idContador:  contadorConfig.contadorId ,
          idTipoTarifa: tarifa.idTipoTarifa,
          aplica: false
        });
      });
    });

    return tarifasArray;
  }
}
