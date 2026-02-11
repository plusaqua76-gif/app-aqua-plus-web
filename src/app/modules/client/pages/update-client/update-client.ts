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
import { catchError, EMPTY, of } from 'rxjs';
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

@Component({
  selector: 'app-update-client',
  imports: [CommonModule, ReactiveFormsModule],
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
  selectedTarifas = signal<number[]>([]); // IDs de tipoTarifa seleccionados
  tempSelectedTarifas = signal<number[]>([]); // Temporal para el modal
  originalTarifas = signal<number[]>([]); // Tarifas originales para comparación
  tarifasRegistros = signal<
    Array<{ id: number; idTipoTarifa: number; aplica: boolean }>
  >([]);

  selectedCodigosResidenciaFiscal = signal<string[]>([]);
  isCodigosDropdownOpen = signal<boolean>(false);

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

  readonly employeeData = computed(
    () => this.dataEmployee.value()?.response || [],
  );
  readonly clientData = computed(
    () => this.dataClient.value()?.response || null,
  );

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

        const tarifasNoAplicanIds: number[] = [];

        if (clienteData.tarifasContadores) {
          const registros = clienteData.tarifasContadores.map((t) => ({
            id: t.id,
            idTipoTarifa: t.tipoTarifa.id,
            aplica: t.aplica,
          }));
          this.tarifasRegistros.set(registros);

          clienteData.tarifasContadores
            .filter((t) => !t.aplica)
            .forEach((t) => tarifasNoAplicanIds.push(t.tipoTarifa.id));
        }

        this.selectedTarifas.set(tarifasNoAplicanIds);
        this.originalTarifas.set([...tarifasNoAplicanIds]);
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
      telefono: [''],
      correo: ['', [Validators.email]],
      idEmpleadoEmpresa: ['', [Validators.required]],
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
    // Formatear fecha para input date
    const fechaFormatted = contador.fechaInstalacion
      ? new Date(contador.fechaInstalacion).toISOString().split('T')[0]
      : '';

    // Si es un contador nuevo, no aplicar validadores ya que solo se enviará el ID
    const isNew = contador.isNewCounter || false;

    return this.fb.group({
      id: [contador.id],
      serial: [contador.serial, isNew ? [] : Validators.required],
      fechaInstalacion: [fechaFormatted],
      tipoContador: [
        contador.tipoContador?.id,
        isNew ? [] : Validators.required,
      ],
      activo: [contador.activo],
      isNewCounter: [isNew], // Flag para identificar contadores nuevos
      estrato: [
        contador.estrato || '',
        isNew
          ? []
          : [Validators.required, Validators.min(1), Validators.max(6)],
      ],
      digitos: [
        contador.digitos || '',
        isNew ? [] : [Validators.required, Validators.min(1)],
      ],

      // Campos editables de ubicación
      idDepartamento: [
        contador.descripcion?.departamento?.id || '',
        isNew ? [] : Validators.required,
      ],
      idCiudad: [
        contador.descripcion?.ciudad?.id || '',
        isNew ? [] : Validators.required,
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
          isNew ? [] : Validators.required,
        ],
      }),
      // Campos para mostrar nombres (solo lectura)
      departamentoNombre: [contador.descripcion?.departamento?.nombre],
      ciudadNombre: [contador.descripcion?.ciudad?.nombre],
      corregimientoNombre: [contador.descripcion?.corregimiento?.nombre],
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
      idEmpleadoEmpresa: empleadoEmpresaId || '',
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
    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      this.toast.error(
        'Error',
        'Por favor complete todos los campos requeridos',
      );
      return;
    }

    // Verificar si hay cambios
    const formDirty = this.updateForm.dirty;
    const tarifasDirty = this.hasTarifasChanged();

    if (!formDirty && !tarifasDirty) {
      this.toast.info('Información', 'No hay cambios para guardar');
      return;
    }

    // Construir payload solo con campos modificados
    const dirtyFields = this.getDirtyValues(this.updateForm);
    const payload: any = {
      idEmpresaClienteContador: this.empresaClienteContadorId(),
      usuarioCambio: this.usuarioModificacion(),
      ...this.mapDirtyFieldsToPayload(dirtyFields),
    };

    // Agregar contadores si fueron modificados
    const dirtyCounters = this.getDirtyCounters();
    if (dirtyCounters) {
      payload.contadores = dirtyCounters;
    }

    // Agregar tarifas si cambiaron
    if (tarifasDirty) {
      payload.tarifasContador = this.buildTarifasPayload();
    }

    this.enterpriseClientCounterService.updateClient(payload).subscribe({
      next: () => {
        this.toast.success('Éxito', 'Cliente actualizado correctamente');
        this.dataClient.reload();
        this.updateForm.markAsPristine();
        this.originalTarifas.set([...this.selectedTarifas()]);
      },
      error: (err) => {
        console.error('Error actualizando cliente:', err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/shell/client']);
  }

  // ==================== GESTIÓN DE TARIFAS ====================

  openTarifasModal(): void {
    this.isTarifasModalOpen.set(true);
    this.tempSelectedTarifas.set([...this.selectedTarifas()]);
  }

  closeTarifasModal(): void {
    this.isTarifasModalOpen.set(false);
    this.tempSelectedTarifas.set([]);
  }

  applyTarifas(): void {
    this.selectedTarifas.set([...this.tempSelectedTarifas()]);
    this.closeTarifasModal();
    this.toast.info(
      'Información',
      'Recuerde guardar los cambios del cliente para aplicar las tarifas',
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
    const allCount = this.allTarifasDisponibles().length;
    const noAplicanCount = this.tempSelectedTarifas().length;
    return allCount - noAplicanCount;
  }

  private buildTarifasPayload(): any[] {
    const tarifasArray: any[] = [];
    const registrosActuales = this.tarifasRegistros();
    const noAplicanIds = this.selectedTarifas();
    const allTarifas = this.allTarifasDisponibles();

    allTarifas.forEach((tarifa) => {
      const isSelected = noAplicanIds.includes(tarifa.id);
      const registroExistente = registrosActuales.find(
        (r) => r.idTipoTarifa === tarifa.id,
      );

      if (registroExistente) {
        tarifasArray.push({
          id: registroExistente.id,
          aplica: !isSelected,
        });
      } else if (isSelected) {
        tarifasArray.push({
          idTipoTarifa: tarifa.id,
          aplica: false,
        });
      }
    });

    return tarifasArray;
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
          'idEmpleadoEmpresa',
        ].includes(payloadKey)
      ) {
        payload[payloadKey] = value ? Number(value) : null;
      } else {
        payload[payloadKey] = value || '';
      }
    });

    return payload;
  }

  // Obtener contadores modificados o nuevos
  private getDirtyCounters(): any[] | null {
    const contadoresArray = this.contadoresFormArray;
    const dirtyCounters: any[] = [];

    contadoresArray.controls.forEach((control, index) => {
      const contador = control.value;
      const isNewCounter = contador.isNewCounter === true;

      // Incluir si está dirty O si es un contador nuevo
      if (!control.dirty && !isNewCounter) return;

      const payload: any = {
        id: contador.id,
        serial: contador.serial,
        activo: contador.activo,
      };

      if (contador.tipoContador) {
        payload.tipoContador = { id: contador.tipoContador };
      }

      if (contador.fechaInstalacion) {
        payload.fechaInstalacion = new Date(
          contador.fechaInstalacion,
        ).toISOString();
      }

      // Agregar estrato y digitos
      if (contador.estrato) {
        payload.estrato = Number(contador.estrato);
      }
      if (contador.digitos) {
        payload.digitos = Number(contador.digitos);
      }

      if (contador.descripcion) {
        const departamentoId =
          contador.idDepartamento || contador.descripcion.departamento?.id;
        const ciudadId = contador.idCiudad || contador.descripcion.ciudad?.id;
        const corregimientoId =
          contador.idCorregimiento || contador.descripcion.corregimiento?.id;

        payload.descripcion = {
          id: contador.descripcion.id,
          descripcion: contador.descripcion.descripcion,
        };

        if (departamentoId)
          payload.descripcion.departamento = { id: Number(departamentoId) };
        if (ciudadId) payload.descripcion.ciudad = { id: Number(ciudadId) };
        if (corregimientoId)
          payload.descripcion.corregimiento = { id: Number(corregimientoId) };
      }

      dirtyCounters.push(payload);
    });

    return dirtyCounters.length > 0 ? dirtyCounters : null;
  }

  // Verificar si las tarifas cambiaron
  private hasTarifasChanged(): boolean {
    const current = this.selectedTarifas();
    const original = this.originalTarifas();

    if (current.length !== original.length) return true;
    return !current.every((id) => original.includes(id));
  }

  // ==================== CREACIÓN DE NUEVOS CONTADORES ====================

  private initializeCounterForm(): void {
    this.counterForm = this.fb.group({
      tipoContador: ['', Validators.required],
      serial: ['', Validators.required],
      idDepartamento: [{ value: '', disabled: true }, Validators.required],
      idCiudad: [{ value: '', disabled: true }, Validators.required],
      idCorregimiento: [''],
      direccion: ['', Validators.required],
      estrato: [
        '',
        [Validators.required, Validators.min(1), Validators.max(6)],
      ],
      digitosContador: ['', [Validators.required, Validators.min(1)]],
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
        }),
      )
      .subscribe({
        next: (counterResponse: any) => {
          const counter = counterResponse?.response || counterResponse;

          if (counter && counter.id) {
            this.toast.success('Éxito', 'Contador creado correctamente');

            const newCounter = {
              id: counter.id,
              serial: counter.serial,
              fechaInstalacion: counter.fechaInstalacion,
              tipoContador: {
                id: counter.tipoContador?.id,
              },
              activo: counter.activo,
              isNewCounter: true,
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

  readonly allTarifasDisponibles = computed(() => {
    const clienteData = this.clientData();
    const tarifas: Array<{
      id: number;
      nombre: string;
      descripcion: string;
      codigo: string;
      aplica: boolean;
      registroId?: number;
    }> = [];

    if (clienteData?.tarifasContadores) {
      clienteData.tarifasContadores.forEach((t) => {
        tarifas.push({
          id: t.tipoTarifa.id,
          nombre: t.tipoTarifa.nombre,
          descripcion: t.tipoTarifa.descripcion,
          codigo: t.tipoTarifa.codigo,
          aplica: t.aplica,
          registroId: t.id,
        });
      });
    }

    if (clienteData?.tiposTarifaFaltantes) {
      clienteData.tiposTarifaFaltantes.forEach((t) => {
        tarifas.push({
          id: t.id,
          nombre: t.nombre,
          descripcion: t.descripcion,
          codigo: t.codigo,
          aplica: true,
        });
      });
    }

    return tarifas;
  });

  readonly tarifasActivas = computed(() => {
    return this.allTarifasDisponibles().filter((t) => t.aplica === true);
  });

  readonly tarifasNoAplicadas = computed(() => {
    return this.allTarifasDisponibles().filter((t) => t.aplica === false);
  });
}
