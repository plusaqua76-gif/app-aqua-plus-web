import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  signal,
  effect,
  PLATFORM_ID,
  computed,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from '@angular/forms';
import { TableComponent } from '../../../../core/components/table';
import { Action, TableColumn } from '@interfaces/table/Itable';
import { IPaginatedResponse, IPaginationParams } from '../../../../core/interfaces/IpaginatedResponse';
import { Observable, catchError, EMPTY, of, forkJoin, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '@services/toast.service';
import { PersonService } from '../../service/person.service';
import { TypeDocumentService } from '../../service/typeDocument.service';
import { IDepartament } from '@interfaces/Idepartament';
import { ICity } from '@interfaces/Icity';
import { ICorregimiento } from '@interfaces/icorregimiento';
import { ITipoDocumento } from '@interfaces/Iuser';
import { LocationService } from '@shared/services/location.service';
import { EmpleadoService } from '../../../employee/service/empleado.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { EnterpriseClientCounterService } from '../../service/enterpriseClientCounter.service';
import {
  IClienteDetalle,
  ITipoConcepto,
  ITiposTarifaFaltantes,
} from '@interfaces/client/IclientDetail';
import { TarifaContadorUpdate } from '@interfaces/ISaveClient';
import { TypeCounterService } from '../../../counter/service/typeCounter.service';
import { ITypeCounter } from '@interfaces/ItypeCounter';
import { ConceptRateService } from '../../../fee/services/concept-rate.service';
import { CounterService } from '../../service/couter.service';
import { error } from 'node:console';
import { ConfigurationMasiveBillService } from '../../../electronic-invoicing/services/configuration-masive-bill.service';
import { filter } from 'rxjs/operators';
import { Checkbox } from '@shared/components/checkbox';
import { PopupComponent } from '@shared/components/popUp';
import { UseService } from '../../../fee/services/use.service';
import { RateTypeService } from '../../../fee/services/rate-type.service';

@Component({
  selector: 'app-update-client',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Checkbox, TableComponent, PopupComponent],
  templateUrl: './update-client.html',
  providers: [DatePipe],
})
export class UpdateClient implements OnInit {
  updateForm!: FormGroup;

  selectedDepartmentId = signal<number | null>(null);
  selectedCityId = signal<number | null>(null);
  selectedClient = signal<IClienteDetalle | null>(null);
  empresaClienteContadorId = signal<number | null>(null);
  protected configurationMasiveBillService = inject(
    ConfigurationMasiveBillService,
  );

  clienteUbicacionActual = signal<{
    departamento: string;
    ciudad: string;
    corregimiento: string | null;
    direccion: string;
  } | null>(null);

  departamentos = signal<IDepartament[]>([]);
  ciudades = signal<ICity[]>([]);
  corregimientos = signal<ICorregimiento[]>([]);
  tiposDocumento = signal<ITipoDocumento[]>([]);
  tiposContador = signal<ITypeCounter[]>([]);

  // Signals para ubicación de contadores
  contadorCiudades = signal<{ [key: number]: ICity[] }>({});
  contadorCorregimientos = signal<{ [key: number]: ICorregimiento[] }>({});

  // Signals para gestión de tarifas
  isTarifasModalOpen = signal<boolean>(false);
  selectedCounterForTarifas = signal<number | null>(null);
  contadoresConTarifasModificadas = signal<Set<number>>(new Set());
  tarifasPorContador = signal<Map<number, number[]>>(new Map());
  conceptosPorContador = signal<Map<number, Map<number, number[]>>>(new Map());
  selectedTarifas = signal<number[]>([]);
  tempSelectedTarifas = signal<number[]>([]); // Temporal para el modal
  originalTarifas = signal<number[]>([]); // Tarifas originales para comparación
  tempSelectedConceptos = signal<Map<number, number[]>>(new Map()); // tipoTarifaId -> idTipoConcepto[]
  originalConceptos = signal<Map<number, number[]>>(new Map());
  selectedCounterData = signal<any>(null);

  selectedCodigosResidenciaFiscal = signal<string[]>([]);
  isCodigosDropdownOpen = signal<boolean>(false);

  // Signals para gestión de aforos multiselect por contador
  counterAforosDropdownOpen = signal<{ [key: number]: boolean }>({});
  counterAforosSearchTerm = signal<{ [key: number]: string }>({});

  // Signals para crear nuevos contadores
  isAddCounterModalOpen = signal<boolean>(false);
  counterForm!: FormGroup;
  selectedCounterDepartmentId = signal<number | null>(null);
  selectedCounterCityId = signal<number | null>(null);
  counterDepartaments = signal<IDepartament[]>([]);
  counterCities = signal<ICity[]>([]);
  counterCorregimientos = signal<ICorregimiento[]>([]);
  counterDepartmentsLoading = signal<boolean>(false);
  counterCitiesLoading = signal<boolean>(false);
  counterCorregimientosLoading = signal<boolean>(false);

  departmentsLoading = signal<boolean>(false);
  citiesLoading = signal<boolean>(false);
  corregimientosLoading = signal<boolean>(false);
  showDeleteConfirmCounter = signal<boolean>(false);
  counterToDelete = signal<{ index: number; id: number; serial: string; idEmpresaClienteContador: number } | null>(null);


  showDeleteConfirmAforo = signal<boolean>(false);
  aforoToDelete = signal<{ counterIndex: number; aforoId: number; aforoName: string; idAforoContador?: number } | null>(null);

  // Signals para modal de asignar contador existente
  isAssignCounterModalOpen = signal<boolean>(false);
  searchSerialValue = signal<string>('');
  isSearchingCounter = signal<boolean>(false);

  // === NUEVA ARQUITECTURA: Tabs + Tabla de contadores ===
  activeTab = signal<'cliente' | 'contadores'>('cliente');
  contadoresPagination = signal<IPaginationParams>({ page: 0, size: 5 });

  // Modal de edición de contador
  editingCounter = signal<any>(null);
  isEditCounterModalOpen = signal<boolean>(false);
  editCounterForm!: FormGroup;
  editCounterCities = signal<ICity[]>([]);
  editCounterCorregimientos = signal<ICorregimiento[]>([]);
  editCounterAforosDropdownOpen = signal<boolean>(false);
  editCounterAforosSearchTerm = signal<string>('');

  // Mapa contadorId -> idEmpresaClienteContador (para tarifas)
  contadorEmpresaClienteMap = signal<Map<number, number>>(new Map());

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly personService = inject(PersonService);
  private readonly locationService = inject(LocationService);
  private readonly typeDocumentService = inject(TypeDocumentService);
  private readonly empleadoService = inject(EmpleadoService);
  private readonly rateTypeService = inject(RateTypeService);
  private readonly conceptRateService = inject(ConceptRateService);
  private readonly enterpriseClientCounterService = inject(
    EnterpriseClientCounterService,
  );
  private readonly typeCounterService = inject(TypeCounterService);
  private readonly counterService = inject(CounterService);
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  protected useService = inject(UseService);

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

  readonly usuarioModificacion = computed(() => {
    const data = this.userData();
    return data?.nombre || 'admin';
  });

  readonly empresaId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  });

  datacodigos_residencia_fiscal = rxResource({
    stream: () =>
      this.configurationMasiveBillService
        .getFiscalResponsabilityTypesDian()
        .pipe(catchError((error) => of(null))),
  });

  typeUse = rxResource({
      params: () => ({
        enterpriseId: this.empresaId(),
      }),
      stream: ({ params }) => {
        if (!params.enterpriseId) {
          return of(null);
        }
        return this.useService.getTypeUse(params.enterpriseId).pipe(
          catchError((error) => {
            return of(null);
          }),
        );
      },
    });

      readonly typeUseData = computed(
    () => this.typeUse.value()?.response || [],
  );

  dataClient = rxResource({
    params: () => ({
      empresaClienteContadorId: this.empresaClienteContadorId(),
    }),
    stream: ({ params: { empresaClienteContadorId } }) =>
      empresaClienteContadorId
        ? this.enterpriseClientCounterService.getClientInfoByEmpresaClienteContadorId(
            empresaClienteContadorId,
          ).pipe(catchError(() => of(null)))
        : EMPTY,
  });

  dataContadores = rxResource({
    params: () => ({
      id: this.empresaClienteContadorId(),
      pagination: this.contadoresPagination(),
    }),
    stream: ({ params: { id, pagination } }) =>
      id
        ? this.enterpriseClientCounterService
            .getContadoresPaginatedByEmpresaClienteContadorId(id, pagination)
            .pipe(catchError(() => of(null)))
        : EMPTY,
  });

  dataEmployee = rxResource({
    params: () => ({ enterpriseId: this.empresaId() }),
    stream: ({ params: { enterpriseId } }) =>
      enterpriseId
        ? this.empleadoService.getEmployeeByEnterprice(enterpriseId).pipe(
            catchError((error) => {
              if (error.status === 404) {
                return of(null);
              }
              return of(null);
            }),
          )
        : of(null),
  });

  loadTypeCounter = rxResource({
    stream: () => this.typeCounterService.getAllTypeCounters(),
  });

  feeConcept = rxResource({
    params: () => ({ enterpriseId: this.empresaId() }),
    stream: ({ params: { enterpriseId } }) =>
      enterpriseId
        ? this.rateTypeService.getRateTypes(enterpriseId).pipe(
            catchError((error) => {
              if (error.status === 404) {
                return of(null);
              }
              return of(null);
            }),
          )
        : of(null),
  });

  conceptRates = rxResource({
    params: () => ({ enterpriseId: this.empresaId() }),
    stream: ({ params: { enterpriseId } }) =>
      enterpriseId
        ? this.conceptRateService.getConceptRateByEnterprise(enterpriseId).pipe(
            catchError(() => of(null)),
          )
        : of(null),
  });

  typesAforos = rxResource({
    params: () => ({ enterpriseId: this.empresaId() }),
    stream: ({ params }) => {
      const { enterpriseId } = params;
      if (!enterpriseId) return of(null);

      return this.counterService.aforosEnterprice(enterpriseId).pipe(
        catchError(() => {
          return of(null);
        })
      );
    }
  });

  searchSerialResult = rxResource({
    params: () => ({
      serial: this.searchSerialValue(),
      idEmpresa: this.empresaId(),
      isModalOpen: this.isAssignCounterModalOpen(),
    }),
    stream: ({ params: { serial, idEmpresa, isModalOpen } }) => {
      if (!serial || !isModalOpen || serial.length < 3) {
        this.isSearchingCounter.set(false);
        return of(null);
      }

      this.isSearchingCounter.set(true);
      return this.enterpriseClientCounterService
        .getClientBySerial(serial,idEmpresa)
        .pipe(
          catchError((error) => {
            console.error('Error buscando contador:', error);
            this.isSearchingCounter.set(false);
            return of(null);
          }),
        );
    },
  });

    statusCounter = rxResource({
    params: () => ({ code: 'EST_MEDIDOR' }),
    stream: ({ params }) => {
      const { code } = params;
      if (!code) return of(null);

      return this.counterService.typeAforo(code).pipe(
        catchError(() => {
          return of(null);
        })
      );
    }
  });

  readonly employeeData = computed(
    () => this.dataEmployee.value()?.response || [],
  );
  readonly clientData = computed(
    () => this.dataClient.value()?.response || null,
  );

  readonly mappedContadoresData = computed((): IPaginatedResponse<any> | null => {
    const data = this.dataContadores.value();
    if (!data?.response) return null;
    const r = data.response;

    return {
      success: true,
      message: '',
      code: 200,
      totalCount: r.totalElements ?? 0,
      pageSize: r.pageSize ?? 5,
      currentPage: r.pageNumber ?? 0,
      totalPages: r.totalPages ?? 0,
      response: (r.contadores || []).map((c: any) => ({
        id: c.id,
        idEmpresaClienteContador: c.idEmpresaClienteContador,
        serial: c.serial || '',
        tipoContadorNombre: c.tipoContador?.nombre || '',
        estadoNombre: c.estadoContador?.descripcion || '',
        tipoUsoNombre: c.tipoUso?.nombre || '',
        empleadoNombre: c.empleadoNombre || '',
        corregimientoNombre: c.descripcion?.corregimiento?.nombre || '',
        estrato: c.estrato,
        nuid: c.nuid ?? '',
        ruta: c.ruta ?? '',
        activo: c.activo,
        _raw: c,
      })),
    };
  });

  readonly contadorColumns = signal<TableColumn[]>([
    { field: 'serial', header: 'Serial', type: 'text' },
    { field: 'nuid', header: 'NUID', type: 'text' },
    { field: 'ruta', header: 'Ruta', type: 'text' },
    { field: 'estadoNombre', header: 'Estado', type: 'text' },
    { field: 'tipoUsoNombre', header: 'Tipo Uso', type: 'text' },
    { field: 'empleadoNombre', header: 'Empleado', type: 'text' },
    { field: 'corregimientoNombre', header: 'Corregimiento', type: 'text' },
    { field: 'estrato', header: 'Estrato', type: 'number' },
  ]);
  readonly availableAforos = computed(() => {
    const data = this.typesAforos.value();
    if (!data?.response || data?.success === false) return [];
    return Array.isArray(data.response) ? data.response : [data.response];
  });

  readonly availableStatusCounter = computed(() => {
    const data = this.statusCounter.value();
    if (!data?.response || data?.success === false) return [];
    return Array.isArray(data.response) ? data.response : [data.response];
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

    // Effects para el formulario de contador
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

    effect(() => {
      const clienteData = this.clientData();
      if (clienteData) {
        this.selectedClient.set(clienteData);
        this.loadClientFromApiData(clienteData);
      }
    });

    // Actualizar mapa contadorId -> idEmpresaClienteContador cuando cargan los contadores
    effect(() => {
      const data = this.dataContadores.value();
      if (data?.response?.contadores) {
        const newMap = new Map<number, number>();
        data.response.contadores.forEach((c: any) => {
          if (c.id && c.idEmpresaClienteContador) {
            newMap.set(c.id, c.idEmpresaClienteContador);
          }
        });
        this.contadorEmpresaClienteMap.set(newMap);
      }
    });

    // Effect para actualizar nombres de aforos cuando availableAforos esté cargado
    effect(() => {
      const aforos = this.availableAforos();
      const contadoresArray = this.contadoresFormArray;

      if (aforos && aforos.length > 0 && contadoresArray && contadoresArray.length > 0) {
        contadoresArray.controls.forEach((control, index) => {
          const aforosIds = control.get('aforosContador')?.value || [];
          if (aforosIds.length > 0) {
            this.updateAforoNombreForCounter(index, aforosIds);
          }
        });
      }
    });

    // Effect para actualizar estado de carga de búsqueda de contador
    effect(() => {
      const result = this.searchSerialResult.value();
      const isLoading = this.searchSerialResult.isLoading();

      if (!isLoading) {
        this.isSearchingCounter.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.initializeCounterForm();
    this.initializeEditCounterForm();
    this.loadInitialData();
    this.setupFormValueChanges();
    this.setupCounterFormValueChanges();

    // Capturar el empresaClienteContadorId desde la ruta
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !Number.isNaN(Number(id))) {
      this.empresaClienteContadorId.set(Number(id));
    } else {
      this.toast.error('Error', 'ID de cliente no válido');
      this.router.navigate(['/shell/client']);
    }
  }
  private initializeForm(): void {
    this.updateForm = this.fb.group({
      tipoDocumento: [null],
      numeroDocumento: [''],
      primerNombre: [''],
      segundoNombre: [''],
      primerApellido: [''],
      segundoApellido: [''],
      idDepartamento: [''],
      idCiudad: [''],
      idCorregimiento: [''],
      direccion: [''],
      telefono: [''],
      correo: ['', [Validators.email]],
      codigosResidenciaFiscal: [''], // Formato: "O-13;230;24"
      contadores: this.fb.array([]), // Agregar FormArray para contadores
    });
  }

  private loadInitialData(): void {
    this.loadDepartments();
    this.loadTypeDocuments();
    this.loadTiposContador();
  }

  // Getter para acceder al FormArray de contadores
  get contadoresFormArray(): FormArray {
    return this.updateForm.get('contadores') as FormArray;
  }

  // Crear FormGroup para un contador
  private createCounterFormGroup(contador: any): FormGroup {
    // Si es un contador nuevo, no aplicar validadores ya que solo se enviará el ID
    const isNew = contador.isNewCounter || false;

    return this.fb.group({
      id: [contador.id],
      idEmpresaClienteContador: [contador.idEmpresaClienteContador],
      serial: [
        contador.serial || '',
      ],
      nuid: [contador.nuid || null],
      ruta: [contador.ruta || ''],
      tipoContador: [
        contador.tipoContador?.id,
      ],
      tipoUso: [
        contador.tipoUso?.id || '',
      ],
      estadoContador: [
        contador.estadoContador?.id || '',
      ],
      activo: [contador.activo],
      isNewCounter: [isNew],
      porEstrato: [contador.porEstrato || false],
      estrato: [
        contador.estrato || '',
        [Validators.min(1), Validators.max(6)],
      ],
      digitos: [
        contador.digitos || '',
        [Validators.min(1)],
      ],
      fechaInstalacion: [contador.fechaInstalacion || ''],
      idEmpleadoEmpresa: [contador.empleadoEmpresaId || ''],
      aforosContador: [
        contador.aforoContador?.map((a: any) => a.id) || []
      ],
      aforoContadorNombre: [
        contador.aforoContador?.map((a: any) => a.nombre).join(', ') || ''
      ],
      // Guardar los datos completos de aforoContador con IDs de la tabla de relación
      aforosContadorData: [
        contador.aforoContador || []
      ],

      // Campos editables de ubicación
      idDepartamento: [
        contador.descripcion?.departamento?.id || '',
      ],
      idCiudad: [
        contador.descripcion?.ciudad?.id || '',
      ],
      idCorregimiento: [contador.descripcion?.corregimiento?.id || ''],

      descripcion: this.fb.group({
        id: [contador.descripcion?.id],
        departamento: this.fb.group({
          id: [contador.descripcion?.departamento?.id],
        }),
        ciudad: this.fb.group({
          id: [contador.descripcion?.ciudad?.id],
        }),
        corregimiento: this.fb.group({
          id: [contador.descripcion?.corregimiento?.id],
        }),
        descripcion: [
          contador.descripcion?.descripcion,
        ],
      }),
      // Campos para mostrar nombres (solo lectura)
      departamentoNombre: [contador.descripcion?.departamento?.nombre],
      ciudadNombre: [contador.descripcion?.ciudad?.nombre],
      corregimientoNombre: [contador.descripcion?.corregimiento?.nombre],
      tipoContadorNombre: [contador.tipoContador?.nombre],
      tipoUsoNombre: [contador.tipoUso?.nombre],
      estadoContadorNombre: [contador.estadoContador?.descripcion],
    });
  }

  // Cargar contadores en el FormArray
  private loadContadoresInForm(contadores: any[]): void {
    const contadoresArray = this.contadoresFormArray;
    // Limpiar FormArray existente
    while (contadoresArray.length !== 0) {
      contadoresArray.removeAt(0);
    }
    // Agregar cada contador al FormArray
    for (const contador of contadores) {
      contadoresArray.push(this.createCounterFormGroup(contador));
    }

    // Configurar value changes después de cargar todos los contadores
    setTimeout(() => {
      this.setupCounterValueChanges();
    }, 100);
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
      },
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
      },
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
      },
    });
  }

  // Métodos para cargar ubicaciones específicas de contadores
  private loadCounterCitiesByIndex(
    counterIndex: number,
    departmentId: number,
  ): void {
    this.locationService.getCiudades(departmentId).subscribe({
      next: (response) => {
        const currentCities = this.contadorCiudades();
        this.contadorCiudades.set({
          ...currentCities,
          [counterIndex]: response.response,
        });
      },
      error: (error) => {},
    });
  }

  private loadCounterCorregimientosByIndex(
    counterIndex: number,
    cityId: number,
  ): void {
    this.locationService.getCorregimientos(cityId).subscribe({
      next: (response) => {
        const currentCorregimientos = this.contadorCorregimientos();
        this.contadorCorregimientos.set({
          ...currentCorregimientos,
          [counterIndex]: response.response,
        });
      },
      error: (error) => {},
    });
  }

  private loadTypeDocuments(): void {
    this.typeDocumentService.getAllTypeDocument().subscribe({
      next: (response) => {
        this.tiposDocumento.set(response.response);
      },
      error: () => {
        this.toast.error(
          'Error',
          'No se pudieron cargar los tipos de documento',
        );
      },
    });
  }

  private loadTiposContador(): void {
    this.typeCounterService.getAllTypeCounters().subscribe({
      next: (response) => {
        this.tiposContador.set(response.response);
      },
      error: () => {
        this.toast.error(
          'Error',
          'No se pudieron cargar los tipos de contador',
        );
      },
    });
  }

  private setupFormValueChanges(): void {
    this.updateForm
      .get('idDepartamento')
      ?.valueChanges.subscribe((departamentoId) => {
        const numericDeptId = departamentoId ? Number(departamentoId) : null;

        if (this.selectedDepartmentId() !== numericDeptId) {
          this.selectedDepartmentId.set(numericDeptId);
          this.updateForm.patchValue(
            {
              idCiudad: '',
              idCorregimiento: '',
            },
            { emitEvent: false },
          );
        }
      });

    this.updateForm.get('idCiudad')?.valueChanges.subscribe((cityId) => {
      const numericCityId = cityId ? Number(cityId) : null;
      if (this.selectedCityId() !== numericCityId) {
        this.selectedCityId.set(numericCityId);
        this.updateForm.patchValue(
          {
            idCorregimiento: '',
          },
          { emitEvent: false },
        );
      }
    });

    // Configurar listeners para cada contador
    this.setupCounterValueChanges();
  }

  private setupCounterValueChanges(): void {
    const contadoresArray = this.contadoresFormArray;

    for (let index = 0; index < contadoresArray.controls.length; index++) {
      const contadorControl = contadoresArray.controls[index];
      const currentDeptId = contadorControl.get('idDepartamento')?.value;
      const currentCityId = contadorControl.get('idCiudad')?.value;

      if (currentDeptId) {
        this.loadCounterCitiesByIndex(index, Number(currentDeptId));
        if (currentCityId) {
          this.loadCounterCorregimientosByIndex(index, Number(currentCityId));
        }
      }

      // Listener para cambios en departamento del contador
      contadorControl
        .get('idDepartamento')
        ?.valueChanges.subscribe((departamentoId) => {
          const numericDeptId = departamentoId ? Number(departamentoId) : null;
          if (numericDeptId) {
            this.loadCounterCitiesByIndex(index, numericDeptId);
            contadorControl
              .get('descripcion.departamento.id')
              ?.setValue(numericDeptId, { emitEvent: false });
            contadorControl.patchValue(
              {
                idCiudad: '',
                idCorregimiento: '',
              },
              { emitEvent: false },
            );
            contadorControl
              .get('descripcion.ciudad.id')
              ?.setValue('', { emitEvent: false });
            contadorControl
              .get('descripcion.corregimiento.id')
              ?.setValue('', { emitEvent: false });
          } else {
            // Limpiar datos cuando no hay departamento seleccionado
            const currentCities = this.contadorCiudades();
            const currentCorregimientos = this.contadorCorregimientos();
            this.contadorCiudades.set({
              ...currentCities,
              [index]: [],
            });
            this.contadorCorregimientos.set({
              ...currentCorregimientos,
              [index]: [],
            });

            // Limpiar campo anidado
            contadorControl
              .get('descripcion.departamento.id')
              ?.setValue('', { emitEvent: false });
          }
        });

      // Listener para cambios en ciudad del contador
      contadorControl.get('idCiudad')?.valueChanges.subscribe((cityId) => {
        const numericCityId = cityId ? Number(cityId) : null;

        if (numericCityId) {
          this.loadCounterCorregimientosByIndex(index, numericCityId);

          // Actualizar también el campo anidado
          contadorControl
            .get('descripcion.ciudad.id')
            ?.setValue(numericCityId, { emitEvent: false });

          // Limpiar corregimiento
          contadorControl.patchValue(
            {
              idCorregimiento: '',
            },
            { emitEvent: false },
          );

          // Limpiar campo anidado también
          contadorControl
            .get('descripcion.corregimiento.id')
            ?.setValue('', { emitEvent: false });
        } else {
          // Limpiar corregimientos cuando no hay ciudad seleccionada
          const currentCorregimientos = this.contadorCorregimientos();
          this.contadorCorregimientos.set({
            ...currentCorregimientos,
            [index]: [],
          });

          // Limpiar campo anidado
          contadorControl
            .get('descripcion.ciudad.id')
            ?.setValue('', { emitEvent: false });
        }
      });

      // Listener para cambios en corregimiento del contador
      contadorControl
        .get('idCorregimiento')
        ?.valueChanges.subscribe((corregimientoId) => {
          const numericCorrId = corregimientoId
            ? Number(corregimientoId)
            : null;

          // Actualizar también el campo anidado
          if (numericCorrId) {
            contadorControl
              .get('descripcion.corregimiento.id')
              ?.setValue(numericCorrId, { emitEvent: false });
          } else {
            contadorControl
              .get('descripcion.corregimiento.id')
              ?.setValue('', { emitEvent: false });
          }
        });
    }
  }

  private loadClientFromApiData(clienteData: any): void {
    if (!clienteData?.persona) return;

    const { persona, correo, telefono } = clienteData;
    const { direccion } = persona;
    // Usar departamento de la dirección del cliente (no del contador)
    const departamento = direccion?.departamento;

    this.clienteUbicacionActual.set({
      departamento: departamento?.nombre || '',
      ciudad: direccion?.ciudad?.nombre || '',
      corregimiento: direccion?.corregimiento?.nombre || null,
      direccion: direccion?.descripcion || '',
    });

    if (clienteData.codigosResidenciaFiscal) {
      const codigosArray = clienteData.codigosResidenciaFiscal.split(';').filter((c: string) => c.trim());
      this.selectedCodigosResidenciaFiscal.set(codigosArray);
    }

    // Llenar el formulario con los datos del cliente
    const formValues = {
      tipoDocumento: persona.tipoDocumento?.id || 1,
      numeroDocumento: persona.numeroCedula || '',
      primerNombre: persona.nombre || '',
      segundoNombre: persona.segundoNombre || '',
      primerApellido: persona.apellido || '',
      segundoApellido: persona.segundoApellido || '',
      telefono: telefono || '',
      correo: correo || '',
      direccion: direccion?.descripcion || '',
      codigosResidenciaFiscal: clienteData.codigosResidenciaFiscal || '',
      idDepartamento: departamento?.id || '',
      idCiudad: direccion?.ciudad?.id || '',
      idCorregimiento: direccion?.corregimiento?.id || '',
    };

    this.updateForm.patchValue(formValues, { emitEvent: false });

    // Marcar formulario como pristine después de cargar datos iniciales
    setTimeout(() => this.updateForm.markAsPristine(), 200);

    // Establecer los IDs para cargar las listas dependientes
    if (departamento?.id) {
      this.selectedDepartmentId.set(departamento.id);
    }
    if (direccion?.ciudad?.id) {
      this.selectedCityId.set(direccion.ciudad.id);
    }
  }

  onSubmit(): void {
    // Validar formulario antes de continuar
    if (this.updateForm.invalid) {
      this.toast.error('Error', 'Por favor corrija los errores del formulario antes de guardar');
      return;
    }

    // Verificar si hay cambios
    const formDirty = this.updateForm.dirty;
    const tarifasDirty = this.hasTarifasChanged();

    if (!formDirty && !tarifasDirty) {
      this.toast.info('Información', 'No hay cambios para guardar');
      return;
    }

    // Obtener contadores donde solo cambió el empleado
    const employeeChanges = this.getCountersWithEmployeeChange();

    // Obtener aforos a eliminar
    const aforosToDelete = this.getAforosToDelete();

    // Verificar si hay cambios además de los empleados
    const hasOtherChanges = this.hasOtherChanges(employeeChanges.length);

    // Crear array de observables para ejecutar en secuencia
    const requests: any[] = [];

    // 1. Eliminar aforos si es necesario
    if (aforosToDelete.length > 0) {
      const deleteRequests = aforosToDelete.map((idAforoContador) =>
        this.counterService.deleteAforoContador(idAforoContador)
      );
      requests.push(...deleteRequests);
    }

    // 2. Actualizar empleados de contadores si es necesario
    if (employeeChanges.length > 0) {
      const employeeRequests = employeeChanges.map((change) =>
        this.updateCounterEmployee(change)
      );
      requests.push(...employeeRequests);
    }

    // Ejecutar peticiones preparatorias si existen
    if (requests.length > 0) {
      forkJoin(requests).subscribe({
        next: () => {
          // Solo proceder con la actualización general si hay otros cambios
          if (hasOtherChanges) {
            this.proceedWithUpdate();
          } else {
            // Si solo hubo cambios de empleado, solo recargar y marcar como pristine
            this.toast.success('Éxito', 'Cambios guardados correctamente');
            this.dataClient.reload();
            this.updateForm.markAsPristine();
          }
        },
        error: (err) => {
          console.error('Error en actualizaciones preparatorias:', err);
          this.toast.error('Error', 'No se pudieron completar algunas actualizaciones');
        },
      });
    } else {
      // Si no hay peticiones preparatorias pero hay otros cambios, proceder directamente
      if (hasOtherChanges) {
        this.proceedWithUpdate();
      } else {
        this.toast.info('Información', 'No hay cambios para guardar');
      }
    }
  }

  private proceedWithUpdate(): void {
    // Construir payload solo con campos modificados
    const dirtyFields = this.getDirtyValues(this.updateForm);
    const payload: any = {
      idEmpresaClienteContador: this.empresaClienteContadorId(),
      usuarioCambio: this.usuarioModificacion(),
      ...this.mapDirtyFieldsToPayload(dirtyFields),
    };

    // Agregar contadores si fueron modificados o nuevos
    const dirtyCounters = this.getDirtyCounters();
    if (dirtyCounters.modified) {
      payload.contadores = dirtyCounters.modified;
    }
    if (dirtyCounters.new) {
      payload.contadoresNuevos = dirtyCounters.new;
    }

    // Agregar aforos si fueron modificados
    const aforosPayload = this.buildAforosPayload();

    // Agregar nuevos aforos
    if (aforosPayload.nuevos && aforosPayload.nuevos.length > 0) {
      payload.aforosContador = aforosPayload.nuevos;
    }

    // Agregar aforos actualizados (aunque no cambien, mantienen la relación)
    if (aforosPayload.actualizados && aforosPayload.actualizados.length > 0) {
      if (!payload.aforosContador) {
        payload.aforosContador = [];
      }
      // Combinar nuevos y actualizados si ambos existen
      payload.aforosContador = [...payload.aforosContador, ...aforosPayload.actualizados];
    }

    // Preparar peticiones de tarifas si cambiaron
    const tarifasDirty = this.hasTarifasChanged();
    const tarifasPayloads = tarifasDirty ? this.buildTarifasPayload() : [];

    // Crear array de observables
    const requests: any[] = [];

    // Primero enviar actualizaciones de tarifas (una por cada contador)
    if (tarifasPayloads.length > 0) {
      tarifasPayloads.forEach(tarifaPayload => {
        requests.push(this.enterpriseClientCounterService.updateClient(tarifaPayload));
      });
    }

    // Luego enviar el resto de cambios del cliente (si hay)
    const hasOtherChanges = Object.keys(payload).length > 2 || // Más que idEmpresaClienteContador y usuarioCambio
                            (payload.contadores && payload.contadores.length > 0) ||
                            (payload.contadoresNuevos && payload.contadoresNuevos.length > 0) ||
                            (payload.aforosContador && payload.aforosContador.length > 0);

    if (hasOtherChanges) {
      requests.push(this.enterpriseClientCounterService.updateClient(payload));
    }

    // Ejecutar todas las peticiones
    if (requests.length > 0) {
      forkJoin(requests).subscribe({
        next: () => {
          this.toast.success('Éxito', 'Cliente actualizado correctamente');
          this.dataClient.reload();
          this.updateForm.markAsPristine();
          this.originalTarifas.set([...this.selectedTarifas()]);

          // Limpiar el registro de contadores con tarifas modificadas
          this.contadoresConTarifasModificadas.set(new Set());
          this.tarifasPorContador.set(new Map());
          this.conceptosPorContador.set(new Map());

          // Marcar los campos de empleado como pristine también
          this.contadoresFormArray.controls.forEach((control) => {
            const empleadoControl = control.get('idEmpleadoEmpresa');
            if (empleadoControl) {
              empleadoControl.markAsPristine();
            }
          });
        },
        error: (err) => {
          console.error('Error actualizando cliente:', err);
          this.toast.error('Error', 'No se pudo actualizar el cliente');
        },
      });
    } else {
      this.toast.info('Información', 'No hay cambios para guardar');
    }
  }

  // Obtener contadores donde solo cambió el empleado
  private getCountersWithEmployeeChange(): Array<{
    idEmpresaClienteContador: number;
    idEmpleadoEmpresa: number;
  }> {
    const contadoresArray = this.contadoresFormArray;
    const employeeChanges: Array<{
      idEmpresaClienteContador: number;
      idEmpleadoEmpresa: number;
    }> = [];

    contadoresArray.controls.forEach((control) => {
      const contador = control.value;
      const empleadoControl = control.get('idEmpleadoEmpresa');
      const isEmpleadoDirty = empleadoControl && empleadoControl.dirty;

      // Verificar si el contador está dirty excluyendo el campo de empleado y aforos
      const isCounterDirty = this.isCounterDirtyExcludingAforos(control);

      // Si solo cambió el empleado (no otros campos)
      if (isEmpleadoDirty && !isCounterDirty && contador.idEmpresaClienteContador) {
        employeeChanges.push({
          idEmpresaClienteContador: contador.idEmpresaClienteContador,
          idEmpleadoEmpresa: contador.idEmpleadoEmpresa ? Number(contador.idEmpleadoEmpresa) : 0,
        });
      }
    });

    return employeeChanges;
  }

  // Verificar si hay cambios además de los empleados
  private hasOtherChanges(employeeChangesCount: number): boolean {
    // Verificar si hay cambios en tarifas
    if (this.hasTarifasChanged()) {
      return true;
    }

    // Verificar si hay campos modificados en el formulario principal (excluyendo contadores)
    const mainFormControls = Object.keys(this.updateForm.controls).filter(
      key => key !== 'contadores'
    );
    const hasMainFormChanges = mainFormControls.some(
      key => this.updateForm.get(key)?.dirty
    );
    if (hasMainFormChanges) {
      return true;
    }

    // Verificar si hay contadores modificados o nuevos (excluyendo solo cambios de empleado)
    const dirtyCounters = this.getDirtyCounters();
    if (dirtyCounters.modified && dirtyCounters.modified.length > 0) {
      return true;
    }
    if (dirtyCounters.new && dirtyCounters.new.length > 0) {
      return true;
    }

    // Verificar si hay aforos modificados
    const aforosPayload = this.buildAforosPayload();
    if ((aforosPayload.nuevos && aforosPayload.nuevos.length > 0) ||
        (aforosPayload.actualizados && aforosPayload.actualizados.length > 0)) {
      return true;
    }

    return false;
  }

  // Actualizar empleado de un contador específico
  private updateCounterEmployee(change: {
    idEmpresaClienteContador: number;
    idEmpleadoEmpresa: number;
  }) {
    const payload = {
      idEmpresaClienteContador: change.idEmpresaClienteContador,
      usuarioCambio: this.usuarioModificacion(),
      idEmpleadoEmpresa: change.idEmpleadoEmpresa,
    };

    return this.enterpriseClientCounterService.updateClient(payload);
  }

  goBack(): void {
    this.router.navigate(['/shell/client']);
  }

  // ==================== INACTIVAR CONTADOR ====================

  confirmDeleteCounter(index: number, contadorId: number, serial: string, idEmpresaClienteContador: number): void {
    this.counterToDelete.set({ index, id: contadorId, serial, idEmpresaClienteContador });
    this.showDeleteConfirmCounter.set(true);
  }

  getDeleteConfirmMessageCounter(): string {
    const counter = this.counterToDelete();
    if (!counter) return '';
    const serialText = counter.serial || 'Sin serial';
    return `¿Está seguro de que desea inactivar el contador ${serialText}?`;
  }

  confirmDeleteCounterAction(): void {
    const counter = this.counterToDelete();
    if (counter) {
      this.deleteCounter(counter.index, counter.id, counter.idEmpresaClienteContador);
    }
    this.showDeleteConfirmCounter.set(false);
    this.counterToDelete.set(null);
  }

  cancelDeleteCounter(): void {
    this.showDeleteConfirmCounter.set(false);
    this.counterToDelete.set(null);
  }

  // ==================== ELIMINAR AFORO DEL CONTADOR ====================

  confirmDeleteAforo(counterIndex: number, aforoId: number): void {
    const aforoName = this.getAforoNameById(aforoId);
    const contadorControl = this.contadoresFormArray.at(counterIndex);
    const aforosData = contadorControl?.get('aforosContadorData')?.value || [];

    // Buscar si tiene idAforoContador
    const aforoData = aforosData.find((a: any) => a.id === aforoId);
    const idAforoContador = aforoData?.idAforoContador;

    this.aforoToDelete.set({
      counterIndex,
      aforoId,
      aforoName,
      idAforoContador
    });
    this.showDeleteConfirmAforo.set(true);
  }

  getDeleteConfirmMessageAforo(): string {
    const aforo = this.aforoToDelete();
    if (!aforo) return '';
    return `¿Está seguro de que desea eliminar el aforo "${aforo.aforoName}" de este contador?`;
  }

  confirmDeleteAforoAction(): void {
    const aforo = this.aforoToDelete();
    if (aforo) {
      this.removeAforoFromCounter(aforo.counterIndex, aforo.aforoId, aforo.idAforoContador);
    }
    this.showDeleteConfirmAforo.set(false);
    this.aforoToDelete.set(null);
  }

  cancelDeleteAforo(): void {
    this.showDeleteConfirmAforo.set(false);
    this.aforoToDelete.set(null);
  }

  private removeAforoFromCounter(counterIndex: number, aforoId: number, idAforoContador?: number): void {
    const contadorControl = this.contadoresFormArray.at(counterIndex);
    if (!contadorControl) return;

    // Si tiene idAforoContador, significa que ya existe en el backend y debe eliminarse
    if (idAforoContador) {
      this.counterService.deleteAforoContador(idAforoContador).subscribe({
        next: () => {
          this.toast.success('Éxito', 'Aforo eliminado correctamente');

          // Actualizar el formulario removiendo el aforo
          this.onCounterAforoSelect(counterIndex, aforoId);

          // Actualizar aforosContadorData para remover el aforo eliminado
          const aforosData = contadorControl.get('aforosContadorData')?.value || [];
          const updatedAforosData = aforosData.filter((a: any) => a.id !== aforoId);
          contadorControl.patchValue({
            aforosContadorData: updatedAforosData
          });

          // Marcar como pristine para que no se intente eliminar de nuevo en onSubmit
          contadorControl.get('aforosContador')?.markAsPristine();
        },
        error: (err) => {
          console.error('Error eliminando aforo:', err);
          this.toast.error('Error', 'No se pudo eliminar el aforo');
        },
      });
    } else {
      // Si no tiene idAforoContador, es un aforo recién agregado que aún no se ha guardado
      // Simplemente removelo del formulario
      this.onCounterAforoSelect(counterIndex, aforoId);
      this.toast.info('Información', 'Aforo removido de la selección');
    }
  }

  private deleteCounter(index: number, contadorId: number, idEmpresaClienteContador: number): void {
    // Fallback al ID de la ruta si el contador no tiene idEmpresaClienteContador propio
    const eccId = idEmpresaClienteContador || this.empresaClienteContadorId();
    if (!eccId) {
      this.toast.error('Error', 'No se pudo obtener el ID de empresa-cliente-contador');
      return;
    }

    const payload = {
      idEmpresaClienteContador: eccId,
      usuarioCambio: this.usuarioModificacion(),
      activo: false,
    };

    this.enterpriseClientCounterService
      .updateClient(payload)
      .subscribe({
        next: (response) => {
          this.toast.success('Éxito', 'Contador inactivado correctamente');
          this.dataContadores.reload();
        },
        error: (err) => {
          console.error('Error inactivando contador:', err);
          const errorMessage = err?.error?.message || 'No se pudo inactivar el contador';
          this.toast.error('Error', errorMessage);
        },
      });
  }

  openAssignCounterModal(): void {
    this.isAssignCounterModalOpen.set(true);
    this.searchSerialValue.set('');
  }

  closeAssignCounterModal(): void {
    this.isAssignCounterModalOpen.set(false);
    this.searchSerialValue.set('');
  }

  onSearchSerialChange(value: string): void {
    this.searchSerialValue.set(value);
  }

  assignCounterToClient(counterData: any): void {
    if (!counterData || !counterData.id) {
      this.toast.error('Error', 'Seleccione un contador válido');
      return;
    }

    const payload = {
      idEmpresaClienteContador: this.empresaClienteContadorId(),
      usuarioCambio: this.usuarioModificacion(),
      contadoresNuevos: [{
        id: counterData.id,
        idEmpleado: counterData.empleadoEmpresaId,
       }],
    };

    this.enterpriseClientCounterService.updateClient(payload).subscribe({
      next: (response) => {
        this.toast.success('Éxito', 'Contador asignado correctamente');
        this.closeAssignCounterModal();
        this.dataContadores.reload();
      },
      error: (err) => {
        console.error('Error asignando contador:', err);
        const errorMessage =
          err?.error?.message || 'No se pudo asignar el contador';
        this.toast.error('Error', errorMessage);
      },
    });
  }

  // ==================== GESTIÓN DE TARIFAS ====================

  // Confirmación de inactivación desde la tabla de contadores
  confirmDeleteCounterFromRow(row: any): void {
    this.counterToDelete.set({
      index: -1,
      id: row.id,
      serial: row.serial,
      idEmpresaClienteContador: row.idEmpresaClienteContador,
    });
    this.showDeleteConfirmCounter.set(true);
  }

  // Abrir modal de tarifas desde la tabla (recibe la fila de la tabla)
  openTarifasModalFromRow(row: any): void {
    const contadorId = row.id;
    const idEmpresaClienteContador = row.idEmpresaClienteContador;
    const contadorData = row._raw;

    const currentMap = new Map(this.contadorEmpresaClienteMap());
    currentMap.set(contadorId, idEmpresaClienteContador);
    this.contadorEmpresaClienteMap.set(currentMap);

    this.selectedCounterForTarifas.set(contadorId);
    this.loadTarifasModalState(contadorId, contadorData);
    this.isTarifasModalOpen.set(true);
  }

  private loadTarifasModalState(contadorId: number, contadorData: any): void {
    this.selectedCounterData.set(contadorData);

    const tarifasGuardadas = this.tarifasPorContador().get(contadorId);
    const conceptosGuardados = this.conceptosPorContador().get(contadorId);

    const tarifasACargar = tarifasGuardadas?.length
      ? [...tarifasGuardadas]
      : this.extractActiveTarifaIds(contadorData);

    const conceptosACargar = conceptosGuardados
      ? this.cloneConceptosMap(conceptosGuardados)
      : this.extractActiveConceptosMap(contadorData);

    conceptosACargar.forEach((ids, tarifaId) => {
      if (ids.length > 0 && !tarifasACargar.includes(tarifaId)) {
        tarifasACargar.push(tarifaId);
      }
    });

    this.selectedTarifas.set([...tarifasACargar]);
    this.tempSelectedTarifas.set([...tarifasACargar]);
    this.originalTarifas.set([...tarifasACargar]);
    this.tempSelectedConceptos.set(conceptosACargar);
    this.originalConceptos.set(this.cloneConceptosMap(conceptosACargar));
  }

  private parseTiposTarifaFaltantes(faltantes: unknown): ITiposTarifaFaltantes {
    if (!faltantes) {
      return { tiposTarifa: [], tiposConcepto: [] };
    }
    if (Array.isArray(faltantes)) {
      return { tiposTarifa: faltantes, tiposConcepto: [] };
    }
    const data = faltantes as ITiposTarifaFaltantes;
    return {
      tiposTarifa: data.tiposTarifa || [],
      tiposConcepto: data.tiposConcepto || [],
    };
  }

  private isTarifaActivaEnContador(contadorData: any, tarifaId: number): boolean {
    const entries = (contadorData?.tarifasContadores || []).filter(
      (tc: any) => tc.tipoTarifa?.id === tarifaId,
    );
    if (entries.length === 0) {
      return false;
    }
    const baseEntries = entries.filter((tc: any) => !tc.tipoConcepto?.id);
    if (baseEntries.length > 0) {
      return baseEntries.some((tc: any) => tc.aplica);
    }
    return entries.some((tc: any) => tc.aplica);
  }

  private extractActiveTarifaIds(contadorData: any): number[] {
    const faltantes = this.parseTiposTarifaFaltantes(contadorData?.tiposTarifaFaltantes);
    const tarifaIds = new Set<number>(
      (contadorData?.tarifasContadores || [])
        .map((tc: any) => tc.tipoTarifa?.id)
        .filter((id: number | undefined) => id !== undefined) as number[],
    );
    const fromTarifasContadores = [...tarifaIds].filter((id) =>
      this.isTarifaActivaEnContador(contadorData, id),
    );
    const fromFaltantes = faltantes.tiposTarifa.map((t) => t.id);
    return [...new Set([...fromTarifasContadores, ...fromFaltantes])];
  }

  private extractActiveConceptosMap(contadorData: any): Map<number, number[]> {
    const result = new Map<number, number[]>();
    const faltantes = this.parseTiposTarifaFaltantes(contadorData?.tiposTarifaFaltantes);
    // Conjunto de tarifas realmente activas (respeta la entrada base + faltantes tipo-tarifa).
    const tarifasActivas = new Set(this.extractActiveTarifaIds(contadorData));

    (contadorData?.tarifasContadores || []).forEach((cc: any) => {
      if (
        cc.aplica &&
        cc.tipoTarifa?.id &&
        cc.tipoConcepto?.id &&
        tarifasActivas.has(cc.tipoTarifa.id)
      ) {
        this.addConceptoToMap(result, cc.tipoTarifa.id, cc.tipoConcepto.id);
      }
    });

    faltantes.tiposConcepto.forEach((concepto) => {
      const tempMap = new Map<number, number[]>();
      this.assignFaltanteConceptoToTarifas(concepto, tempMap);
      tempMap.forEach((ids, tarifaId) => {
        if (tarifasActivas.has(tarifaId)) {
          ids.forEach((id) => this.addConceptoToMap(result, tarifaId, id));
        }
      });
    });

    return result;
  }

  private addConceptoToMap(
    map: Map<number, number[]>,
    tarifaId: number,
    conceptoId: number,
  ): void {
    const current = map.get(tarifaId) || [];
    if (!current.includes(conceptoId)) {
      map.set(tarifaId, [...current, conceptoId]);
    }
  }

  private assignFaltanteConceptoToTarifas(
    concepto: ITipoConcepto,
    map: Map<number, number[]>,
  ): void {
    const conceptosPorTarifa = this.conceptosPorTarifa();
    let assigned = false;

    conceptosPorTarifa.forEach((conceptos, tarifaId) => {
      if (conceptos.some((c) => c.id === concepto.id)) {
        this.addConceptoToMap(map, tarifaId, concepto.id);
        assigned = true;
      }
    });

    if (!assigned) {
      this.todasLasTarifas().forEach((tarifa) => {
        if (
          concepto.codigo.startsWith(tarifa.codigo) ||
          concepto.codigo.includes(tarifa.codigo)
        ) {
          this.addConceptoToMap(map, tarifa.id, concepto.id);
        }
      });
    }
  }

  private cloneConceptosMap(map: Map<number, number[]>): Map<number, number[]> {
    return new Map(Array.from(map.entries()).map(([k, v]) => [k, [...v]]));
  }

  private toggleItemInList(list: number[], id: number): number[] {
    return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
  }

  private isPairActive(
    tarifaId: number,
    conceptoId: number,
    tarifasActivas: number[],
    conceptosMap: Map<number, number[]>,
  ): boolean {
    return (
      tarifasActivas.includes(tarifaId) &&
      (conceptosMap.get(tarifaId) || []).includes(conceptoId)
    );
  }

  private collectTarifaConceptoPairs(
    contadorData: any,
    extraTarifaIds: number[] = [],
  ): Array<{ tarifaId: number; conceptoId: number }> {
    const pairs = new Map<string, { tarifaId: number; conceptoId: number }>();
    const addPair = (tarifaId: number, conceptoId: number): void => {
      if (tarifaId && conceptoId) {
        pairs.set(`${tarifaId}-${conceptoId}`, { tarifaId, conceptoId });
      }
    };

    (contadorData?.tarifasContadores || []).forEach((cc: any) => {
      addPair(cc.tipoTarifa?.id, cc.tipoConcepto?.id);
    });

    const faltantes = this.parseTiposTarifaFaltantes(contadorData?.tiposTarifaFaltantes);
    const tempMap = new Map<number, number[]>();
    faltantes.tiposConcepto.forEach((concepto) => {
      this.assignFaltanteConceptoToTarifas(concepto, tempMap);
    });
    tempMap.forEach((ids, tarifaId) => {
      ids.forEach((id) => addPair(tarifaId, id));
    });

    this.conceptosPorTarifa().forEach((conceptos, tarifaId) => {
      conceptos.forEach((c) => addPair(tarifaId, c.id));
    });

    extraTarifaIds.forEach((tarifaId) => {
      this.getConceptosForTarifa(tarifaId, contadorData).forEach((c) => addPair(tarifaId, c.id));
    });

    return Array.from(pairs.values());
  }

  private buildTarifaConceptoDiffPayload(
    idEmpresaClienteContador: number,
    contadorData: any,
    tarifasOriginales: number[],
    tarifasActuales: number[],
    conceptosOriginales: Map<number, number[]>,
    conceptosActuales: Map<number, number[]>,
  ): { idEmpresaClienteContador: number; usuarioCambio: string; tarifasContador: TarifaContadorUpdate[] } {
    const pairs = this.collectTarifaConceptoPairs(contadorData, [
      ...tarifasOriginales,
      ...tarifasActuales,
    ]);
    const tarifasContador: TarifaContadorUpdate[] = [];

    const originalTarifaSet = new Set(tarifasOriginales);
    const actualTarifaSet = new Set(tarifasActuales);
    const allTarifaIds = new Set<number>([
      ...tarifasOriginales,
      ...tarifasActuales,
      ...pairs.map((p) => p.tarifaId),
    ]);
    allTarifaIds.forEach((tarifaId) => {
      const originalActiva = originalTarifaSet.has(tarifaId);
      const actualActiva = actualTarifaSet.has(tarifaId);
      if (originalActiva !== actualActiva) {
        tarifasContador.push({
          idTipoTarifa: tarifaId,
          aplica: actualActiva,
        });
      }
    });

    // 2) Cambios a nivel de CONCEPTO.
    pairs.forEach(({ tarifaId, conceptoId }) => {
      const originalAplica = this.isPairActive(
        tarifaId,
        conceptoId,
        tarifasOriginales,
        conceptosOriginales,
      );
      const currentAplica = this.isPairActive(
        tarifaId,
        conceptoId,
        tarifasActuales,
        conceptosActuales,
      );

      if (originalAplica !== currentAplica) {
        tarifasContador.push({
          idTipoTarifa: tarifaId,
          idTipoConcepto: conceptoId,
          aplica: currentAplica,
        });
      }
    });

    return {
      idEmpresaClienteContador,
      usuarioCambio: this.usuarioModificacion(),
      tarifasContador,
    };
  }

  // === MODAL EDICIÓN DE CONTADOR ===

  private initializeEditCounterForm(): void {
    this.editCounterForm = this.fb.group({
      serial: [''],
      nuid: [''],
      ruta: [''],
      tipoContador: [''],
      tipoUso: [''],
      estadoContador: [''],
      estrato: ['', [Validators.min(1), Validators.max(6)]],
      digitos: [''],
      fechaInstalacion: [''],
      idEmpleadoEmpresa: [''],
      idDepartamento: [''],
      idCiudad: [''],
      idCorregimiento: [''],
      descripcion: [''],
      aforosContador: [[]],
      aforosContadorData: [[]],
    });

    this.editCounterForm.get('idDepartamento')?.valueChanges.subscribe((deptId) => {
      const numericId = deptId ? Number(deptId) : null;
      if (numericId) {
        this.locationService.getCiudades(numericId).subscribe({
          next: (r) => {
            this.editCounterCities.set(r.response);
            this.editCounterForm.patchValue({ idCiudad: '', idCorregimiento: '' }, { emitEvent: false });
            this.editCounterCorregimientos.set([]);
          },
        });
      }
    });

    this.editCounterForm.get('idCiudad')?.valueChanges.subscribe((cityId) => {
      const numericId = cityId ? Number(cityId) : null;
      if (numericId) {
        this.locationService.getCorregimientos(numericId).subscribe({
          next: (r) => {
            this.editCounterCorregimientos.set(r.response);
            this.editCounterForm.patchValue({ idCorregimiento: '' }, { emitEvent: false });
          },
        });
      }
    });
  }

  openEditCounterModal(row: any): void {
    const counter = row._raw;
    this.editingCounter.set(counter);

    const deptId = counter.descripcion?.departamento?.id;
    const cityId = counter.descripcion?.ciudad?.id;

    if (deptId) {
      this.locationService.getCiudades(Number(deptId)).subscribe({
        next: (r) => this.editCounterCities.set(r.response),
      });
    }
    if (cityId) {
      this.locationService.getCorregimientos(Number(cityId)).subscribe({
        next: (r) => this.editCounterCorregimientos.set(r.response),
      });
    }

    // Reset primero sin emitir eventos para no disparar los valueChanges en cascada
    this.editCounterForm.reset({}, { emitEvent: false });

    // Luego patchear con emitEvent: false para que las suscripciones a valueChanges
    // no borren los valores de ciudad/corregimiento recién cargados
    this.editCounterForm.patchValue({
      serial: counter.serial || '',
      nuid: counter.nuid || '',
      ruta: counter.ruta || '',
      tipoContador: counter.tipoContador?.id || '',
      tipoUso: counter.tipoUso?.id || '',
      estadoContador: counter.estadoContador?.id || '',
      estrato: counter.estrato || '',
      digitos: counter.digitos || '',
      fechaInstalacion: counter.fechaInstalacion || '',
      idEmpleadoEmpresa: counter.empleadoEmpresaId || '',
      idDepartamento: deptId || '',
      idCiudad: cityId || '',
      idCorregimiento: counter.descripcion?.corregimiento?.id || '',
      descripcion: counter.descripcion?.descripcion || '',
      aforosContador: (counter.aforoContador || []).map((a: any) => a.id),
      aforosContadorData: counter.aforoContador || [],
    }, { emitEvent: false });

    this.isEditCounterModalOpen.set(true);
  }

  closeEditCounterModal(): void {
    this.isEditCounterModalOpen.set(false);
    this.editingCounter.set(null);
    this.editCounterCities.set([]);
    this.editCounterCorregimientos.set([]);
    this.editCounterAforosDropdownOpen.set(false);
    this.editCounterAforosSearchTerm.set('');
  }

saveEditCounter(): void {
  const counter = this.editingCounter();
  if (!counter) return;

  const formData = this.editCounterForm.getRawValue();

  const originalAforosData: any[] = formData.aforosContadorData || [];
  const currentAforoIds: number[] = formData.aforosContador || [];

  const aforosToDelete = originalAforosData
    .filter((a: any) => !currentAforoIds.includes(a.id) && a.idAforoContador)
    .map((a: any) => a.idAforoContador as number);

  const aforosToAdd = currentAforoIds
    .filter((id: number) => !originalAforosData.some((a: any) => a.id === id))
    .map((aforoId: number) => ({ idContador: counter.id, idAforo: aforoId }));

  // Detectar cambio de empleado por separado (NO va dentro de contadores[])
  const empleadoVal = formData.idEmpleadoEmpresa;
  const empleadoCambio =
    empleadoVal && Number(empleadoVal) !== (counter.empleadoEmpresaId ?? null)
      ? Number(empleadoVal)
      : null;

  // Build payload comparando SOLO campos cambiados contra los valores originales
  // SIN incluir el empleado (se maneja aparte)
  const counterPayload: any = { id: counter.id };

  const orig = counter;

  const serialVal = formData.serial;
  if (serialVal !== null && serialVal !== undefined && serialVal !== '' && serialVal !== (orig.serial || '')) {
    counterPayload.serial = serialVal;
  }

  const nuidVal = formData.nuid;
  if (nuidVal !== null && nuidVal !== undefined && nuidVal !== '' && Number(nuidVal) !== (orig.nuid ?? null)) {
    counterPayload.nuid = Number(nuidVal);
  }

  const rutaVal = formData.ruta;
  if (rutaVal !== null && rutaVal !== undefined && rutaVal !== '' && rutaVal !== (orig.ruta || '')) {
    counterPayload.ruta = rutaVal;
  }

  const tipoContadorVal = formData.tipoContador;
  if (tipoContadorVal && Number(tipoContadorVal) !== (orig.tipoContador?.id ?? null)) {
    counterPayload.idTipoContador = Number(tipoContadorVal);
  }

  const tipoUsoVal = formData.tipoUso;
  if (tipoUsoVal && Number(tipoUsoVal) !== (orig.tipoUso?.id ?? null)) {
    counterPayload.idTipoUso = Number(tipoUsoVal);
  }

  const estadoVal = formData.estadoContador;
  if (estadoVal && Number(estadoVal) !== (orig.estadoContador?.id ?? null)) {
    counterPayload.idEstadoContador = Number(estadoVal);
  }

  const estratoVal = formData.estrato;
  if (
    estratoVal !== null && estratoVal !== undefined && estratoVal !== '' &&
    Number(estratoVal) >= 1 && Number(estratoVal) <= 6 &&
    Number(estratoVal) !== (orig.estrato ?? null)
  ) {
    counterPayload.estrato = Number(estratoVal);
  }

  const digitosVal = formData.digitos;
  if (digitosVal !== null && digitosVal !== undefined && digitosVal !== '' && Number(digitosVal) !== (orig.digitos ?? null)) {
    counterPayload.digitos = Number(digitosVal);
  }

  const deptVal = formData.idDepartamento;
  if (deptVal && Number(deptVal) !== (orig.descripcion?.departamento?.id ?? null)) {
    counterPayload.idDepartamento = Number(deptVal);
  }

  const cityVal = formData.idCiudad;
  if (cityVal && Number(cityVal) !== (orig.descripcion?.ciudad?.id ?? null)) {
    counterPayload.idCiudad = Number(cityVal);
  }

  const corrVal = formData.idCorregimiento;
  if (corrVal && Number(corrVal) !== (orig.descripcion?.corregimiento?.id ?? null)) {
    counterPayload.idCorregimiento = Number(corrVal);
  }

  const descVal = formData.descripcion;
  if (descVal !== null && descVal !== undefined && descVal !== '' && descVal !== (orig.descripcion?.descripcion || '')) {
    counterPayload.descripcionDireccion = descVal;
  }

  const hasCounterChanges = Object.keys(counterPayload).length > 1;
  const hasAforoChanges = aforosToDelete.length > 0 || aforosToAdd.length > 0;
  const hasEmpleadoChange = empleadoCambio !== null;

  if (!hasCounterChanges && !hasAforoChanges && !hasEmpleadoChange) {
    this.toast.info('Información', 'No hay cambios para guardar');
    this.closeEditCounterModal();
    return;
  }

  const requests: Observable<any>[] = aforosToDelete.map((id: number) =>
    this.counterService.deleteAforoContador(id)
  );

  // Payload para campos del contador y/o aforos nuevos
  if (hasCounterChanges || aforosToAdd.length > 0) {
    const payload: any = {
      idEmpresaClienteContador: counter.idEmpresaClienteContador,
      usuarioCambio: this.usuarioModificacion(),
    };

    if (hasCounterChanges) {
      payload.contadores = [counterPayload];
    }

    if (aforosToAdd.length > 0) {
      payload.aforosContador = aforosToAdd;
    }

    requests.push(this.enterpriseClientCounterService.updateClient(payload));
  }

  // Payload correcto para empleado: va a nivel raíz, NO dentro de contadores[]
  if (hasEmpleadoChange) {
    const empleadoPayload = {
      idEmpresaClienteContador: counter.idEmpresaClienteContador,
      usuarioCambio: this.usuarioModificacion(),
      idEmpleadoEmpresa: empleadoCambio,
    };
    requests.push(this.enterpriseClientCounterService.updateClient(empleadoPayload));
  }

  forkJoin(requests).subscribe({
    next: () => {
      this.toast.success('Éxito', 'Contador actualizado correctamente');
      this.closeEditCounterModal();
      this.dataContadores.reload();
    },
    error: () => {
      this.toast.error('Error', 'No se pudo actualizar el contador');
    },
  });
}

  toggleEditCounterAforosDropdown(): void {
    this.editCounterAforosDropdownOpen.set(!this.editCounterAforosDropdownOpen());
    if (!this.editCounterAforosDropdownOpen()) {
      this.editCounterAforosSearchTerm.set('');
    }
  }

  closeEditCounterAforosDropdown(): void {
    this.editCounterAforosDropdownOpen.set(false);
    this.editCounterAforosSearchTerm.set('');
  }

  onEditCounterAforoSelect(aforoId: number): void {
    const currentAforos: number[] = this.editCounterForm.get('aforosContador')?.value || [];
    const isSelected = currentAforos.includes(aforoId);
    const newAforos = isSelected
      ? currentAforos.filter((id) => id !== aforoId)
      : [...currentAforos, aforoId];
    this.editCounterForm.get('aforosContador')?.setValue(newAforos);
  }

  isEditCounterAforoSelected(aforoId: number): boolean {
    return (this.editCounterForm.get('aforosContador')?.value || []).includes(aforoId);
  }

  getEditCounterAforosSelectedCount(): number {
    return (this.editCounterForm.get('aforosContador')?.value || []).length;
  }

  getEditCounterFilteredAforos(): any[] {
    const term = this.editCounterAforosSearchTerm().toLowerCase().trim();
    const aforos = this.availableAforos();
    if (!term) return aforos;
    return aforos.filter((a) => this.getAforoFullInfo(a).toLowerCase().includes(term));
  }

  onContadoresPaginationChange(params: IPaginationParams): void {
    this.contadoresPagination.set(params);
  }

  onContadorTableAction(event: Action): void {
    if (event.action === 'add') {
      this.openAddCounterModal();
    }
  }

  openTarifasModal(counterIndex: number): void {
    const contador = this.contadoresFormArray.at(counterIndex);
    const contadorId = contador?.value.id;

    if (!contadorId) {
      this.toast.error('Error', 'No se puede configurar tarifas para un contador sin ID');
      return;
    }

    this.selectedCounterForTarifas.set(contadorId);

    const clienteData = this.clientData();
    const contadorData = clienteData?.contadores?.find((c: any) => c.id === contadorId) || contador?.value;

    this.loadTarifasModalState(contadorId, contadorData);
    this.isTarifasModalOpen.set(true);
  }

  closeTarifasModal(): void {
    this.isTarifasModalOpen.set(false);
    this.tempSelectedTarifas.set([]);
    this.tempSelectedConceptos.set(new Map());
    this.selectedCounterForTarifas.set(null);
    this.selectedCounterData.set(null);
  }

  applyTarifas(): void {
    const contadorId = this.selectedCounterForTarifas();

    if (!contadorId) {
      this.toast.error('Error', 'No se ha seleccionado ningún contador');
      return;
    }

    const idEmpresaClienteContador = this.contadorEmpresaClienteMap().get(contadorId);
    if (!idEmpresaClienteContador) {
      this.toast.error('Error', 'No se encontró el ID de empresa-cliente-contador');
      return;
    }

    const contadorData = this.selectedCounterData();
    const payload = this.buildTarifaConceptoDiffPayload(
      idEmpresaClienteContador,
      contadorData,
      this.originalTarifas(),
      this.tempSelectedTarifas(),
      this.originalConceptos(),
      this.tempSelectedConceptos(),
    );

    if (payload.tarifasContador.length === 0) {
      this.toast.info('Información', 'No hay cambios para guardar');
      return;
    }

    this.enterpriseClientCounterService.updateClient(payload).subscribe({
      next: () => {
        this.toast.success('Éxito', 'Tarifas actualizadas correctamente');
        this.closeTarifasModal();
        this.dataContadores.reload();
      },
      error: () => {
        this.toast.error('Error', 'No se pudieron actualizar las tarifas');
      },
    });
  }

  onTarifaSelect(tarifaId: number): void {
    const currentSelected = this.tempSelectedTarifas();
    const isCurrentlySelected = currentSelected.includes(tarifaId);
    const conceptosMap = new Map(this.tempSelectedConceptos());

    if (isCurrentlySelected) {
      this.tempSelectedTarifas.set(currentSelected.filter((id) => id !== tarifaId));
      conceptosMap.set(tarifaId, []);
    } else {
      this.tempSelectedTarifas.set([...currentSelected, tarifaId]);
      const originalForTarifa = this.originalConceptos().get(tarifaId) || [];
      const catalogConceptos = this.getConceptosForTarifa(tarifaId).map((c) => c.id);
      conceptosMap.set(
        tarifaId,
        originalForTarifa.length > 0 ? [...originalForTarifa] : [...catalogConceptos],
      );
    }

    this.tempSelectedConceptos.set(conceptosMap);
  }

  onConceptoSelect(tarifaId: number, conceptoId: number): void {
    if (!this.isTarifaSelected(tarifaId)) {
      return;
    }

    const conceptosMap = new Map(this.tempSelectedConceptos());
    const current = conceptosMap.get(tarifaId) || [];
    conceptosMap.set(tarifaId, this.toggleItemInList(current, conceptoId));
    this.tempSelectedConceptos.set(conceptosMap);
  }

  isConceptoSelected(tarifaId: number, conceptoId: number): boolean {
    if (!this.isTarifaSelected(tarifaId)) {
      return false;
    }
    return (this.tempSelectedConceptos().get(tarifaId) || []).includes(conceptoId);
  }

  getConceptosForTarifa(tarifaId: number, contadorData?: any): ITipoConcepto[] {
    const fromRates = this.conceptosPorTarifa().get(tarifaId) || [];
    const data = contadorData ?? this.selectedCounterData();
    if (!data) {
      return fromRates;
    }

    const extra: ITipoConcepto[] = [];
    (data.tarifasContadores || []).forEach((tc: any) => {
      if (tc.tipoTarifa?.id === tarifaId && tc.tipoConcepto?.id) {
        const c = tc.tipoConcepto;
        if (!fromRates.some((x) => x.id === c.id) && !extra.some((x) => x.id === c.id)) {
          extra.push({ id: c.id, descripcion: c.descripcion, codigo: c.codigo });
        }
      }
    });

    const faltantes = this.parseTiposTarifaFaltantes(data.tiposTarifaFaltantes);
    faltantes.tiposConcepto.forEach((c) => {
      const tempMap = new Map<number, number[]>();
      this.assignFaltanteConceptoToTarifas(c, tempMap);
      if ((tempMap.get(tarifaId) || []).includes(c.id) && !fromRates.some((x) => x.id === c.id) && !extra.some((x) => x.id === c.id)) {
        extra.push(c);
      }
    });

    return [...fromRates, ...extra];
  }

  getConceptosSeleccionadosCount(): number {
    let count = 0;
    this.tempSelectedConceptos().forEach((ids, tarifaId) => {
      if (this.isTarifaSelected(tarifaId)) {
        count += ids.length;
      }
    });
    return count;
  }

  getTotalConceptosCount(): number {
    return this.tarifasParaModal().reduce(
      (total, tarifa) => total + this.getConceptosForTarifa(tarifa.id).length,
      0,
    );
  }

  getTarifasModalSerial(): string {
    const contadorId = this.selectedCounterForTarifas();
    if (!contadorId) {
      return '';
    }
    const contador = this.contadoresFormArray.controls.find(
      (c) => c.value.id === contadorId,
    );
    return (
      contador?.value.serial ||
      this.selectedCounterData()?.serial ||
      'Sin serial'
    );
  }

  isTarifaSelected(tarifaId: number): boolean {
    return this.tempSelectedTarifas().includes(tarifaId);
  }

  toggleCodigosDropdown(): void {
    this.isCodigosDropdownOpen.set(!this.isCodigosDropdownOpen());
  }

  closeCodigosDropdown(): void {
    this.isCodigosDropdownOpen.set(false);
  }

  onCodigoSelect(code: string): void {
    const currentSelected = this.selectedCodigosResidenciaFiscal();
    const isCurrentlySelected = currentSelected.includes(code);

    if (isCurrentlySelected) {
      this.selectedCodigosResidenciaFiscal.set(
        currentSelected.filter((c) => c !== code)
      );
    } else {
      this.selectedCodigosResidenciaFiscal.set([...currentSelected, code]);
    }

    const codigosString = this.selectedCodigosResidenciaFiscal().join(';');
    this.updateForm.patchValue({ codigosResidenciaFiscal: codigosString });
    this.updateForm.get('codigosResidenciaFiscal')?.markAsDirty();
  }

  isCodigoSelected(code: string): boolean {
    return this.selectedCodigosResidenciaFiscal().includes(code);
  }

  getCodigosSeleccionadosCount(): number {
    return this.selectedCodigosResidenciaFiscal().length;
  }

  clearSelectedCodigos(): void {
    this.selectedCodigosResidenciaFiscal.set([]);
    this.updateForm.patchValue({ codigosResidenciaFiscal: '' });
    this.updateForm.get('codigosResidenciaFiscal')?.markAsDirty();
    this.closeCodigosDropdown();
  }

  getTarifasSeleccionadasCount(): number {
    return this.tempSelectedTarifas().length;
  }

  private buildTarifasPayload(): Record<string, unknown>[] {
    const payloadsArray: Record<string, unknown>[] = [];
    const contadoresModificados = this.contadoresConTarifasModificadas();

    if (contadoresModificados.size > 0) {
      const tarifasMap = this.tarifasPorContador();
      const conceptosMap = this.conceptosPorContador();

      contadoresModificados.forEach((contadorId) => {
        const tarifasActuales = tarifasMap.get(contadorId) || [];
        const conceptosActuales = conceptosMap.get(contadorId) || new Map<number, number[]>();

        const contador = this.contadoresFormArray.controls.find(
          (c) => c.value.id === contadorId,
        );
        const idEmpresaClienteContador = contador?.value.idEmpresaClienteContador;

        if (!idEmpresaClienteContador) {
          return;
        }

        const contadorData =
          this.clientData()?.contadores?.find((c: any) => c.id === contadorId) ||
          contador?.value;
        const tarifasOriginales = this.extractActiveTarifaIds(contadorData);
        const conceptosOriginales = this.extractActiveConceptosMap(contadorData);

        const payload = this.buildTarifaConceptoDiffPayload(
          idEmpresaClienteContador,
          contadorData,
          tarifasOriginales,
          tarifasActuales,
          conceptosOriginales,
          conceptosActuales,
        );

        if (payload.tarifasContador.length > 0) {
          payloadsArray.push(payload);
        }
      });
    }

    return payloadsArray;
  }

  // Obtener solo campos dirty del formulario
  private getDirtyValues(form: FormGroup | FormArray): any {
    const dirtyValues: any = {};

    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);

      if (control?.dirty) {
        if (control instanceof FormGroup) {
          dirtyValues[key] = this.getDirtyValues(control);
        } else if (control instanceof FormArray) {
          dirtyValues[key] = control.controls
            .map((ctrl, index) =>
              ctrl.dirty ? this.getDirtyValues(ctrl as FormGroup) : null,
            )
            .filter((val) => val !== null);
        } else {
          dirtyValues[key] = control.value;
        }
      }
    });

    return dirtyValues;
  }

  // Mapear campos dirty a estructura del backend
  private mapDirtyFieldsToPayload(dirtyFields: any): any {
    const payload: any = {};
    const fieldMapping: Record<string, string> = {
      numeroDocumento: 'numeroCedula',
      direccion: 'descripcionDireccion',
    };

    Object.keys(dirtyFields).forEach((key) => {
      if (key === 'contadores') return; // Manejado por separado

      const payloadKey = fieldMapping[key] || key;
      const value = dirtyFields[key];

      // Convertir a número los IDs
      if (
        [
          'idDepartamento',
          'idCiudad',
          'idCorregimiento',
        ].includes(payloadKey)
      ) {
        payload[payloadKey] = value ? Number(value) : null;
      } else if (value !== null && value !== undefined && value !== '') {
        payload[payloadKey] = value;
      }
    });

    return payload;
  }

  private mapDirtyCounterFields(control: any, contador: any): any {
    const payload: any = { id: contador.id };

    const fieldMapping: Record<string, { backendKey: string; transform?: (val: any) => any }> = {
      'activo': { backendKey: 'activo' },
      'serial': { backendKey: 'serial' },
      'tipoContador': { backendKey: 'idTipoContador', transform: (val) => Number(val) },
      'tipoUso': { backendKey: 'idTipoUso', transform: (val) => Number(val) },
      'estadoContador': { backendKey: 'idEstadoContador', transform: (val) => Number(val) },
      'estrato': { backendKey: 'estrato', transform: (val) => Number(val) },
      'digitos': { backendKey: 'digitos', transform: (val) => Number(val) },
      'fechaInstalacion': { backendKey: 'fechaInstalacion' },
      'idEmpleadoEmpresa': { backendKey: 'idEmpleado', transform: (val) => Number(val) },
      'idDepartamento': { backendKey: 'idDepartamento', transform: (val) => Number(val) },
      'idCiudad': { backendKey: 'idCiudad', transform: (val) => Number(val) },
      'idCorregimiento': { backendKey: 'idCorregimiento', transform: (val) => val ? Number(val) : null },
      'ruta': { backendKey: 'ruta' },
      'nuid': { backendKey: 'nuid', transform: (val) => val ? Number(val) : null },
    };

    Object.keys(control.controls).forEach((key) => {
      const fieldControl = control.get(key);

      if (['aforosContador', 'aforoContadorNombre', 'aforosContadorData', 'idEmpresaClienteContador', 'isNewCounter',
           'departamentoNombre', 'ciudadNombre', 'corregimientoNombre', 'tipoContadorNombre',
           'tipoUsoNombre', 'estadoContadorNombre', 'porEstrato'].includes(key)) {
        return;
      }

      if (key === 'descripcion' && fieldControl instanceof FormGroup) {
        const descripcionControl = fieldControl.get('descripcion');
        if (descripcionControl?.dirty) {
          const descValue = descripcionControl.value;
          if (descValue !== null && descValue !== undefined && descValue !== '') {
            payload['descripcionDireccion'] = descValue;
          }
        }
        return;
      }

      if (fieldControl?.dirty) {
        const mapping = fieldMapping[key];

        if (mapping) {
          const value = fieldControl.value;
          if (value !== null && value !== undefined && value !== '') {
            payload[mapping.backendKey] = mapping.transform ? mapping.transform(value) : value;
          }
        }
      }
    });

    return payload;
  }

  // Obtener contadores modificados o nuevos (retorna objeto con arrays separados)
  private getDirtyCounters(): { modified: any[] | null; new: any[] | null } {
    const contadoresArray = this.contadoresFormArray;
    const modifiedCounters: any[] = [];
    const newCounters: any[] = [];

    contadoresArray.controls.forEach((control, index) => {
      const contador = control.value;
      const isNewCounter = contador.isNewCounter === true;

      // Verificar si el contador está dirty excluyendo el campo aforosContador
      const isCounterDirty = this.isCounterDirtyExcludingAforos(control);
      const empleadoControl = control.get('idEmpleadoEmpresa');
      const isEmpleadoDirty = empleadoControl && empleadoControl.dirty;

      // Incluir si está dirty (sin contar aforos) O si es un contador nuevo O si cambió el empleado
      if (!isCounterDirty && !isNewCounter && !isEmpleadoDirty) return;

      // Si es contador nuevo, enviar ID y idEmpleado para vincularlo al cliente
      if (isNewCounter) {
        const linkPayload: any = { id: contador.id };

        if (contador.idEmpleadoEmpresa) {
          linkPayload.idEmpleado = Number(contador.idEmpleadoEmpresa);
        }

        newCounters.push(linkPayload);

        // Si además tiene campos sucios (ej. nuid diferente al devuelto por el backend),
        // incluirlos también como actualización para que sean persistidos
        if (isCounterDirty) {
          const updatePayload = this.mapDirtyCounterFields(control, contador);
          if (Object.keys(updatePayload).length > 1) {
            modifiedCounters.push(updatePayload);
          }
        }

        return;
      }

      // Si solo cambió el empleado (no otros campos), se manejará por separado
      // en el método getCountersWithEmployeeChange(), no lo incluimos aquí
      if (isEmpleadoDirty && !isCounterDirty) {
        return;
      }

      // Para contadores modificados, enviar SOLO los campos que cambiaron
      const payload = this.mapDirtyCounterFields(control, contador);

      // Solo agregar si hay algún campo modificado además del id
      if (Object.keys(payload).length > 1) {
        modifiedCounters.push(payload);
      }
    });

    return {
      modified: modifiedCounters.length > 0 ? modifiedCounters : null,
      new: newCounters.length > 0 ? newCounters : null,
    };
  }

  // Verificar si el contador está dirty excluyendo el campo aforosContador e idEmpleadoEmpresa
  private isCounterDirtyExcludingAforos(counterControl: any): boolean {
    // Recorrer todos los controles del contador
    const controls = counterControl.controls;
    for (const key in controls) {
      // Ignorar aforosContador, aforoContadorNombre, aforosContadorData e idEmpleadoEmpresa
      if (key === 'aforosContador' || key === 'aforoContadorNombre' || key === 'aforosContadorData' || key === 'idEmpleadoEmpresa') {
        continue;
      }
      // Si algún otro campo está dirty, el contador está modificado
      if (controls[key].dirty) {
        return true;
      }
    }
    return false;
  }

  // Verificar si las tarifas cambiaron
  private hasTarifasChanged(): boolean {
    // Verificar si hay contadores con tarifas modificadas
    if (this.contadoresConTarifasModificadas().size > 0) {
      return true;
    }

    // Verificar cambios en tarifas globales (modo legacy)
    const current = this.selectedTarifas();
    const original = this.originalTarifas();

    if (current.length !== original.length) return true;
    return !current.every((id) => original.includes(id));
  }

  // Construir payload de aforos en el formato esperado por el backend
  // Para crear: [{ idContador, idAforo }]
  // Para actualizar: [{ id, idAforo }] donde id es el idAforoContador
  private buildAforosPayload(): { nuevos: any[], actualizados: any[] } {
    const contadoresArray = this.contadoresFormArray;
    const aforosNuevos: any[] = [];
    const aforosActualizados: any[] = [];

    contadoresArray.controls.forEach((control) => {
      const contador = control.value;
      const aforosControl = control.get('aforosContador');

      // Solo incluir si el campo de aforos fue modificado
      if (aforosControl?.dirty) {
        // IDs de aforos actuales seleccionados
        const aforosIdsActuales = Array.isArray(contador.aforosContador)
          ? contador.aforosContador.filter((id: any) => id).map((id: any) => Number(id))
          : [];

        // Datos originales de aforos (contiene el id de la relación aforoContador)
        const aforosOriginales = Array.isArray(contador.aforosContadorData)
          ? contador.aforosContadorData
          : [];

        // Procesar cada aforo seleccionado
        aforosIdsActuales.forEach((aforoId: number) => {
          // Buscar si este aforo ya existía en los datos originales (por su ID de aforo)
          const aforoOriginal = aforosOriginales.find((a: any) => a.id === aforoId);

          if (aforoOriginal && aforoOriginal.idAforoContador) {
            // Si existe y tiene idAforoContador, es una actualización
            aforosActualizados.push({
              id: aforoOriginal.idAforoContador, // ID de la relación aforoContador
              idAforo: aforoId
            });
          } else {
            // Si no existe o no tiene idAforoContador, es un nuevo aforo para este contador
            aforosNuevos.push({
              idContador: Number(contador.id),
              idAforo: aforoId
            });
          }
        });
      }
    });

    return { nuevos: aforosNuevos, actualizados: aforosActualizados };
  }

  // Obtener aforos a eliminar (retorna el ID de la relación aforoContador)
  private getAforosToDelete(): number[] {
    const contadoresArray = this.contadoresFormArray;
    const aforosToDelete: number[] = [];

    contadoresArray.controls.forEach((control) => {
      const contador = control.value;
      const aforosControl = control.get('aforosContador');

      // Solo procesar si el campo de aforos fue modificado
      if (aforosControl?.dirty) {
        // IDs actuales seleccionados
        const aforosIdsActuales = Array.isArray(contador.aforosContador)
          ? contador.aforosContador.filter((id: any) => id).map((id: any) => Number(id))
          : [];

        // Datos originales de aforos (contienen el id de la relación aforoContador)
        const aforosOriginales = Array.isArray(contador.aforosContadorData)
          ? contador.aforosContadorData
          : [];

        // Identificar aforos eliminados
        aforosOriginales.forEach((aforoOriginal: any) => {
          const aforoId = aforoOriginal.id; // Este es el ID del aforo

          // Si el aforo original ya no está en la selección actual, debe eliminarse
          if (!aforosIdsActuales.includes(aforoId)) {
            // Usar el ID de la relación aforoContador para eliminar
            if (aforoOriginal.idAforoContador) {
              aforosToDelete.push(aforoOriginal.idAforoContador);
            }
          }
        });
      }
    });

    return aforosToDelete;
  }

  // ====================  CREACIÓN DE NUEVOS CONTADORES ====================

  private initializeCounterForm(): void {
    this.counterForm = this.fb.group({
      serial: [''],
      nuid: [''],
      ruta: [''],
      tipoContador: [''],
      tipoUso: [''],
      estadoContador: [''],
      idDepartamento: [{ value: '', disabled: true }],
      idCiudad: [{ value: '', disabled: true }],
      idCorregimiento: [''],
      direccion: [''],
      estrato: [
        '',
        [Validators.min(1), Validators.max(6)],
      ],
      digitos: ['', [Validators.min(1)]],
      fechaInstalacion: [''],
      idEmpleadoEmpresa: [''],
    });
  }

  private setupCounterFormValueChanges(): void {
    const userDeptId = this.IdDepartamento();
    const userCityId = this.IdCiudad();

    if (userDeptId) {
      this.counterForm.patchValue({ idDepartamento: userDeptId });
      this.selectedCounterDepartmentId.set(userDeptId);
      this.loadCounterDepartments();
    }
    if (userCityId) {
      this.counterForm.patchValue({ idCiudad: userCityId });
      this.selectedCounterCityId.set(userCityId);
    }
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
            { emitEvent: false },
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
          { emitEvent: false },
        );
        this.counterCorregimientos.set([]);
      }
    });
  }

  private loadCounterDepartments(): void {
    this.counterDepartmentsLoading.set(true);
    this.locationService.getDepartamentos().subscribe({
      next: (departaments) => {
        this.counterDepartaments.set(departaments.response);
        this.counterDepartmentsLoading.set(false);
      },
      complete: () => {
        this.counterDepartmentsLoading.set(false);
      },
    });
  }

  private loadCounterCities(departmentId: number): void {
    this.counterCitiesLoading.set(true);
    this.locationService.getCiudades(departmentId).subscribe({
      next: (cities) => {
        this.counterCities.set(cities.response);
        this.counterCitiesLoading.set(false);
      },
      complete: () => {
        this.counterCitiesLoading.set(false);
      },
    });
  }

  private loadCounterCorregimientos(cityId: number): void {
    this.counterCorregimientosLoading.set(true);
    this.locationService.getCorregimientos(cityId).subscribe({
      next: (corregimientos) => {
        this.counterCorregimientos.set(corregimientos.response);
        this.counterCorregimientosLoading.set(false);
      },
      complete: () => {
        this.counterCorregimientosLoading.set(false);
      },
    });
  }

  openAddCounterModal(): void {
    this.isAddCounterModalOpen.set(true);
    this.loadCounterDepartments();

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
  }

  closeAddCounterModal(): void {
    this.isAddCounterModalOpen.set(false);
    this.counterForm.reset();
  }

  createNewCounter(): void {
    if (this.counterForm.invalid) {
      this.counterForm.markAllAsTouched();
      this.toast.error(
        'Error',
        'Por favor complete todos los campos requeridos',
      );
      return;
    }

    const formData = this.counterForm.getRawValue();
    const usuarioCreacion = this.usuarioModificacion();

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
            serial: formData.serial,
            nuid: formData.nuid ? Number(formData.nuid) : null,
            ruta: formData.ruta || null,
            tipoContador: { id: Number(formData.tipoContador) },
            tipoUso: { id: Number(formData.tipoUso) },
            descripcion: { id: addressResponse.response.id },
            estrato: Number(formData.estrato),
            digitos: formData.digitos ? Number(formData.digitos) : null,
            fechaInstalacion: formData.fechaInstalacion || null,
            activo: true,
            usuarioCreacion: usuarioCreacion,
          };

          if (formData.estadoContador) {
            counterPayload.estadoContador = { id: Number(formData.estadoContador) };
          }

          if (formData.idEmpleadoEmpresa) {
            counterPayload.empleadoEmpresaId = Number(formData.idEmpleadoEmpresa);
          }

          return this.counterService.saveCounter(counterPayload);
        }),
      )
      .subscribe({
        next: (counterResponse: any) => {
          const counter = counterResponse?.response || counterResponse;

          if (counter && counter.id) {
            this.toast.success('Éxito', 'Contador creado correctamente');

            // Vincular el contador al cliente inmediatamente
            const linkPayload = {
              idEmpresaClienteContador: this.empresaClienteContadorId(),
              usuarioCambio: this.usuarioModificacion(),
              contadoresNuevos: [{
                id: counter.id,
                ...(formData.idEmpleadoEmpresa ? { idEmpleado: Number(formData.idEmpleadoEmpresa) } : {}),
              }],
            };

            this.enterpriseClientCounterService.updateClient(linkPayload).subscribe({
              next: () => {
                this.toast.success('Éxito', 'Contador vinculado al cliente correctamente');
                this.closeAddCounterModal();
                this.dataContadores.reload();
              },
              error: (err) => {
                const errorMessage = err?.error?.message || 'No se pudo vincular el contador';
                this.toast.error('Error', errorMessage);
                this.closeAddCounterModal();
                this.dataContadores.reload();
              },
            });
          } else {
          }
        },
        error: (error) => {
          console.error('Error creando contador:', error);
        },
      });
  }

  private generateNuid(): number {
    return Math.floor(10000000 + Math.random() * 90000000);
  }

  private setupCounterValueChangesForIndex(index: number): void {
    const contadorControl = this.contadoresFormArray.controls[index];
    const currentDeptId = contadorControl.get('idDepartamento')?.value;
    const currentCityId = contadorControl.get('idCiudad')?.value;

    if (currentDeptId) {
      this.loadCounterCitiesByIndex(index, Number(currentDeptId));
      if (currentCityId) {
        this.loadCounterCorregimientosByIndex(index, Number(currentCityId));
      }
    }

    // Listeners similares a setupCounterValueChanges pero para un contador específico
    contadorControl
      .get('idDepartamento')
      ?.valueChanges.subscribe((departamentoId) => {
        const numericDeptId = departamentoId ? Number(departamentoId) : null;
        if (numericDeptId) {
          this.loadCounterCitiesByIndex(index, numericDeptId);
          contadorControl
            .get('descripcion.departamento.id')
            ?.setValue(numericDeptId, { emitEvent: false });
          contadorControl.patchValue(
            {
              idCiudad: '',
              idCorregimiento: '',
            },
            { emitEvent: false },
          );
          contadorControl
            .get('descripcion.ciudad.id')
            ?.setValue('', { emitEvent: false });
          contadorControl
            .get('descripcion.corregimiento.id')
            ?.setValue('', { emitEvent: false });
        }
      });

    contadorControl.get('idCiudad')?.valueChanges.subscribe((cityId) => {
      const numericCityId = cityId ? Number(cityId) : null;
      if (numericCityId) {
        this.loadCounterCorregimientosByIndex(index, numericCityId);
        contadorControl
          .get('descripcion.ciudad.id')
          ?.setValue(numericCityId, { emitEvent: false });
        contadorControl.patchValue(
          {
            idCorregimiento: '',
          },
          { emitEvent: false },
        );
        contadorControl
          .get('descripcion.corregimiento.id')
          ?.setValue('', { emitEvent: false });
      }
    });

    contadorControl
      .get('idCorregimiento')
      ?.valueChanges.subscribe((corregimientoId) => {
        const numericCorrId = corregimientoId ? Number(corregimientoId) : null;
        if (numericCorrId) {
          contadorControl
            .get('descripcion.corregimiento.id')
            ?.setValue(numericCorrId, { emitEvent: false });
        } else {
          contadorControl
            .get('descripcion.corregimiento.id')
            ?.setValue('', { emitEvent: false });
        }
      });
  }

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


  readonly todasLasTarifas = computed(() => {
    const feeConceptData = this.feeConcept.value();
    if (!feeConceptData?.response) {
      return [];
    }

    const response = feeConceptData.response;
    const tarifas = Array.isArray(response) ? response : [response];

    return tarifas.map((t: any) => ({
      id: t.id,
      nombre: t.nombre || '',
      codigo: t.codigo || '',
    }));
  });


  readonly tarifasParaModal = computed(() => {
    return this.todasLasTarifas();
  });

  readonly conceptosPorTarifa = computed(() => {
    const data = this.conceptRates.value();
    const map = new Map<number, ITipoConcepto[]>();
    if (!data?.response) {
      return map;
    }

    const rates = Array.isArray(data.response) ? data.response : [data.response];
    rates.forEach((cr: any) => {
      const tarifaId = cr.tipoTarifa?.id;
      const concepto = cr.tipoConcepto;
      if (!tarifaId || !concepto?.id) {
        return;
      }
      const list = map.get(tarifaId) || [];
      if (!list.some((c) => c.id === concepto.id)) {
        list.push({
          id: concepto.id,
          descripcion: concepto.descripcion,
          codigo: concepto.codigo,
        });
        map.set(tarifaId, list);
      }
    });

    return map;
  });

  toggleCounterAforosDropdown(counterIndex: number): void {
    const current = this.counterAforosDropdownOpen();
    const newState = { ...current };
    newState[counterIndex] = !newState[counterIndex];
    this.counterAforosDropdownOpen.set(newState);

    // Limpiar búsqueda al cerrar
    if (!newState[counterIndex]) {
      const searchTerms = this.counterAforosSearchTerm();
      const newSearchTerms = { ...searchTerms };
      newSearchTerms[counterIndex] = '';
      this.counterAforosSearchTerm.set(newSearchTerms);
    }
  }

  closeCounterAforosDropdown(counterIndex: number): void {
    const current = this.counterAforosDropdownOpen();
    const newState = { ...current };
    newState[counterIndex] = false;
    this.counterAforosDropdownOpen.set(newState);

    // Limpiar búsqueda
    const searchTerms = this.counterAforosSearchTerm();
    const newSearchTerms = { ...searchTerms };
    newSearchTerms[counterIndex] = '';
    this.counterAforosSearchTerm.set(newSearchTerms);
  }

  isCounterAforosDropdownOpen(counterIndex: number): boolean {
    return this.counterAforosDropdownOpen()[counterIndex] || false;
  }

  onCounterAforosSearchChange(counterIndex: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const searchTerms = this.counterAforosSearchTerm();
    const newSearchTerms = { ...searchTerms };
    newSearchTerms[counterIndex] = target.value;
    this.counterAforosSearchTerm.set(newSearchTerms);
  }

  getCounterAforosSearchTerm(counterIndex: number): string {
    return this.counterAforosSearchTerm()[counterIndex] || '';
  }

  onCounterAforoSelect(counterIndex: number, aforoId: number): void {
    const contadorControl = this.contadoresFormArray.at(counterIndex);
    const currentAforosControl = contadorControl.get('aforosContador');
    const currentAforos = currentAforosControl?.value || [];

    const aforosArray = Array.isArray(currentAforos) ? currentAforos : [];
    const isSelected = aforosArray.includes(aforoId);

    let newAforos: number[];
    if (isSelected) {
      newAforos = aforosArray.filter((id: number) => id !== aforoId);
    } else {
      newAforos = [...aforosArray, aforoId];
    }

    currentAforosControl?.setValue(newAforos);
    currentAforosControl?.markAsDirty();

    // Actualizar el nombre para display
    this.updateAforoNombreForCounter(counterIndex, newAforos);
  }

  isCounterAforoSelected(counterIndex: number, aforoId: number): boolean {
    const contadorControl = this.contadoresFormArray.at(counterIndex);
    const currentAforos = contadorControl?.get('aforosContador')?.value || [];
    const aforosArray = Array.isArray(currentAforos) ? currentAforos : [];
    return aforosArray.includes(aforoId);
  }

  getCounterAforosSelectedCount(counterIndex: number): number {
    const contadorControl = this.contadoresFormArray.at(counterIndex);
    const currentAforos = contadorControl?.get('aforosContador')?.value || [];
    const aforosArray = Array.isArray(currentAforos) ? currentAforos : [];
    return aforosArray.length;
  }

  clearCounterSelectedAforos(counterIndex: number): void {
    const contadorControl = this.contadoresFormArray.at(counterIndex);
    contadorControl?.get('aforosContador')?.setValue([]);
    contadorControl?.get('aforoContadorNombre')?.setValue('');
    contadorControl?.get('aforosContador')?.markAsDirty();
    this.closeCounterAforosDropdown(counterIndex);
  }

  private updateAforoNombreForCounter(counterIndex: number, aforosIds: number[]): void {
    const contadorControl = this.contadoresFormArray.at(counterIndex);
    const aforos = this.availableAforos();
    const nombres = aforosIds
      .map(id => aforos.find(a => a.id === id)?.nombre)
      .filter(nombre => nombre)
      .join(', ');
    contadorControl?.get('aforoContadorNombre')?.setValue(nombres);
  }

  getAforoFullInfo(aforo: any): string {
    const parts = [aforo.nombre];
    if (aforo.tipoUso?.nombre) parts.push(aforo.tipoUso.nombre);
    if (aforo.tarifaBase) parts.push(`(${aforo.tarifaBase})`);
    return parts.join(' - ');
  }

getAforoNameById(aforoId: number): string {
  const aforo = this.availableAforos().find(a => a.id === aforoId);
  if (!aforo) return '';
  const tarifa = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(aforo.tarifaBase ?? 0);

  return `${aforo.nombre} - ${tarifa}`;
}
  getFilteredAforos(counterIndex: number): any[] {
    const searchTerm = this.getCounterAforosSearchTerm(counterIndex).toLowerCase().trim();
    const aforos = this.availableAforos();

    if (!searchTerm) return aforos;

    return aforos.filter(aforo => {
      const fullInfo = this.getAforoFullInfo(aforo).toLowerCase();
      return fullInfo.includes(searchTerm);
    });
  }

  // Obtener tarifas específicas de un contador
  getCounterTarifas(contadorId: number): {
    activas: Array<{id: number, tipoTarifaId: number, nombre: string, codigo: string, descripcion?: string, aplica: boolean}>,
    inactivas: Array<{id: number, tipoTarifaId: number, nombre: string, codigo: string, descripcion?: string, aplica: boolean}>,
    faltantes: Array<{tipoTarifaId: number, nombre: string, codigo: string}>
  } {
    const clienteData = this.clientData();
    const result: {
      activas: Array<{id: number, tipoTarifaId: number, nombre: string, codigo: string, descripcion?: string, aplica: boolean}>,
      inactivas: Array<{id: number, tipoTarifaId: number, nombre: string, codigo: string, descripcion?: string, aplica: boolean}>,
      faltantes: Array<{tipoTarifaId: number, nombre: string, codigo: string}>
    } = { activas: [], inactivas: [], faltantes: [] };

    if (!clienteData?.contadores) {
      return result;
    }

    const contador = clienteData.contadores.find((c: any) => c.id === contadorId);
    if (!contador) {
      return result;
    }

    // Procesar tarifas existentes del contador
    if (contador.tarifasContadores && contador.tarifasContadores.length > 0) {
      contador.tarifasContadores.forEach((t: any) => {
        const tarifaInfo = {
          id: t.id,
          tipoTarifaId: t.tipoTarifa.id,
          nombre: t.tipoTarifa.nombre,
          codigo: t.tipoTarifa.codigo,
          descripcion: t.tipoTarifa.descripcion,
          aplica: t.aplica
        };

        if (t.aplica) {
          result.activas.push(tarifaInfo);
        } else {
          result.inactivas.push(tarifaInfo);
        }
      });
    }

    // Procesar tarifas faltantes del contador
    const faltantes = this.parseTiposTarifaFaltantes(contador.tiposTarifaFaltantes);
    faltantes.tiposTarifa.forEach((t) => {
      result.activas.push({
        id: 0,
        tipoTarifaId: t.id,
        nombre: t.nombre,
        codigo: t.codigo,
        descripcion: t.descripcion,
        aplica: true,
      });
    });

    return result;
  }

  // Obtener título del modal de tarifas según contexto
  getTarifasModalTitle(): string {
    const contadorId = this.selectedCounterForTarifas();
    if (contadorId) {
      const contador = this.contadoresFormArray.controls.find(
        (c) => c.value.id === contadorId,
      );
      const serial =
        contador?.value.serial ||
        this.selectedCounterData()?.serial ||
        'Sin serial';
      return `Configurar Tarifas - Contador: ${serial}`;
    }
    return 'Gestionar Tarifas del Cliente';
  }



getEditCounterAforosLabel(): string {
  const selectedIds: number[] = this.editCounterForm.get('aforosContador')?.value || [];
  if (selectedIds.length === 0) return 'Seleccionar aforos...';
  if (selectedIds.length === 1) {
    const aforo = this.availableAforos().find(a => a.id === selectedIds[0]);
    return aforo ? this.getAforoFullInfo(aforo) : '1 aforo seleccionado';
  }
  return `${selectedIds.length} aforos seleccionados`;
}
}
