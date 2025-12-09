import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, signal, effect, PLATFORM_ID, computed } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { EMPTY, of } from 'rxjs';
import { EnterpriseClientCounterService } from '../../service/enterpriseClientCounter.service';
import { IClienteDetalle } from '@interfaces/client/IclientDetail';
import { TypeCounterService } from '../../../counter/service/typeCounter.service';
import { ITypeCounter } from '@interfaces/ItypeCounter';
import { ConceptRateService } from '../../../fee/services/concept-rate.service';


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
  selectedClient = signal<IClienteDetalle | null>(null);
  empresaClienteContadorId = signal<number | null>(null);

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
  contadorCiudades = signal<{[key: number]: ICity[]}>({});
  contadorCorregimientos = signal<{[key: number]: ICorregimiento[]}>({});

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
  private readonly enterpriseClientCounterService = inject(EnterpriseClientCounterService);
  private readonly typeCounterService = inject(TypeCounterService);
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

  dataClient = rxResource({
    params: () => ({ empresaClienteContadorId: this.empresaClienteContadorId() }),
    stream: ({ params: { empresaClienteContadorId } }) =>
      empresaClienteContadorId ?
        this.enterpriseClientCounterService.getClientByEmpresaClienteContadorId(empresaClienteContadorId) :
        EMPTY
  });

  dataEmployee = rxResource({
    params: () => ({ enterpriseId: this.empresaId() }),
    stream: ({ params: { enterpriseId } }) => enterpriseId ? this.empleadoService.getEmployeeByEnterprice(enterpriseId) : EMPTY
  });

  loadTypeCounter = rxResource({
    stream: () => this.typeCounterService.getAllTypeCounters(),
  });


  feeConcept = rxResource({
    params: () => ({ enterpriseId: this.empresaId() }),
    stream: ({ params: { enterpriseId } }) =>
      enterpriseId ?
        this.conceptRateService.getConceptRateByEnterprise(enterpriseId)
        : of(null)
  })


  readonly employeeData = computed(() => this.dataEmployee.value()?.response || []);
  readonly clientData = computed(() => this.dataClient.value()?.response || null);

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

    // Effect para observar cambios en los datos del cliente
    effect(() => {
      const clienteData = this.clientData();
      if (clienteData) {
        this.selectedClient.set(clienteData);
        this.loadClientFromApiData(clienteData);
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
    this.setupFormValueChanges();

    // Capturar el empresaClienteContadorId desde la ruta
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !Number.isNaN(Number(id))) {
      this.empresaClienteContadorId.set(Number(id));
    } else {
      this.toast.error('Error', 'ID de cliente no válido');
      this.router.navigate(['/shell/client']);
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
      idEmpleadoEmpresa: ['', [Validators.required]],
      contadores: this.fb.array([]) // Agregar FormArray para contadores
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
    const fechaFormatted = contador.fechaInstalacion ?
      new Date(contador.fechaInstalacion).toISOString().split('T')[0] : '';

    return this.fb.group({
      id: [contador.id],
      serial: [contador.serial, Validators.required],
      fechaInstalacion: [fechaFormatted],
      tipoContador: [contador.tipoContador?.id, Validators.required],
      activo: [contador.activo],

      // Campos editables de ubicación
      idDepartamento: [contador.descripcion?.departamento?.id || '', Validators.required],
      idCiudad: [contador.descripcion?.ciudad?.id || '', Validators.required],
      idCorregimiento: [contador.descripcion?.corregimiento?.id || ''],

      descripcion: this.fb.group({
        id: [contador.descripcion?.id],
        departamento: this.fb.group({
          id: [contador.descripcion?.departamento?.id]
        }),
        ciudad: this.fb.group({
          id: [contador.descripcion?.ciudad?.id]
        }),
        corregimiento: this.fb.group({
          id: [contador.descripcion?.corregimiento?.id]
        }),
        descripcion: [contador.descripcion?.descripcion, Validators.required]
      }),
      // Campos para mostrar nombres (solo lectura)
      departamentoNombre: [contador.descripcion?.departamento?.nombre],
      ciudadNombre: [contador.descripcion?.ciudad?.nombre],
      corregimientoNombre: [contador.descripcion?.corregimiento?.nombre]
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

  // Métodos para cargar ubicaciones específicas de contadores
  private loadCounterCities(counterIndex: number, departmentId: number): void {
    this.locationService.getCiudades(departmentId).subscribe({
      next: (response) => {
        const currentCities = this.contadorCiudades();
        this.contadorCiudades.set({
          ...currentCities,
          [counterIndex]: response.response
        });
      },
      error: (error) => {
        console.error(`Error cargando ciudades para contador ${counterIndex}:`, error);
        this.toast.error('Error', 'No se pudieron cargar las ciudades para el contador');
      }
    });
  }

  private loadCounterCorregimientos(counterIndex: number, cityId: number): void {
    this.locationService.getCorregimientos(cityId).subscribe({
      next: (response) => {
        const currentCorregimientos = this.contadorCorregimientos();
        this.contadorCorregimientos.set({
          ...currentCorregimientos,
          [counterIndex]: response.response
        });
      },
      error: (error) => {
        console.error(`Error cargando corregimientos para contador ${counterIndex}:`, error);
        this.toast.error('Error', 'No se pudieron cargar los corregimientos para el contador');
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

  private loadTiposContador(): void {
    this.typeCounterService.getAllTypeCounters().subscribe({
      next: (response) => {
        this.tiposContador.set(response.response);
      },
      error: () => {
        this.toast.error('Error', 'No se pudieron cargar los tipos de contador');
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

    // Configurar listeners para cada contador
    this.setupCounterValueChanges();
  }

  private setupCounterValueChanges(): void {
    const contadoresArray = this.contadoresFormArray

    for (let index = 0; index < contadoresArray.controls.length; index++) {
      const contadorControl = contadoresArray.controls[index];
      const currentDeptId = contadorControl.get('idDepartamento')?.value;
      const currentCityId = contadorControl.get('idCiudad')?.value;

      if (currentDeptId) {
        this.loadCounterCities(index, Number(currentDeptId));
        if (currentCityId) {
          this.loadCounterCorregimientos(index, Number(currentCityId));
        }
      }

      // Listener para cambios en departamento del contador
      contadorControl.get('idDepartamento')?.valueChanges.subscribe((departamentoId) => {
        const numericDeptId = departamentoId ? Number(departamentoId) : null;
        if (numericDeptId) {
          this.loadCounterCities(index, numericDeptId);
          contadorControl.get('descripcion.departamento.id')?.setValue(numericDeptId, { emitEvent: false });
          contadorControl.patchValue({
            idCiudad: '',
            idCorregimiento: ''
          }, { emitEvent: false });
          contadorControl.get('descripcion.ciudad.id')?.setValue('', { emitEvent: false });
          contadorControl.get('descripcion.corregimiento.id')?.setValue('', { emitEvent: false });
        } else {
          // Limpiar datos cuando no hay departamento seleccionado
          const currentCities = this.contadorCiudades();
          const currentCorregimientos = this.contadorCorregimientos();
          this.contadorCiudades.set({
            ...currentCities,
            [index]: []
          });
          this.contadorCorregimientos.set({
            ...currentCorregimientos,
            [index]: []
          });

          // Limpiar campo anidado
          contadorControl.get('descripcion.departamento.id')?.setValue('', { emitEvent: false });
        }
      });

      // Listener para cambios en ciudad del contador
      contadorControl.get('idCiudad')?.valueChanges.subscribe((cityId) => {
        const numericCityId = cityId ? Number(cityId) : null;

        if (numericCityId) {
          this.loadCounterCorregimientos(index, numericCityId);

          // Actualizar también el campo anidado
          contadorControl.get('descripcion.ciudad.id')?.setValue(numericCityId, { emitEvent: false });

          // Limpiar corregimiento
          contadorControl.patchValue({
            idCorregimiento: ''
          }, { emitEvent: false });

          // Limpiar campo anidado también
          contadorControl.get('descripcion.corregimiento.id')?.setValue('', { emitEvent: false });
        } else {
          // Limpiar corregimientos cuando no hay ciudad seleccionada
          const currentCorregimientos = this.contadorCorregimientos();
          this.contadorCorregimientos.set({
            ...currentCorregimientos,
            [index]: []
          });

          // Limpiar campo anidado
          contadorControl.get('descripcion.ciudad.id')?.setValue('', { emitEvent: false });
        }
      });

      // Listener para cambios en corregimiento del contador
      contadorControl.get('idCorregimiento')?.valueChanges.subscribe((corregimientoId) => {
        const numericCorrId = corregimientoId ? Number(corregimientoId) : null;

        // Actualizar también el campo anidado
        if (numericCorrId) {
          contadorControl.get('descripcion.corregimiento.id')?.setValue(numericCorrId, { emitEvent: false });
        } else {
          contadorControl.get('descripcion.corregimiento.id')?.setValue('', { emitEvent: false });
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
      direccion: direccion?.descripcion || ''
    });

    // Llenar el formulario con los datos del cliente
    const formValues = {
      tipoDocumento: persona.tipoDocumento?.id || 1,
      numeroDocumento: persona.numeroCedula || '',
      primerNombre: persona.nombre || '',
      segundoNombre: persona.segundoNombre || '',
      primerApellido: persona.apellido || '',
      segundoApellido: persona.segundoApellido || '',
      telefono: telefono || '', // Obtener del nivel raíz
      correo: correo || '', // Obtener del nivel raíz
      direccion: direccion?.descripcion || '',
      idEmpleadoEmpresa: empleadoEmpresaId || '',
      // Pre-cargar ubicación si está disponible
      idDepartamento: departamento?.id || '',
      idCiudad: direccion?.ciudad?.id || '',
      idCorregimiento: direccion?.corregimiento?.id || ''
    };

    this.updateForm.patchValue(formValues);

    // Cargar contadores en el FormArray
    if (clienteData.contadores && clienteData.contadores.length > 0) {
      this.loadContadoresInForm(clienteData.contadores);
    }

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
      this.toast.error('Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    const clienteSeleccionado = this.selectedClient();
    if (!clienteSeleccionado) {
      this.toast.error('Error', 'No se pudo obtener la información del cliente');
      return;
    }

    const formData = this.updateForm.value;
    const usuarioModificacion = this.usuarioModificacion();
    const empresaClienteContadorId = this.empresaClienteContadorId();
    const contadoresFormatted = formData.contadores?.map((contador: any, index: number) => {

      const contadorPayload: any = {
        id: contador.id,
        serial: contador.serial,
        activo: contador.activo
      };

      if (contador.tipoContador) {
        contadorPayload.tipoContador = { id: contador.tipoContador };
      }

      // Solo incluir fechaInstalacion si existe
      if (contador.fechaInstalacion) {
        contadorPayload.fechaInstalacion = new Date(contador.fechaInstalacion).toISOString();
      }

      // Manejar descripción y ubicación del contador
      if (contador.descripcion) {
        contadorPayload.descripcion = {
          id: contador.descripcion.id,
          descripcion: contador.descripcion.descripcion
        };

        // Usar los nuevos campos de ubicación editables si están disponibles
        const departamentoId = contador.idDepartamento || contador.descripcion.departamento?.id;
        const ciudadId = contador.idCiudad || contador.descripcion.ciudad?.id;
        const corregimientoId = contador.idCorregimiento || contador.descripcion.corregimiento?.id;

        if (departamentoId) {
          contadorPayload.descripcion.departamento = { id: Number(departamentoId) };
        }
        if (ciudadId) {
          contadorPayload.descripcion.ciudad = { id: Number(ciudadId) };
        }
        if (corregimientoId) {
          contadorPayload.descripcion.corregimiento = { id: Number(corregimientoId) };
        }
      } else {
        console.warn(`No se encontró descripción para contador ${index}`);
      }

      return contadorPayload;
    }) || [];

    // Preparar el payload según el formato esperado por la API
    const updatePayload = {
      idEmpresaClienteContador: empresaClienteContadorId,
      primerNombre: formData.primerNombre || '',
      segundoNombre: formData.segundoNombre || '',
      primerApellido: formData.primerApellido || '',
      segundoApellido: formData.segundoApellido || '',
      numeroCedula: formData.numeroDocumento || '',
      idDepartamento: formData.idDepartamento ? Number(formData.idDepartamento) : null,
      idCiudad: formData.idCiudad ? Number(formData.idCiudad) : null,
      idCorregimiento: formData.idCorregimiento ? Number(formData.idCorregimiento) : null,
      descripcionDireccion: formData.direccion || '',
      correo: formData.correo || '',
      telefono: formData.telefono || '',
      usuarioCambio: usuarioModificacion,
      contadores: contadoresFormatted, // Usar contadores formateados
      idEmpleadoEmpresa: formData.idEmpleadoEmpresa ? Number(formData.idEmpleadoEmpresa) : null
    };

    this.enterpriseClientCounterService.updateClient(updatePayload).subscribe({
      next: (response: any) => {
        this.toast.success('Éxito', 'Cliente actualizado correctamente');
        this.router.navigate(['/shell/client']);
      },
      error: (err: any) => {
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
