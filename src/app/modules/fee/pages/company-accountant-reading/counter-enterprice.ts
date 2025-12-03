import {
  Component,
  inject,
  OnInit,
  effect,
  signal,
  computed,
  PLATFORM_ID,
  ViewChild,
  TemplateRef,
  HostListener,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { of, catchError, switchMap, EMPTY } from 'rxjs';

// Services
import { TypeCounterService } from '../../../counter/service/typeCounter.service';
import { CounterService } from '../../../client/service/couter.service';
import { PersonService } from '../../../client/service/person.service';
import { LocationService } from '@shared/services/location.service';
import { ToastService } from '@services/toast.service';
import { EnterpriseClientCounterService } from '../../../client/service/enterpriseClientCounter.service';

// Interfaces
import { IDepartament } from '@interfaces/Idepartament';
import { ICity } from '@interfaces/Icity';
import { ICorregimiento } from '@interfaces/icorregimiento';
import { CounterEnterpriceService } from '../../services/counter-enterprice.service';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';
import { TableComponent } from '@components/table';

import { PopupComponent } from '@shared/components/popUp';

@Component({
  selector: 'app-counter-enterprice',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableComponent, PopupComponent],
  templateUrl: './counter-enterprice.html',
})
export class CounterEnterprice implements OnInit {

  isModalOpen = signal<boolean>(false);
  isCreating = signal<boolean>(false);
  isReadingModalOpen = signal<boolean>(false);
  isCreatingReading = signal<boolean>(false);
  isHistoryModalOpen = signal<boolean>(false);
  screenWidth = signal<number>(0);

  // @HostListener('window:resize', ['$event'])
  // onResize(event: any) {
  //   if (this.isBrowser) {
  //     this.screenWidth.set(window.innerWidth);
  //   }
  // }

  // Counter form properties
  counterForm!: FormGroup;
  readingForm!: FormGroup;
  selectedCounterDepartmentId = signal<number | null>(null);
  selectedCounterCityId = signal<number | null>(null);
  counterDepartaments = signal<IDepartament[]>([]);
  counterCities = signal<ICity[]>([]);
  counterCorregimientos = signal<ICorregimiento[]>([]);
  counterDepartmentsLoading = signal<boolean>(false);
  counterCitiesLoading = signal<boolean>(false);
  counterCorregimientosLoading = signal<boolean>(false);
  lastreading = signal<number>(0);

  protected readonly fb = inject(FormBuilder);
  protected readonly locationService = inject(LocationService);
  protected readonly tipoContadorService = inject(TypeCounterService);
  protected readonly counterService = inject(CounterService);
  protected readonly personService = inject(PersonService);
  protected readonly enterpriseClientCounterService = inject(EnterpriseClientCounterService);
  protected readonly counterEnterpriceService = inject(CounterEnterpriceService);
  protected readonly toast = inject(ToastService);
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);

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

 readonly lastreadingAssignment = computed(() => {
  const lecturaData = this.readingCounterEnterprice.value()?.response?.[0]?.lectura
    return lecturaData || 0;
  });

  constructor() {
    // Inicializar el ancho de pantalla
    // if (this.isBrowser && typeof window !== 'undefined') {
    //   this.screenWidth.set(window.innerWidth);
    // }

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

  dataCounterEnterprice = rxResource({
    params: () => ({
      idEmpresa: this.enterpriceId(),
    }),
    stream: ({ params }) => {
      if (!params.idEmpresa) {
        return of(null);
      }
      return this.counterEnterpriceService
        .getCounterEnterprice(params.idEmpresa)
        .pipe(
          catchError((error) => {
            return of(null);
          })
        );
    },
  });

  loadTypeCounter = rxResource({
    stream: () => {
      return this.tipoContadorService.getAllTypeCounters();
    }
  });

  ngOnInit(): void {
    this.initializeCounterForm();
    this.initializeReadingForm();
    this.loadCounterDepartments();
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

  private initializeCounterForm(): void {
    this.counterForm = this.fb.group({
      tipoContador: ['', Validators.required],
      serial: ['', Validators.required],
      idDepartamento: ['', Validators.required],
      idCiudad: ['', Validators.required],
      idCorregimiento: [''],
      direccion: ['', Validators.required],
    });
  }

  private initializeReadingForm(): void {
    this.readingForm = this.fb.group({
      lectura: ['', [Validators.required, Validators.min(0)]],
      consumoAnormal: [false, Validators.required],
      descripcion: ['', Validators.required]
    });
  }

  readonly serialCounter = computed(() => {
    return this.dataCounterEnterprice.value()?.response?.contador?.serial || '';
  });

  getHistoryModalLeftMargin = computed(() => {
    const width = this.screenWidth();
    if (width <= 768) {
      return '0px';
    } else {
      return '5rem';
    }
  });

  getHistoryModalWidth = computed(() => {
    const width = this.screenWidth();
    if (width <= 768) {
      return '100%';
    } else {
      return 'calc(100% - 5rem)';
    }
  });




  readonly historyPaginationParams = signal<IPaginationParams>({
    page: 0,
    size: 5,
  });

  // Columnas para la tabla de historial
  readonly historyColumns = signal([
    { field: 'contador.serial', header: 'Contador', type: 'text' as const },
    { field: 'lectura', header: 'Lectura(m³)', type: 'number' as const },
    { field: 'fechaLectura', header: 'Fecha Lectura', type: 'date' as const },
    { field: 'consumoAnormal', header: 'Consumo Anormal', type: 'text' as const },
    { field: 'descripcion', header: 'Observación', type: 'text' as const },
  ]);

  readingCounterEnterprice = rxResource({
    params: () => ({
      serial: this.serialCounter(),
      empresaId: this.enterpriceId(),
      pagination: this.historyPaginationParams(),
    }),
    stream: ({ params }) => {
      const { serial, empresaId, pagination } = params;
      if (!serial || !empresaId) {
        return of(null);
      }
      return this.counterEnterpriceService.getReadingsByEnterpricePaginated(
        empresaId,
        serial,
        pagination
      ).pipe(
        catchError((error) => {
          console.error('Error loading readings:', error);
          return of(null);
        })
      );
    }
  });


  // Métodos específicos para el formulario de contador
  loadCounterDepartments(): void {
    this.counterDepartmentsLoading.set(true);
    this.locationService.getDepartamentos().subscribe({
      next: (departaments) => {
        this.counterDepartaments.set(departaments.response);
        this.counterDepartmentsLoading.set(false);
      },
      error: (err) => {
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

  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  openReadingModal(): void {
    this.isReadingModalOpen.set(true);
  }

  closeReadingModal(): void {
    this.isReadingModalOpen.set(false);
    this.readingForm.reset();
  }

  openHistoryModal(): void {
    this.isHistoryModalOpen.set(true);
  }

  closeHistoryModal(): void {
    this.isHistoryModalOpen.set(false);
    // Resetear paginación al cerrar
    this.historyPaginationParams.set({ page: 0, size: 5 });
  }

  onHistoryPaginationChange(params: IPaginationParams): void {
    this.historyPaginationParams.set(params);
  }

  viewHistory(): void {
    const serial = this.serialCounter();
    if (!serial) {
      this.toast.error('Error', 'No hay contador disponible');
      return;
    }
    this.openHistoryModal();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day));
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  getFullName(cliente: any): string {
    if (!cliente) return '';
    const partes = [
      cliente.nombre,
      cliente.segundoNombre,
      cliente.apellido,
      cliente.segundoApellido
    ].filter(parte => parte && parte.trim() !== '');
    return partes.join(' ') || '';
  }

  createCounter(): void {
    // Validar empresa ID antes de empezar
    const enterpriseId = this.enterpriceId();
    if (!enterpriseId || enterpriseId === 0) {
      this.toast.error('Error', 'No se encontró un ID de empresa válido. Verifique que ha iniciado sesión correctamente.');
      return;
    }

    if (this.counterForm.invalid) {
      this.counterForm.markAllAsTouched();
      this.toast.error(
        'Error',
        'Por favor complete todos los campos requeridos'
      );
      return;
    }

    this.isCreating.set(true);
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
          if (!addressResponse?.response?.id) {
            throw new Error('No se pudo crear la dirección - ID inválido');
          }

          const counterPayload: any = {
            tipoContador: { id: Number(formData.tipoContador) },
            descripcion: { id: addressResponse.response.id },
            serial: formData.serial,
            activo: true,
            usuarioCreacion: usuarioCreacion,
          };
          return this.counterService.saveCounter(counterPayload);
        }),
        switchMap((counterResponse: any) => {
          const counterId = counterResponse?.response?.id || counterResponse?.id;
          if (!counterId) {;
            throw new Error('No se pudo obtener el ID del contador creado');
          }

          // Verificar que tenemos un enterpriceId válido
          const enterpriseId = this.enterpriceId();
          if (!enterpriseId || enterpriseId === 0) {
            throw new Error('ID de empresa no válido');
          }

          // Crear la relación empresa-contador con lectura inicial
          const enterpriseCounterPayload = {
            empresaContador: {
              empresa: { id: enterpriseId },
              contador: { id: counterId },
              usuarioCreacion: this.usuarioCreacion()
            },
            lectura: {
              lectura: 0, // Lectura inicial en 0
              fechaLectura: new Date().toISOString(),
              consumoAnormal: false,
              descripcion: "Lectura inicial del contador",
              activo: true,
              usuarioCreacion: this.usuarioCreacion()
            }
          };

          return this.counterEnterpriceService.createEmpresaCounter(enterpriseCounterPayload);
        }),
        catchError((error) => {
          this.isCreating.set(false);
          this.toast.error('Error', `Error en creación: ${error.message || 'Error desconocido'}`);
          return of(null);
        })
      )
      .subscribe({
        next: (enterpriseCounterResponse) => {
          this.isCreating.set(false);

          if (enterpriseCounterResponse?.success || enterpriseCounterResponse) {
            this.toast.success('Éxito', 'Contador empresarial creado correctamente');
            this.counterForm.reset();
            this.closeModal();
            this.dataCounterEnterprice.reload();
          } else {
            this.toast.error('Error', 'La respuesta del servidor es inválida');
          }
        },
        error: (err) => {
          this.isCreating.set(false);
        },
      });
  }

  createReading(): void {
    if (this.readingForm.invalid) {
      this.readingForm.markAllAsTouched();
      this.toast.error('Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    // Verificar que existe un contador asociado a la empresa
    const counterData = this.dataCounterEnterprice.value()?.response;
    if (!counterData?.contador?.id) {
      this.toast.error('Error', 'No hay contador asociado a esta empresa');
      return;
    }

    this.isCreatingReading.set(true);
    const formData = this.readingForm.value;

    // Crear el payload para la lectura (usando el mismo servicio)
    const readingPayload = {
      empresaContador: {
        empresa: { id: this.enterpriceId() },
        contador: { id: counterData.contador.id },
        usuarioCreacion: this.usuarioCreacion()
      },
      lectura: {
        lectura: Number(formData.lectura),
        fechaLectura: new Date().toISOString(),
        consumoAnormal: formData.consumoAnormal === 'true' || formData.consumoAnormal === true,
        descripcion: formData.descripcion,
        activo: true,
        usuarioCreacion: this.usuarioCreacion()
      }
    };

    this.counterEnterpriceService.createEmpresaCounter(readingPayload)
      .subscribe({
        next: (response) => {
          this.isCreatingReading.set(false);
          this.toast.success('Éxito', 'Lectura registrada correctamente');
          this.readingForm.reset();
          this.closeReadingModal();
          // Recargar los datos del contador y del historial
          this.dataCounterEnterprice.reload();
          this.readingCounterEnterprice.reload();
        },
        error: (error) => {
          this.isCreatingReading.set(false);
          this.toast.error('Error', 'No se pudo registrar la lectura');
        }
      });
  }

  handleTableAction(event: { action: string; row: any }): void {
    if (event.action === 'history') {
      this.router.navigate(['/shell/reading/history-reading', event.row.id]);
    }
  }
}
