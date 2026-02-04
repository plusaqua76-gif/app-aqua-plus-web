import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpleadoService } from '../../service/empleado.service';
import { PersonService } from '../../../client/service/person.service';
import { TypeDocumentService } from '../../../client/service/typeDocument.service';
import { LocationService } from '@shared/services/location.service';
import { ToastService } from '@services/toast.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, of } from 'rxjs';
import { IEmpleadoEmpresaResponse } from '@interfaces/Iemployee';
import { ITipoDocumento } from '@interfaces/Iuser';
import { IDepartament } from '@interfaces/Idepartament';
import { ICity } from '@interfaces/Icity';
import { ICorregimiento } from '@interfaces/icorregimiento';

@Component({
  selector: 'app-update-employee',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './update-employee.html',
})
export class UpdateEmployee implements OnInit {

  updateForm!: FormGroup;
  selectedEmployee = signal<IEmpleadoEmpresaResponse | null>(null);
  tiposDocumento = signal<ITipoDocumento[]>([]);
  initialFormValues: any = null;

  // Datos de ubicación
  selectedDepartmentId = signal<number | null>(null);
  selectedCityId = signal<number | null>(null);
  departamentos = signal<IDepartament[]>([]);
  ciudades = signal<ICity[]>([]);
  corregimientos = signal<ICorregimiento[]>([]);

  // Estados de carga
  departmentsLoading = signal<boolean>(false);
  citiesLoading = signal<boolean>(false);
  corregimientosLoading = signal<boolean>(false);

  private readonly route = inject(ActivatedRoute);
  private readonly empleadoService = inject(EmpleadoService);
  private readonly personService = inject(PersonService);
  private readonly typeDocumentService = inject(TypeDocumentService);
  private readonly locationService = inject(LocationService);
  protected readonly toast = inject(ToastService);
  protected readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  idEmployee = signal(0);

  readonly userData = computed(() => {
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (e) {
      console.error('Error parsing userData from sessionStorage:', e);
      return null;
    }
  });

  readonly usuarioModificacion = computed(() => {
    const data = this.userData();
    return data?.nombre || 'admin';
  });

  constructor() {
    this.idEmployee.set(Number(this.route.snapshot.paramMap.get('id')));

    effect(() => {
      const employeeData = this.employeeById.value();
      // Solo cargar desde el servicio si no tenemos datos de navegación
      if (employeeData?.response && !this.selectedEmployee()) {
        this.selectedEmployee.set(employeeData.response);
        this.loadEmployeeFromData(employeeData.response);
      }
    });

    // Effects para manejo de ubicación
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
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData(); // Cargar datos iniciales
    this.setupFormValueChanges(); // Configurar cambios del formulario

    // Capturar los datos del empleado enviados desde la tabla
    const navigation = this.router.getCurrentNavigation();
    const empleadoData = navigation?.extras?.state?.['empleadoData'] || history.state?.empleadoData;

    if (empleadoData) {
      this.selectedEmployee.set(empleadoData);
      this.loadEmployeeFromNavigationData(empleadoData);
    } else {
      // Si no hay datos en el state, cargar desde el servicio como fallback
      // El effect ya está configurado para manejar esto
      console.warn('No se recibieron datos de navegación, cargando desde servicio...');
    }
  }

  private initializeForm(): void {
    this.updateForm = this.fb.group({
      tipoDocumento: [1, [Validators.required]], // Valor por defecto
      numeroCedula: ['', [Validators.required]],
      primerNombre: ['', [Validators.required]],
      segundoNombre: [''],
      primerApellido: ['', [Validators.required]],
      segundoApellido: [''],
      idDepartamento: [''], // Quitar requerido inicialmente
      idCiudad: [''], // Quitar requerido inicialmente
      idCorregimiento: [''],
      direccion: [''], // Quitar requerido inicialmente
      codigo: ['', [Validators.required]],
      correo: ['', [Validators.email]],
      telefono: [''],
      activo: [true]
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

  private loadInitialData(): void {
    this.loadDepartments();
    this.loadTypeDocuments();
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
  }

  private loadEmployeeFromData(employeeData: IEmpleadoEmpresaResponse): void {
    if (!employeeData) return;

    // Dividir el nombre completo en partes
    const nombreCompleto = employeeData.personaNombreCompleto || '';
    const partesNombre = nombreCompleto.split(' ');

    this.updateForm.patchValue({
      tipoDocumento: 1, // Valor por defecto
      numeroCedula: employeeData.numeroCedula || '',
      primerNombre: partesNombre[0] || '',
      segundoNombre: partesNombre[1] || '',
      primerApellido: partesNombre[2] || '',
      segundoApellido: partesNombre[3] || '',
      codigo: employeeData.codigo || '',
      correo: employeeData.correo || '',
      telefono: employeeData.telefono || '',
      direccion: '', // Dejar vacío inicialmente
      activo: employeeData.activo ?? true
    });

    // Guardar los valores iniciales después de cargar los datos
    this.saveInitialFormValues();
  }

  // Método específico para cargar datos desde la navegación (datos de la tabla)
  private loadEmployeeFromNavigationData(empleadoData: any): void {
    if (!empleadoData) return;

    // Dividir el nombre completo en partes
    const nombreCompleto = empleadoData.personaNombreCompleto || '';
    const partesNombre = nombreCompleto.split(' ');

    this.updateForm.patchValue({
      tipoDocumento: 1,
      numeroCedula: empleadoData.numeroCedula || '',
      primerNombre: partesNombre[0] || '',
      segundoNombre: partesNombre[1] || '',
      primerApellido: partesNombre[2] || '',
      segundoApellido: partesNombre[3] || '',
      codigo: empleadoData.codigo || '',
      correo: empleadoData.correo || '',
      telefono: empleadoData.telefono || '',
      direccion: '', // Dejar vacío inicialmente
      activo: empleadoData.activo ?? true
    });

    // Guardar los valores iniciales después de cargar los datos
    this.saveInitialFormValues();
  }

  private saveInitialFormValues(): void {
    this.initialFormValues = this.updateForm.value;
  }

  private getChangedFields(): any {
    if (!this.initialFormValues) {
      return null;
    }

    const currentValues = this.updateForm.value;
    const changedFields: any = {};

    Object.keys(currentValues).forEach(key => {
      const currentValue = currentValues[key] === '' ? null : currentValues[key];
      const initialValue = this.initialFormValues[key] === '' ? null : this.initialFormValues[key];

      if (currentValue !== initialValue) {
        changedFields[key] = currentValues[key];
      }
    });

    return Object.keys(changedFields).length > 0 ? changedFields : null;
  }

  employeeById = rxResource({
    params: () => ({ idEmployee: this.idEmployee() }),
    stream: ({ params }) => {
      const { idEmployee } = params;
      if (!idEmployee) {
        return EMPTY;
      }
      return this.empleadoService.getEmpleadoById(idEmployee).pipe(
        catchError((error) => {
          console.error('Error loading employee:', error);
          this.toast.error('Error', 'No se pudo cargar la información del empleado');
          return of(null);
        })
      );
    },
  });

  onSubmit(): void {
    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      this.toast.error('Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    const empleadoSeleccionado = this.selectedEmployee();
    if (!empleadoSeleccionado) {
      this.toast.error('Error', 'No se pudo obtener la información del empleado');
      return;
    }

    // Obtener solo los campos que fueron modificados
    const changedFields = this.getChangedFields();

    if (!changedFields) {
      this.toast.info('Información', 'No se detectaron cambios');
      return;
    }

    const usuarioModificacion = this.usuarioModificacion();

    // Construir el payload solo con los campos modificados
    const updatePayload: any = {
      id: empleadoSeleccionado.personaId || this.idEmployee() // Siempre incluir el ID
    };

    // Agregar campos modificados al payload
    if (changedFields.tipoDocumento !== undefined) {
      updatePayload.tipoDocumento = { id: Number(changedFields.tipoDocumento) };
    }

    if (changedFields.numeroCedula !== undefined) {
      updatePayload.numeroCedula = changedFields.numeroCedula;
    }

    if (changedFields.primerNombre !== undefined) {
      updatePayload.nombre = changedFields.primerNombre;
    }

    if (changedFields.segundoNombre !== undefined) {
      updatePayload.segundoNombre = changedFields.segundoNombre;
    }

    if (changedFields.primerApellido !== undefined) {
      updatePayload.apellido = changedFields.primerApellido;
    }

    if (changedFields.segundoApellido !== undefined) {
      updatePayload.segundoApellido = changedFields.segundoApellido;
    }

    if (changedFields.telefono !== undefined) {
      updatePayload.telefono = changedFields.telefono;
    }

    if (changedFields.correo !== undefined) {
      updatePayload.correo = changedFields.correo;
    }

    if (changedFields.idCiudad !== undefined ||
        changedFields.idCorregimiento !== undefined ||
        changedFields.direccion !== undefined) {
      updatePayload.direccion = {
        id: 0,
        ciudad: changedFields.idCiudad ? { id: Number(changedFields.idCiudad) } : undefined,
        corregimiento: changedFields.idCorregimiento ? { id: Number(changedFields.idCorregimiento) } : undefined,
        descripcion: changedFields.direccion || ''
      };

      Object.keys(updatePayload.direccion).forEach(key => {
        if (updatePayload.direccion[key] === undefined) {
          delete updatePayload.direccion[key];
        }
      });
    }

    updatePayload.usuarioModificacion = usuarioModificacion;

    this.personService.savaOrUpdatePerson(updatePayload as any).subscribe({
      next: (response: any) => {
        this.toast.success('Éxito', 'Empleado actualizado correctamente');
        this.router.navigate(['/shell/employee']);
      },
      error: (err: any) => {
        console.error('Error al actualizar empleado:', err);
        if (err.status === 200 || err.status === 201 || err.status === 204) {
          this.toast.success('Éxito', 'Empleado actualizado correctamente');
          this.router.navigate(['/shell/employee']);
        } else {
          this.toast.error('Error', 'No se pudo actualizar el empleado');
        }
      }
    });
  }

  onToggleEstado(): void {
    const currentValue = this.updateForm.get('activo')?.value;
    this.updateForm.patchValue({ activo: !currentValue });
  }

  goBack(): void {
    this.router.navigate(['/shell/employee']);
  }
}
