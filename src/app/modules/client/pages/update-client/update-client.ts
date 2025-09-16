import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '@services/toast.service';
import { PersonService } from '../../service/person.service';
import { TypeDocumentService } from '../../service/typeDocument.service';
import { IDepartament } from '@interfaces/Idepartament';
import { ICity } from '@interfaces/Icity';
import { ICorregimiento } from '@interfaces/icorregimiento';
import { ITipoDocumento } from '@interfaces/Iuser';
import { IPerson } from '@interfaces/Iperson';
import { LocationService } from '@shared/services/location.service';


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
  selectedClient = signal<IPerson | null>(null);

  departamentos = signal<IDepartament[]>([]);
  ciudades = signal<ICity[]>([]);
  corregimientos = signal<ICorregimiento[]>([]);
  tiposDocumento = signal<ITipoDocumento[]>([]);

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
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
    this.setupFormValueChanges();

    const navigation = this.router.getCurrentNavigation();
    const clienteData = navigation?.extras?.state?.['clienteData'] || history.state?.clienteData;

    if (clienteData) {
      this.selectedClient.set(clienteData);
      this.loadClientFromData(clienteData);
    } else {
      this.toast.error('Error', 'No se pudo obtener la información del cliente');
      this.router.navigate(['/client']);
    }
  }  private initializeForm(): void {
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
      correo: [''],
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

  private loadClientFromData(clienteData: any): void {
    if (!clienteData) return;

    const nombreCompleto = clienteData.nombreCliente || '';
    const partesNombre = nombreCompleto.trim().split(' ');
    const tipoDocumentoId = 1;

    this.updateForm.patchValue({
      tipoDocumento: tipoDocumentoId,
      numeroDocumento: clienteData.numeroIdentificacion || '',
      primerNombre: partesNombre[0] || '',
      segundoNombre: partesNombre[1] || '',
      primerApellido: partesNombre[2] || '',
      segundoApellido: partesNombre[3] || '',
      telefono: clienteData.telefono || '',
      correo: clienteData.correo || '',
      direccion: clienteData.direccion || '',
      idDepartamento: '',
      idCiudad: '',
      idCorregimiento: ''
    });

    if (clienteData.codigoDepart) {
      this.selectedDepartmentId.set(clienteData.codigoDepart);
      this.updateForm.patchValue({ idDepartamento: clienteData.codigoDepart });
    }

    if (clienteData.codigoMuni) {
      setTimeout(() => {
        this.selectedCityId.set(clienteData.codigoMuni);
        this.updateForm.patchValue({ idCiudad: clienteData.codigoMuni });
      }, 100);
    }

    if (clienteData.codigoVereda) {
      setTimeout(() => {
        this.updateForm.patchValue({ idCorregimiento: clienteData.codigoVereda });
      }, 200);
    }
  }  onSubmit(): void {
    const clienteSeleccionado = this.selectedClient();
    if (!clienteSeleccionado?.id) {
      this.toast.error('Error', 'No se pudo obtener la información del cliente');
      return;
    }

    const formData = this.updateForm.value;
    const updatePayload = {
      id: clienteSeleccionado.id,
      direccion: {
        id: 0,
        departamentoId: {
          id: formData.idDepartamento ? Number(formData.idDepartamento) : 0,
          nombre: this.departamentos().find(d => d.id === Number(formData.idDepartamento))?.nombre || ''
        },
        ciudadId: {
          id: formData.idCiudad ? Number(formData.idCiudad) : 0,
          nombre: this.ciudades().find(c => c.id === Number(formData.idCiudad))?.nombre || ''
        },
        corregimientoId: {
          id: formData.idCorregimiento ? Number(formData.idCorregimiento) : 0,
          nombre: this.corregimientos().find(c => c.id === Number(formData.idCorregimiento))?.nombre || ''
        },
        descripcion: formData.direccion || ''
      },
      tipoDocumento: {
        id: formData.tipoDocumento ? Number(formData.tipoDocumento) : 1,
        nombre: this.tiposDocumento().find(t => t.id === Number(formData.tipoDocumento))?.nombre || '',
        codigo: ''
      },
      numeroCedula: formData.numeroDocumento || '',
      nombre: formData.primerNombre || '',
      segundoNombre: formData.segundoNombre || '',
      apellido: formData.primerApellido || '',
      segundoApellido: formData.segundoApellido || '',
      codigo: formData.primerNombre && formData.primerApellido ?
        `${formData.primerNombre}_${formData.primerApellido}`.toUpperCase() :
        `CLIENTE_${clienteSeleccionado.id}`,
      activo: true
    };

    this.personService.savaOrUpdatePerson(updatePayload as any).subscribe({
      next: () => {
        this.toast.success('Éxito', 'Cliente actualizado correctamente');
        this.router.navigate(['/client']);
      },
      error: (err) => {
        if (err.status === 200 || err.status === 201 || err.status === 204) {
          this.toast.success('Éxito', 'Cliente actualizado correctamente');
          this.router.navigate(['shell/client']);
        } else {
          this.toast.error('Error', 'No se pudo actualizar el cliente');
        }
      }
    });
  }
}
