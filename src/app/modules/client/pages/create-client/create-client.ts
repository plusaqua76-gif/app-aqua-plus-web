import { Component, inject, OnInit } from '@angular/core';
import { DepartamentService } from '../../../auth/service/departament.service';
import { CityService } from '../../../auth/service/city.service';
import { CorregimientoService } from '../../../auth/service/corregimiento.service';
import { TypeDocumentService } from '../../service/typeDocument.service';
import { IDepartament } from '@interfaces/Idepartament';
import { ICity } from '@interfaces/Icity';
import { ICorregimiento } from '@interfaces/icorregimiento';
import { ApiResponse } from '@interfaces/Iresponse';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ITipoDocumento } from '@interfaces/Iuser';
import { CommonModule } from '@angular/common';
import { ActivatedRoute , Router} from '@angular/router';
import { ToastService } from '@services/toast.service';


@Component({
  selector: 'app-create-client',
  imports: [FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './create-client.html',
})
export class CreateClient implements OnInit {
  registerForm!: FormGroup;

  departaments: IDepartament[] = [];
  cities: ICity[] = [];
  corregimientos: ICorregimiento[] = [];
  typeDocument: ITipoDocumento[] = [];
  typeDocumentName: string[] = [];

  selectedDepartamentId: number | null = null;
  selectCitiesId: number | null = null;
  selectCorregimientoId: number | null = null;
  selectedTipoDocumentoId: number | null = null;

  filteredCities: ICity[] = [];
  filteredCorregimientos: ICorregimiento[] = [];

  protected readonly departamentService = inject(DepartamentService);
   protected readonly fb = inject(FormBuilder);
  protected readonly cityService = inject(CityService);
  protected readonly corregimientoService = inject(CorregimientoService);
  protected readonly tipoDocumentoService = inject (TypeDocumentService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly toast = inject(ToastService);

  // rectificar la calidad del codigo y utilizar las señales y el rxResource para las llamadas

  ngOnInit(): void {
    this.initializeForm();
    this.loadDepartamentData();
    this.loadAllCities();
    this.loadAllCorregimiento();
    this.loadTypeDocument();

    this.registerForm
      .get('idDepartamento')
      ?.valueChanges.subscribe((departamentoId) => {
        console.log('valueChanges idDepartamento:', departamentoId);
        this.selectedDepartamentId = departamentoId;
        this.onDepartamentChange();
      });

    this.registerForm.get('idCiudad')?.valueChanges.subscribe(() => {
      this.onCitiesChange();
    });
  }
private initializeForm(): void {
    this.registerForm = this.fb.group({
      tipoDocumento: [null, Validators.required],
      numeroDocumento: ['', Validators.required],
      telefono:['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      primerApellido: ['', Validators.required],
      segundoApellido: [''],
      primerNombre: ['', Validators.required],
      segundoNombre: [''],
      idDepartamento: [null, Validators.required],
      idCiudad: [null, Validators.required],
      idCorregimiento: [null],
      direccion: [''],
    });
  }
   loadTypeDocument(): void {
    this.tipoDocumentoService.getAllTypeDocument().subscribe((response) => {
      console.log('Tipos de documento:', response.response);
      this.typeDocument = response.response;
      this.typeDocumentName = response.response.map((tipoDocumento) => tipoDocumento.nombre)
    })
  }
  loadDepartamentData(): void {
      this.departamentService.getAllDepartaments().subscribe((response) => {
        console.log('Departamentos:', response.response);
        this.departaments = response.response;
      });
    }

    loadAllCities(): void {
      this.cityService.getAllCitys().subscribe({
      next: (resp: ApiResponse<ICity[]>)  => {
        if (resp.success) {
          this.cities = resp.response;
          console.log('Ciudades cargados:', this.cities);
        } else {
          console.error('Error al cargar ciudades:', resp.message);
        }
      },
      error: (err) => {
        console.error('Error de red al cargar ciudades:', err);
      }
      });
    }

    loadAllCorregimiento(): void {
      this.corregimientoService.getAllCorregimientos().subscribe({
      next: (resp: ApiResponse<ICorregimiento[]>)  => {
        if (resp.success) {
          this.corregimientos = resp.response;
          console.log('Corregimientos cargados:', this.corregimientos);
        } else {
          console.error('Error al cargar corregimientos:', resp.message);
        }
      },
      error: (err) => {
        console.error('Error de red al cargar corregimientos:', err);
      }
      });
    }

    onDepartamentChange(): void {
      console.log('selectedDepartamentId:', this.selectedDepartamentId);
      console.log(
        'departamentoId de cada ciudad:',
        this.cities.map((c) => c.departamento?.id)
      );
      this.selectCitiesId = null;
      this.selectCorregimientoId = null;
      this.filteredCorregimientos = [];

      if (this.selectedDepartamentId) {
        this.filteredCities = this.cities.filter(
          (cyt) =>
            cyt.departamento &&
            Number(cyt.departamento.id) === Number(this.selectedDepartamentId)
        );
        console.log('filteredCities:', this.filteredCities);
      } else {
        this.filteredCities = [];
      }
    }

    onCitiesChange(): void {
      const selectedCityId = this.registerForm.get('idCiudad')?.value;
      this.selectCorregimientoId = null;

      if (selectedCityId) {
        this.filteredCorregimientos = this.corregimientos.filter(
          (cor) => cor.ciudad && String(cor.ciudad.id) === String(selectedCityId)
        );
        console.log('filteredCorregimientos:', this.filteredCorregimientos);
      } else {
        this.filteredCorregimientos = [];
        console.log('filteredCorregimientos: []');
      }
    }

 nextClient() {
  if (this.registerForm.valid) {
    const personaData = this.registerForm.value;
    sessionStorage.setItem('personaData', JSON.stringify(personaData));
    this.router.navigate(['/counter/create-counter']);
  } else {
    this.toast.error('Completa todos los campos requeridos antes de continuar', 'Formulario inválido');
    this.registerForm.markAllAsTouched();
  }
}
}
