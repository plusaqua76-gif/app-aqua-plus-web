import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ICity } from '@interfaces/Icity';
import { IDepartament } from '@interfaces/Idepartament';
import { ToastService } from '@services/toast.service';
import { EmpresaService } from '../../service/empresa.service';
import { DepartamentService } from '../../../auth/service/departament.service';
import { CityService } from '../../../auth/service/city.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-update-enterprise',
  imports: [CommonModule, FormsModule],
  templateUrl: './update-enterprise.html',
  providers: [DatePipe]
})
export class UpdateEnterprise implements OnInit {

  //Pipe ->  refactorizar el codigo, el settimeOut afecta demasiado el performnace de la aplicacion, el consumo de servicios no en entendible, por uqe se genera un objeto empresa si tenemos la interfaz , por uqe se le hace una promise a los metodos es mejor utilizar un observable

  empresa: {
    id: number | null;
    departamento: number | null;
    ciudad: number | null;
    corregimiento: number | null;
    nombre: string;
    nit: string;
    codigo: string;
    direccion: string;
  } = {
      id: null,
      departamento: 0,
      ciudad: 0,
      corregimiento: 0,
      nombre: '',
      nit: '',
      codigo: '',
      direccion: '',
    };
  departaments: IDepartament[] = [];
  cities: ICity[] = [];
  filteredCities: ICity[] = [];


  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly empresaService = inject(EmpresaService);
  private readonly departamentService = inject(DepartamentService);
  private readonly cityService = inject(CityService);
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

  ngOnInit(): void {
    Promise.all([
      firstValueFrom(this.departamentService.getAllDepartaments()),
      firstValueFrom(this.cityService.getAllCitys()),
    ]).then(([departResp, cityResp]) => {
      this.departaments = departResp.response;
      this.cities = cityResp.response;
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (id) this.loadEmpresa(id);
    }).catch(err => {
      console.error('❌ Error cargando datos iniciales:', err);
      this.toast.error('Error', 'No se pudieron cargar los datos iniciales');
    });
  }

  loadEmpresa(id: number): void {
    this.empresaService.getEmpresaById(id).subscribe({
      next: (res) => {
        const data = res.response;
        console.log('🌐 Respuesta cruda del backend:', data);
        const dept = this.departaments.find(d => d.nombre === data.departamento);
        const city = this.cities.find(c => c.nombre === data.ciudad);
        const correg = data.corregimiento;
        this.empresa = {
          id: id,
          departamento: dept?.id ?? null,
          ciudad: city?.id ?? null,
          corregimiento: null,
          nombre: data.nombre,
          nit: data.nit,
          codigo: data.codigo,
          direccion: data.descripcionDireccion ?? '',
        };
        console.log('🚀 Empresa mapeada con IDs:', this.empresa);
        this.onDepartamentChange();
        setTimeout(() => this.onCitiesChange(), 0);
      },
      error: (err) => {
        console.error('❌ Error al cargar la empresa:', err);
        this.toast.error('Error', 'No se pudo cargar la empresa.');
      }
    });
  }


  loadDepartamentData(): void {
    this.departamentService.getAllDepartaments().subscribe(resp => {
      this.departaments = resp.response;
    });
  }

  loadAllCities(): void {
    this.cityService.getAllCitys().subscribe(resp => {
      this.cities = resp.response;
    });
  }



  onDepartamentChange(): void {
    const idDept = this.empresa.departamento;
    console.log('🔁 Departamento seleccionado:', idDept);
    this.filteredCities = this.cities.filter(city => city.departamento?.id === idDept);
    console.log('🏙️ Ciudades filtradas:', this.filteredCities);
    if (!this.filteredCities.some(c => c.id === this.empresa.ciudad)) {
      this.empresa.ciudad = null;
    }
  }

  onCitiesChange(): void {
    const idCity = Number(this.empresa.ciudad);
  }

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

  onSubmit(): void {
    if (!this.empresa.id) {
      this.toast.error('Error', 'El ID de la empresa no es válido');
      return;
    }

    const nombreUsuario = this.nombreUsuario();

    const payload = {
      id_empresa: this.empresa.id,
      nombre: this.empresa.nombre,
      nit: this.empresa.nit,
      codigo: this.empresa.codigo,
      descripcion: this.empresa.direccion,
      id_departamento: this.empresa.departamento,
      id_ciudad: this.empresa.ciudad,
      usuario_cambio: nombreUsuario
    };

    this.empresaService.updateEmpresa(payload).subscribe({
      next: () => {
        this.toast.success('Éxito', 'Empresa actualizada correctamente');
        this.router.navigate(['/enterprise']);
      },
      error: (err) => {
        console.error('❌ Error al actualizar la empresa:', err);
        this.toast.error('Error', 'No se pudo actualizar la empresa.');
      }
    });
  }
}
