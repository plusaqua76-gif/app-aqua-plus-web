import { Component, inject, OnInit, effect, signal } from '@angular/core';
import { DepartamentService } from '../../../auth/service/departament.service';
import { CityService } from '../../../auth/service/city.service';
import { CorregimientoService } from '../../../auth/service/corregimiento.service';
import { TypeDocumentService } from '../../service/typeDocument.service';
import { IDepartament } from '@interfaces/Idepartament';
import { ICity } from '@interfaces/Icity';
import { ICorregimiento } from '@interfaces/icorregimiento';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ITipoDocumento } from '@interfaces/Iuser';
import { CommonModule } from '@angular/common';
import { ActivatedRoute , Router} from '@angular/router';
import { ToastService } from '@services/toast.service';
import { LocationService } from '@shared/services/location.service';


@Component({
  selector: 'app-create-client',
  imports: [FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './create-client.html',
})
export class CreateClient implements OnInit {
  registerForm!: FormGroup;

  selectedDepartmentId = signal<number | null>(null);
  selectedCityId = signal<number | null>(null);
  departaments = signal<IDepartament[]>([]);
  cities = signal<ICity[]>([]);
  corregimientos = signal<ICorregimiento[]>([]);
  departmentsLoading = signal<boolean>(false);
  citiesLoading = signal<boolean>(false);
  corregimientosLoading = signal<boolean>(false);

  typeDocument: ITipoDocumento[] = [];
  typeDocumentName: string[] = [];

  protected readonly departamentService = inject(DepartamentService);
  protected readonly fb = inject(FormBuilder);
  protected readonly cityService = inject(CityService);
  protected readonly corregimientoService = inject(CorregimientoService);
  protected readonly tipoDocumentoService = inject(TypeDocumentService);
  protected readonly locationService = inject(LocationService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly toast = inject(ToastService);

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
    this.initializeForm();
    this.loadDepartments();
    this.loadTypeDocument();

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

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      tipoDocumento: [null, Validators.required],
      numeroDocumento: ['', Validators.required],
      telefono: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      primerApellido: ['', Validators.required],
      segundoApellido: [''],
      primerNombre: ['', Validators.required],
      segundoNombre: [''],
      idDepartamento: ['', Validators.required],
      idCiudad: ['', Validators.required],
      idCorregimiento: [''],
      direccion: [''],
    });
  }

  loadTypeDocument(): void {
    this.tipoDocumentoService.getAllTypeDocument().subscribe((response) => {
      console.log('Tipos de documento:', response.response);
      this.typeDocument = response.response;
      this.typeDocumentName = response.response.map((tipoDocumento) => tipoDocumento.nombre);
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

  nextClient() {
    if (this.registerForm.valid) {
      const personaData = this.registerForm.value;
      sessionStorage.setItem('personaData', JSON.stringify(personaData));
      this.router.navigate(['/shell/counter/create-counter']);
    } else {
      this.toast.error('Completa todos los campos requeridos antes de continuar', 'Formulario inválido');
      this.registerForm.markAllAsTouched();
    }
  }
}
