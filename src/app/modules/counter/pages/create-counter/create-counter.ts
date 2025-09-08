import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, effect, signal, PLATFORM_ID, computed } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICity } from '@interfaces/Icity';
import { ICorregimiento } from '@interfaces/icorregimiento';
import { IDepartament } from '@interfaces/Idepartament';
import { ITypeCounter } from '@interfaces/ItypeCounter';
import { DepartamentService } from '../../../auth/service/departament.service';
import { CityService } from '../../../auth/service/city.service';
import { CorregimientoService } from '../../../auth/service/corregimiento.service';
import { TypeCounterService } from '../../service/typeCounter.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EnterpriseClientCounterService } from '../../../client/service/enterpriseClientCounter.service';
import { AuthService } from '../../../auth/service/auth.service';
import { ToastService } from '@services/toast.service';
import { UserService } from '../../../auth/service/user.service';
import { LocationService } from '@shared/services/location.service';
import { EmpleadoService } from '../../../employee/service/empleado.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'app-create-counter',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './create-counter.html',
})
export class CreateCounter implements OnInit {
  registerForm!: FormGroup;
  personaData: any;

  selectedDepartmentId = signal<number | null>(null);
  selectedCityId = signal<number | null>(null);
  departaments = signal<IDepartament[]>([]);
  cities = signal<ICity[]>([]);
  corregimientos = signal<ICorregimiento[]>([]);
  departmentsLoading = signal<boolean>(false);
  citiesLoading = signal<boolean>(false);
  corregimientosLoading = signal<boolean>(false);

  tipoContador: ITypeCounter[] = [];
  tipoContadorName: string[] = [];

  protected readonly departamentService = inject(DepartamentService);
  protected readonly fb = inject(FormBuilder);
  protected readonly cityService = inject(CityService);
  protected readonly corregimientoService = inject(CorregimientoService);
  protected readonly tipoContadorService = inject(TypeCounterService);
  protected readonly locationService = inject(LocationService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly enterpriseClientCounterService = inject(EnterpriseClientCounterService);
  protected readonly authService = inject(AuthService);
  protected readonly toast = inject(ToastService);
  protected readonly userService = inject(UserService);
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

  readonly empresaId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  });

  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });

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
    const nav = this.router.getCurrentNavigation();
    this.personaData = nav?.extras?.state?.['personaData'];

    if (!this.personaData) {
      const saved = sessionStorage.getItem('personaData');
      this.personaData = saved ? JSON.parse(saved) : null;
    }

    if (!this.personaData) {
      alert('No se encontraron datos del cliente. Regresando al formulario anterior.');
      this.router.navigate(['/shell/client/create-client']);
      return;
    }

    this.initializeForm();
    this.loadDepartments();
    this.loadTypeCounter();

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

dataEmployee = rxResource({
  params: () => ({ enterpriseId: this.empresaId() }),
  stream: ({ params: { enterpriseId } }) => enterpriseId? this.empleadoService.getEmployeeByEnterprice(enterpriseId): EMPTY
});

employeeData = computed(() => this.dataEmployee.value()?.response ?? []);

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      tipoContador: [null, Validators.required],
      serial: ['', Validators.required],
      idDepartamento: ['', Validators.required],
      idCiudad: ['', Validators.required],
      idCorregimiento: [''],
      direccion: [''],
      idEmpleadoEmpresa: ['', Validators.required],
    });
  }

  loadTypeCounter(): void {
    this.tipoContadorService.getAllTypeCounters().subscribe((response) => {
      this.tipoContador = response.response;
      this.tipoContadorName = response.response.map((tipoContador) => tipoContador.nombre);
    });
  }

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

  saveClient() {
    if (this.registerForm.valid && this.personaData) {
      const contadorData = this.registerForm.value;

      const idEmpresa = this.empresaId();
      const nombreUsuario = this.nombreUsuario();
      const id_empleado_empresa = contadorData.idEmpleadoEmpresa;

      if (!idEmpresa || !nombreUsuario) {
        this.toast.error('No se pudo obtener la información del usuario logueado', 'Error');
        return;
      }

      if (!id_empleado_empresa) {
        this.toast.error('Debe seleccionar un empleado para continuar', 'Empleado requerido');
        return;
      }

      const finalPayload = {
        idTipoDocumento: this.personaData.tipoDocumento,
        numeroCedula: Number(this.personaData.numeroDocumento),
        correo: this.personaData.correo,
        primerNombre: this.personaData.primerNombre,
        segundoNombre: this.personaData.segundoNombre || '',
        primerApellido: this.personaData.primerApellido,
        segundoApellido: this.personaData.segundoApellido || '',
        idDepartamento: parseInt(this.personaData.idDepartamento),
        idCiudad: parseInt(this.personaData.idCiudad),
        idCorregimiento: this.personaData.idCorregimiento ? parseInt(this.personaData.idCorregimiento) : null,
        telefono: String(this.personaData.telefono),
        descripcionDireccion: this.personaData.direccion || '',
        usuario: `${this.personaData.primerNombre} ${this.personaData.primerApellido}`,
        idEmpresa: idEmpresa,
        usuarioCreacion: nombreUsuario,
        idTipoContador: contadorData.tipoContador,
        serialContador: contadorData.serial,
        idEmpleadoEmpresa: parseInt(id_empleado_empresa),
        direccionContador: {
          idDepartamento: parseInt(contadorData.idDepartamento),
          idCiudad: parseInt(contadorData.idCiudad),
          idCorregimiento: contadorData.idCorregimiento ? parseInt(contadorData.idCorregimiento) : null,
          descripcionDireccion: contadorData.direccion || ''
        }
      };

      console.log('Payload que se enviará al backend:', finalPayload);

      this.enterpriseClientCounterService.saveClient(finalPayload).subscribe({
        next: (resp) => {
          if (resp.statusCode === 200 || resp.statusCode === 201) {
            sessionStorage.removeItem('personaData');
            this.toast.success('Cliente y contador guardados correctamente', 'Éxito');

            const personaDTO = {
              id: resp.id_persona || null,
              nombre: this.personaData.primerNombre,
              segundoNombre: this.personaData.segundoNombre,
              apellido: this.personaData.primerApellido,
              segundoApellido: this.personaData.segundoApellido,
              numeroCedula: this.personaData.numeroDocumento,
              activo: true
            };

            this.userService.sendEmailUsuario(personaDTO).subscribe({
              next: (response) => {
                if (response.success) {
                  this.toast.success('Correo enviado', 'Se ha enviado el correo al usuario.');
                } else {
                  this.toast.warning('Advertencia', 'Cliente creado, pero el correo no se pudo enviar.');
                }
              },
              error: (err) => {
                console.error('Error al enviar correo:', err);
                this.toast.error('Error al enviar el correo', 'Intente nuevamente o contacte a soporte.');
              }
            });

            this.router.navigate(['/shell/client']);
          } else {
            this.toast.warning(`Error al guardar: ${resp.message || 'Desconocido'}`, 'Advertencia');
          }
        },
        error: (err) => {
          console.error('Error en la petición', err);
          this.toast.error('Ocurrió un error al guardar los datos', 'Error');
        }
      });
    } else {
      this.toast.warning('Completa todos los campos antes de guardar', 'Formulario incompleto');
      this.registerForm.markAllAsTouched();
    }
  }
}
