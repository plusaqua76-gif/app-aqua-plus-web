import {
  Component,
  inject,
  OnInit,
  effect,
  signal,
  computed,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { of, catchError, switchMap } from 'rxjs';

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

@Component({
  selector: 'app-counter-enterprice',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './counter-enterprice.html',
})
export class CounterEnterprice implements OnInit {
  // Modal properties
  isModalOpen = signal<boolean>(false);
  isCreating = signal<boolean>(false);

  // Reading modal properties
  isReadingModalOpen = signal<boolean>(false);
  isCreatingReading = signal<boolean>(false);

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

  constructor() {
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
      tipoContador: ['', Validators.required], // Inicializar con string vacío
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

  loadTypeCounter = rxResource({
    stream: () => {
      return this.tipoContadorService.getAllTypeCounters();
    },
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
          console.error('❌ Error en el proceso de creación:', error);
          console.error('❌ Detalle del error:', error.message || error);
          console.error('❌ Stack del error:', error.stack);
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
          console.error('❌ Error final al crear contador empresarial:', err);
          this.toast.error('Error', `No se pudo crear el contador empresarial: ${err.message || 'Error desconocido'}`);
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
          // Recargar los datos del contador
          this.dataCounterEnterprice.reload();
        },
        error: (error) => {
          console.error('❌ Error al crear lectura:', error);
          this.isCreatingReading.set(false);
          this.toast.error('Error', 'No se pudo registrar la lectura');
        }
      });
  }
}
