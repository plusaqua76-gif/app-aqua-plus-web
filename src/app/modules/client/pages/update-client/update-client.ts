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
import { catchError, EMPTY, of, forkJoin } from 'rxjs';
import { EnterpriseClientCounterService } from '../../service/enterpriseClientCounter.service';
import { IClienteDetalle } from '@interfaces/client/IclientDetail';
import { TypeCounterService } from '../../../counter/service/typeCounter.service';
import { ITypeCounter } from '@interfaces/ItypeCounter';
import { ConceptRateService } from '../../../fee/services/concept-rate.service';
import { CounterService } from '../../service/couter.service';
import { switchMap } from 'rxjs';
import { error } from 'node:console';
import { ConfigurationMasiveBillService } from '../../../electronic-invoicing/services/configuration-masive-bill.service';
import { filter } from 'rxjs/operators';
import { Checkbox } from '@shared/components/checkbox';
import { UseService } from '../../../fee/services/use.service';
import { PopupComponent } from '@shared/components/popUp';

@Component({
  selector: 'app-update-client',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Checkbox, PopupComponent],
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
  selectedTarifas = signal<number[]>([]);
  tempSelectedTarifas = signal<number[]>([]); // Temporal para el modal
  originalTarifas = signal<number[]>([]); // Tarifas originales para comparación

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

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly personService = inject(PersonService);
  private readonly locationService = inject(LocationService);
  private readonly typeDocumentService = inject(TypeDocumentService);
  private readonly empleadoService = inject(EmpleadoService);
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
        ? this.enterpriseClientCounterService.getClientByEmpresaClienteContadorId(
            empresaClienteContadorId,
          )
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
        ? this.conceptRateService.getConceptRateByEnterprise(enterpriseId).pipe(
            catchError((error) => {
              if (error.status === 404) {
                return of(null);
              }
              return of(null);
            }),
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
      isModalOpen: this.isAssignCounterModalOpen(),
    }),
    stream: ({ params: { serial, isModalOpen } }) => {
      if (!serial || !isModalOpen || serial.length < 3) {
        this.isSearchingCounter.set(false);
        return of(null);
      }

      this.isSearchingCounter.set(true);
      return this.enterpriseClientCounterService
        .getClientBySerial(serial)
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

  private loadClientFromApiData(clienteData: IClienteDetalle): void {
    if (!clienteData?.persona) return;

    const { persona, empleadoEmpresaId, correo, telefono } = clienteData;
    const { direccion } = persona;
    const primerContador = clienteData.contadores?.[0];
    const departamento = primerContador?.descripcion?.departamento;

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
      // Pre-cargar ubicación si está disponible
      idDepartamento: departamento?.id || '',
      idCiudad: direccion?.ciudad?.id || '',
      idCorregimiento: direccion?.corregimiento?.id || '',
    };

    this.updateForm.patchValue(formValues, { emitEvent: false });

    // Cargar contadores en el FormArray
    if (clienteData.contadores && clienteData.contadores.length > 0) {
      this.loadContadoresInForm(clienteData.contadores);
    }

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
    if (!idEmpresaClienteContador) {
      this.toast.error('Error', 'No se pudo obtener el ID de empresa-cliente-contador');
      return;
    }

    const payload = {
      idEmpresaClienteContador: idEmpresaClienteContador,
      usuarioCambio: this.usuarioModificacion(),
      activo: false,
    };

    this.enterpriseClientCounterService
      .updateClient(payload)
      .subscribe({
        next: (response) => {
          this.toast.success('Éxito', 'Contador inactivado correctamente');
          // Recargar los datos del cliente para reflejar el cambio
          this.dataClient.reload();
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
        this.dataClient.reload();
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

  openTarifasModal(counterIndex: number): void {
    // Editar tarifas de un contador específico
    const contador = this.contadoresFormArray.at(counterIndex);
    const contadorId = contador?.value.id;

    if (!contadorId) {
      this.toast.error('Error', 'No se puede configurar tarifas para un contador sin ID');
      return;
    }

    // Guardar el ID del contador (no el índice)
    this.selectedCounterForTarifas.set(contadorId);

    // Verificar si hay tarifas guardadas en el Map para este contador
    const tarifasGuardadas = this.tarifasPorContador().get(contadorId);

    let tarifasACargar: number[];

    if (tarifasGuardadas && tarifasGuardadas.length > 0) {
      // Usar las tarifas previamente configuradas en esta sesión
      tarifasACargar = [...tarifasGuardadas];
    } else {
      // Cargar las tarifas activas del contador desde el API
      const clienteData = this.clientData();
      const contadorData = clienteData?.contadores?.find((c: any) => c.id === contadorId);

      if (contadorData?.tarifasContadores && contadorData.tarifasContadores.length > 0) {
        // Mapear a los IDs de ConceptoTarifa usando todasLasTarifas
        // Hacer match por tipoTarifaId Y tipoUsoId del contador
        const allTarifas = this.todasLasTarifas();
        const contadorTipoUsoId = contadorData.tipoUso?.id;

        tarifasACargar = contadorData.tarifasContadores
          .filter((tc: any) => tc.aplica) // Solo las que aplican
          .map((tc: any) => {
            // Buscar el ConceptoTarifa que matchea tipoTarifa.id y tipoUso.id
            const conceptoTarifa = allTarifas.find(t =>
              t.tipoTarifaId === tc.tipoTarifa.id &&
              t.tipoUso?.id === contadorTipoUsoId
            );
            return conceptoTarifa?.id;
          })
          .filter((id: number | undefined) => id !== undefined) as number[];
      } else {
        // Contador nuevo o sin tarifas: iniciar vacío
        tarifasACargar = [];
      }
    }

    // Configurar las tarifas seleccionadas
    this.selectedTarifas.set([...tarifasACargar]);
    this.tempSelectedTarifas.set([...tarifasACargar]);
    this.originalTarifas.set([...tarifasACargar]);

    this.isTarifasModalOpen.set(true);
  }

  closeTarifasModal(): void {
    this.isTarifasModalOpen.set(false);
    this.tempSelectedTarifas.set([]);
    this.selectedCounterForTarifas.set(null);
  }

  applyTarifas(): void {
    const contadorId = this.selectedCounterForTarifas();

    if (!contadorId) {
      this.toast.error('Error', 'No se ha seleccionado ningún contador');
      return;
    }

    // Guardar las tarifas seleccionadas para este contador (usa ID, no índice)
    const currentMap = new Map(this.tarifasPorContador());
    currentMap.set(contadorId, [...this.tempSelectedTarifas()]);
    this.tarifasPorContador.set(currentMap);

    // Agregar el ID del contador al Set de contadores modificados
    const currentSet = new Set(this.contadoresConTarifasModificadas());
    currentSet.add(contadorId);
    this.contadoresConTarifasModificadas.set(currentSet);

    // Marcar el formulario como modificado
    this.updateForm.markAsDirty();
    console.log('Tarifas aplicadas al contador ID:', contadorId, this.tempSelectedTarifas());

    this.closeTarifasModal();
    this.toast.info(
      'Información',
      'Tarifas configuradas. Recuerde guardar los cambios del cliente para aplicarlas',
    );
  }

  onTarifaSelect(tarifaId: number): void {
    const currentSelected = this.tempSelectedTarifas();
    const isCurrentlySelected = currentSelected.includes(tarifaId);

    if (isCurrentlySelected) {
      this.tempSelectedTarifas.set(
        currentSelected.filter((id) => id !== tarifaId),
      );
    } else {
      this.tempSelectedTarifas.set([...currentSelected, tarifaId]);
    }
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

  private buildTarifasPayload(): any[] {
    const payloadsArray: any[] = [];
    const contadoresModificados = this.contadoresConTarifasModificadas();

    if (contadoresModificados.size > 0) {
      const tarifasMap = this.tarifasPorContador();
      const todasLasTarifas = this.todasLasTarifas();

      // Iterar sobre los IDs de contadores modificados (no índices)
      contadoresModificados.forEach(contadorId => {
        const tarifasSeleccionadas = tarifasMap.get(contadorId) || [];

        // Buscar el contador y obtener su información
        const contador = this.contadoresFormArray.controls.find(
          c => c.value.id === contadorId
        );
        const idEmpresaClienteContador = contador?.value.idEmpresaClienteContador;
        const tipoUsoContador = contador?.value.tipoUso;

        if (!idEmpresaClienteContador) {
          console.warn(`No se encontró idEmpresaClienteContador para el contador ${contadorId}`);
          return;
        }

        // Filtrar tarifas por el tipoUso del contador
        const tarifasDelContador = todasLasTarifas.filter(
          t => t.tipoUso?.id === tipoUsoContador
        );

        // Construir array de tarifas para este contador
        const tarifasContador: any[] = [];

        // Iterar sobre las tarifas que corresponden al tipoUso del contador
        tarifasDelContador.forEach((tarifa) => {
          // La tarifa aplica si está en las seleccionadas
          const shouldApply = tarifasSeleccionadas.includes(tarifa.id);

          tarifasContador.push({
            idTipoTarifa: tarifa.tipoTarifaId, // Usar tipoTarifaId, no el id del conceptoTarifa
            aplica: shouldApply,
          });
        });

        // Crear payload para este contador
        payloadsArray.push({
          idEmpresaClienteContador: idEmpresaClienteContador,
          usuarioCambio: this.usuarioModificacion(),
          tarifasContador: tarifasContador,
        });
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
      } else {
        payload[payloadKey] = value || '';
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
      'tipoUso': { backendKey: 'idTipoUso', transform: (val) => String(val) },
      'estadoContador': { backendKey: 'idEstadoContador', transform: (val) => Number(val) },
      'estrato': { backendKey: 'estrato', transform: (val) => Number(val) },
      'digitos': { backendKey: 'digitos', transform: (val) => Number(val) },
      'fechaInstalacion': { backendKey: 'fechaInstalacion' },
      'idEmpleadoEmpresa': { backendKey: 'idEmpleado', transform: (val) => Number(val) },
      'idDepartamento': { backendKey: 'idDepartamento', transform: (val) => Number(val) },
      'idCiudad': { backendKey: 'idCiudad', transform: (val) => Number(val) },
      'idCorregimiento': { backendKey: 'idCorregimiento', transform: (val) => val ? Number(val) : null },
    };

    Object.keys(control.controls).forEach((key) => {
      const fieldControl = control.get(key);

      if (['aforosContador', 'aforoContadorNombre', 'aforosContadorData', 'idEmpresaClienteContador', 'isNewCounter',
           'departamentoNombre', 'ciudadNombre', 'corregimientoNombre', 'tipoContadorNombre',
           'tipoUsoNombre', 'estadoContadorNombre', 'nuid', 'porEstrato'].includes(key)) {
        return;
      }

      if (key === 'descripcion' && fieldControl instanceof FormGroup) {
        const descripcionControl = fieldControl.get('descripcion');
        if (descripcionControl?.dirty) {
          payload['descripcionDireccion'] = descripcionControl.value;
        }
        return;
      }

      if (fieldControl?.dirty) {
        const mapping = fieldMapping[key];

        if (mapping) {
          const value = fieldControl.value;
          payload[mapping.backendKey] = mapping.transform ? mapping.transform(value) : value;
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

      // Si es contador nuevo, enviar ID y idEmpleado
      if (isNewCounter) {
        const payload: any = { id: contador.id };

        if (contador.idEmpleadoEmpresa) {
          payload.idEmpleado = Number(contador.idEmpleadoEmpresa);
        }

        newCounters.push(payload);
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

            const newCounter = {
              id: counter.id,
              serial: counter.serial || formData.serial,
              nuid: counter.nuid || null,
              tipoContador: {
                id: counter.tipoContador?.id,
                nombre: counter.tipoContador?.nombre,
              },
              tipoUso: {
                id: counter.tipoUso?.id,
                nombre: counter.tipoUso?.nombre,
              },
              estadoContador: counter.estadoContador ? {
                id: counter.estadoContador?.id,
                descripcion: counter.estadoContador?.descripcion,
              } : null,
              porEstrato: counter.porEstrato || false,
              estrato: counter.estrato,
              digitos: counter.digitos || formData.digitos || null,
              fechaInstalacion: counter.fechaInstalacion || formData.fechaInstalacion || null,
              activo: counter.activo,
              isNewCounter: true,
              aforoContador: [],
              empleadoEmpresaId: counter.empleadoEmpresaId || formData.idEmpleadoEmpresa || null,
              descripcion: {
                id: counter.descripcion?.id,
                departamento: {
                  id: counter.descripcion?.departamento?.id,
                  nombre: counter.descripcion?.departamento?.nombre,
                },
                ciudad: {
                  id: counter.descripcion?.ciudad?.id,
                  nombre: counter.descripcion?.ciudad?.nombre,
                },
                corregimiento: counter.descripcion?.corregimiento
                  ? {
                      id: counter.descripcion?.corregimiento?.id,
                      nombre: counter.descripcion?.corregimiento?.nombre,
                    }
                  : null,
                descripcion: counter.descripcion?.descripcion,
              },
            };

            const contadorFormGroup = this.createCounterFormGroup(newCounter);
            this.contadoresFormArray.push(contadorFormGroup);
            this.contadoresFormArray.markAsDirty();
            this.updateForm.markAsDirty();

            const newIndex = this.contadoresFormArray.length - 1;
            this.setupCounterValueChangesForIndex(newIndex);

            this.closeAddCounterModal();
            this.toast.info(
              'Información',
              'Recuerde guardar los cambios del cliente para aplicar el nuevo contador',
            );
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

  // Tarifas disponibles (todas las tarifas de la empresa sin filtrar)
  readonly todasLasTarifas = computed(() => {
    const feeConceptData = this.feeConcept.value();
    if (!feeConceptData?.response) {
      return [];
    }

    const response = feeConceptData.response;
    const tarifas = Array.isArray(response) ? response : [response];

    return tarifas.map((t: any) => ({
      id: t.id, // Usar idConceptoTarifa como ID único
      nombre: t.tipoTarifa?.nombre || '',
      descripcion: t.tipoTarifa?.descripcion || '',
      codigo: t.tipoTarifa?.codigo || '',
      tipoConcepto: t.tipoConcepto ? {
        id: t.tipoConcepto.id,
        descripcion: t.tipoConcepto.descripcion,
        codigo: t.tipoConcepto.codigo
      } : null,
      tipoUso: t.tipoUso ? {
        id: t.tipoUso.id,
        nombre: t.tipoUso.nombre,
        codigo: t.tipoUso.codigo
      } : null,
      indCalcularMc: t.indCalcularMc || false,
      porEstrato: t.porEstrato || false,
      valor: t.valor || 0,
      estratos: t.estratos && Array.isArray(t.estratos) ? t.estratos.map((e: any) => ({
        id: e.id,
        estrato: e.estrato,
        valor: e.valor
      })) : [],
      idConceptoTarifa: t.id,
      tipoTarifaId: t.tipoTarifa?.id
    }));
  });

  // Tarifas para el modal (filtradas por porEstrato o tipoUso del contador seleccionado)
  readonly tarifasParaModal = computed(() => {
    const allTarifas = this.todasLasTarifas();
    const contadorId = this.selectedCounterForTarifas();

    if (!contadorId) {
      return allTarifas;
    }

    const contador = this.contadoresFormArray.controls.find(
      c => c.value.id === contadorId
    );

    if (!contador) {
      return allTarifas;
    }

    const porEstrato = contador.value.porEstrato;
    const tipoUsoCodigo = contador.value.tipoUso;

    // Si porEstrato es true, mostrar solo tarifas residenciales
    if (porEstrato === true) {
      return allTarifas.filter(t => t.porEstrato === true);
    }

    // Si porEstrato es false, filtrar por código del tipoUso
    if (porEstrato === false && tipoUsoCodigo) {
      // Obtener el objeto tipoUso completo del typeUseData
      const tipoUsoData = this.typeUseData().find((tu: any) => tu.id === tipoUsoCodigo);
      const codigoTipoUso = tipoUsoData?.codigo;

      if (codigoTipoUso) {
        return allTarifas.filter(t => t.tipoUso?.codigo === codigoTipoUso);
      }
    }

    return allTarifas;
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
    if (contador.tiposTarifaFaltantes && contador.tiposTarifaFaltantes.length > 0) {
      contador.tiposTarifaFaltantes.forEach((t: any) => {
        result.activas.push({
          id: 0,
          tipoTarifaId: t.id,
          nombre: t.nombre,
          codigo: t.codigo,
          descripcion: t.descripcion,
          aplica: true
        });
      });
    }

    return result;
  }

  // Obtener título del modal de tarifas según contexto
  getTarifasModalTitle(): string {
    const contadorId = this.selectedCounterForTarifas();
    if (contadorId) {
      // Buscar el contador por su ID
      const contador = this.contadoresFormArray.controls.find(
        c => c.value.id === contadorId
      );
      const serial = contador?.value.serial || 'Sin serial';
      return `Configurar Tarifas - Contador: ${serial}`;
    }
    return 'Gestionar Tarifas del Cliente';
  }
}
