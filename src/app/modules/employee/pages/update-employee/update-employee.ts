import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpleadoService } from '../../service/empleado.service';
import { ToastService } from '@services/toast.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, of } from 'rxjs';
import { IEmpleadoEmpresaResponse } from '@interfaces/Iemployee';

@Component({
  selector: 'app-update-employee',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './update-employee.html',
})
export class UpdateEmployee implements OnInit {

  updateForm!: FormGroup;
  selectedEmployee = signal<IEmpleadoEmpresaResponse | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly empleadoService = inject(EmpleadoService);
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
      if (employeeData?.response) {
        this.selectedEmployee.set(employeeData.response);
        this.loadEmployeeFromData(employeeData.response);
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.updateForm = this.fb.group({
      personaNombreCompleto: ['', [Validators.required]],
      numeroCedula: ['', [Validators.required]],
      codigo: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
      activo: [true]
    });
  }

  private loadEmployeeFromData(employeeData: IEmpleadoEmpresaResponse): void {
    if (!employeeData) return;

    this.updateForm.patchValue({
      personaNombreCompleto: employeeData.personaNombreCompleto || '',
      numeroCedula: employeeData.numeroCedula || '',
      codigo: employeeData.codigo || '',
      correo: employeeData.correo || '',
      telefono: employeeData.telefono || '',
      activo: employeeData.activo ?? true
    });
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
    if (!empleadoSeleccionado?.id) {
      this.toast.error('Error', 'No se pudo obtener la información del empleado');
      return;
    }

    const formData = this.updateForm.value;
    const usuarioModificacion = this.usuarioModificacion();

    const updatePayload = {
      id: empleadoSeleccionado.id,
      empresaId: empleadoSeleccionado.empresaId,
      personaId: empleadoSeleccionado.personaId,
      personaNombreCompleto: formData.personaNombreCompleto || '',
      numeroCedula: formData.numeroCedula || '',
      codigo: formData.codigo || '',
      correo: formData.correo || '',
      telefono: formData.telefono || '',
      activo: formData.activo ?? true,
      usuarioActualizacion: usuarioModificacion,
      fechaModificacion: new Date()
    };

    // Usando el método de actualización del servicio
    this.empleadoService.updateEmpleado(updatePayload).subscribe({
      next: (response: any) => {
        this.toast.success('Éxito', 'Empleado actualizado correctamente');
        this.router.navigate(['/shell/employee']);
      },
      error: (err: any) => {
        console.error('Error al actualizar empleado:', err);
        // Manejar casos donde el backend devuelve 200 pero con error HTTP
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
