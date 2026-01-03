import { isPlatformBrowser, CommonModule } from "@angular/common";
import { Component, computed, effect, inject, PLATFORM_ID } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { InvoiceService } from "../../services/invoice.service";
import { LocationDianService } from "../../services/locations.service";
import { catchError, of } from "rxjs";

@Component({
  selector: 'app-enterprice-dian',
  standalone: true,
  imports:[CommonModule],
  template: `
    <div class="min-h-screen p-4 sm:p-6 lg:p-8">
      <div class="max-w-7xl mx-auto space-y-6">

        <!-- Header -->
        <div class="backdrop-blur-xl bg-white/20 dark:bg-slate-800/20 rounded-3xl border border-white/20 dark:border-slate-700/30 shadow-2xl p-6">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Información DIAN
          </h1>
          <p class="text-gray-600 dark:text-gray-300">
            Datos de la resolución y empresa registrada en DIAN
          </p>
        </div>

        <!-- Loading State -->
        @if (dataResolution.isLoading() || dataEnterpriceDian.isLoading()) {
          <div class="backdrop-blur-xl bg-white/20 dark:bg-slate-800/20 rounded-3xl border border-white/20 dark:border-slate-700/30 shadow-2xl p-8">
            <div class="flex items-center justify-center space-x-3">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span class="text-gray-900 dark:text-white">Cargando información...</span>
            </div>
          </div>
        }

        <!-- Error State -->
        @if (dataResolution.error() || dataEnterpriceDian.error()) {
          <div class="backdrop-blur-xl bg-red-500/20 border border-red-500/30 rounded-3xl shadow-2xl p-6">
            <p class="text-red-700 dark:text-red-300 font-medium">
              Error al cargar la información. Por favor, intenta de nuevo.
            </p>
          </div>
        }

        <!-- Resolución DIAN -->
        @if (dataResolution.value()?.response; as resolution) {
          <div class="backdrop-blur-xl bg-white/20 dark:bg-slate-800/20 rounded-3xl border border-white/20 dark:border-slate-700/30 shadow-2xl overflow-hidden">
            <div class="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md px-6 py-4 border-b border-white/20 dark:border-slate-700/30">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Resolución DIAN
              </h2>
            </div>

            <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Número de Resolución -->
              <div class="space-y-2">
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Número de Resolución
                </label>
                <div class="px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl backdrop-blur-md">
                  <p class="text-gray-900 dark:text-white font-medium">{{ resolution.numero }}</p>
                </div>
              </div>

              <!-- Prefijo -->
              <div class="space-y-2">
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Prefijo
                </label>
                <div class="px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl backdrop-blur-md">
                  <p class="text-gray-900 dark:text-white font-medium">{{ resolution.prefijo }}</p>
                </div>
              </div>

              <!-- Rango Numeración -->
              <div class="space-y-2">
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Rango de Numeración
                </label>
                <div class="px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl backdrop-blur-md">
                  <p class="text-gray-900 dark:text-white font-medium">
                    {{ resolution.numeroMinimo | number }} - {{ resolution.numeroMaximo | number }}
                  </p>
                </div>
              </div>

              <!-- Número Actual -->
              <div class="space-y-2">
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Número Actual
                </label>
                <div class="px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-xl backdrop-blur-md">
                  <p class="text-blue-700 dark:text-blue-300 font-bold text-lg">{{ resolution.numeroActual | number }}</p>
                </div>
              </div>

              <!-- Fecha Inicio -->
              <div class="space-y-2">
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Fecha Inicio
                </label>
                <div class="px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl backdrop-blur-md">
                  <p class="text-gray-900 dark:text-white font-medium">{{ resolution.fechaInicio | date:'dd/MM/yyyy' }}</p>
                </div>
              </div>

              <!-- Fecha Fin -->
              <div class="space-y-2">
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Fecha Fin
                </label>
                <div class="px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl backdrop-blur-md">
                  <p class="text-gray-900 dark:text-white font-medium">{{ resolution.fechaFin | date:'dd/MM/yyyy' }}</p>
                </div>
              </div>

              <!-- Clave Técnica -->
              <div class="space-y-2 md:col-span-2 lg:col-span-3">
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Clave Técnica
                </label>
                <div class="px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl backdrop-blur-md">
                  <p class="text-gray-900 dark:text-white font-mono text-sm break-all">{{ resolution.claveTecnica }}</p>
                </div>
              </div>

              <!-- ID Empresa DIAN -->
              <!-- <div class="space-y-2 md:col-span-2 lg:col-span-3">
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  ID Empresa DIAN
                </label>
                <div class="px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl backdrop-blur-md">
                  <p class="text-green-700 dark:text-green-300 font-mono font-bold">{{ resolution.empresa.idEmpresaDian }}</p>
                </div>
              </div> -->
            </div>
          </div>
        }

        <!-- Datos de la Empresa DIAN -->
        @if (dataEnterpriceDian.value()?.response?.company; as empresa) {
          <div class="backdrop-blur-xl bg-white/20 dark:bg-slate-800/20 rounded-3xl border border-white/20 dark:border-slate-700/30 shadow-2xl overflow-hidden">
            <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md px-6 py-4 border-b border-white/20 dark:border-slate-700/30">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Información de la Empresa
              </h2>
            </div>

            <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Nombre -->
              <div class="space-y-2 md:col-span-2">
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Razón Social
                </label>
                <div class="px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl backdrop-blur-md">
                  <p class="text-gray-900 dark:text-white font-bold text-lg">{{ empresa.name || '' }}</p>
                </div>
              </div>

              <!-- Nombre Comercial -->
              <div class="space-y-2">
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Nombre Comercial
                </label>
                <div class="px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl backdrop-blur-md">
                  <p class="text-gray-900 dark:text-white font-medium">{{ empresa.tradeName || '' }}</p>
                </div>
              </div>

              <!-- NIT -->
              @if (empresa.identification) {
                <div class="space-y-2">
                  <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    NIT
                  </label>
                  <div class="px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl backdrop-blur-md">
                    <p class="text-gray-900 dark:text-white font-bold">{{ empresa.identification }}{{ empresa.dv ? '-' + empresa.dv : '' }}</p>
                  </div>
                </div>
              }

              <!-- Tipo de Identificación -->
              @if (empresa.identificationType) {
                <div class="space-y-2">
                  <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Tipo de Identificación
                  </label>
                  <div class="px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl backdrop-blur-md">
                    <p class="text-gray-900 dark:text-white font-medium">{{ empresa.identificationType }}</p>
                  </div>
                </div>
              }

              <!-- Régimen -->
              @if (empresa.regimeCode) {
                <div class="space-y-2">
                  <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Código de Régimen
                  </label>
                  <div class="px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl backdrop-blur-md">
                    <p class="text-gray-900 dark:text-white font-medium">{{ empresa.regimeCode }}</p>
                  </div>
                </div>
              }

              <!-- Email -->
              @if (empresa.email) {
                <div class="space-y-2 md:col-span-2">
                  <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Correo Electrónico
                  </label>
                  <div class="px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl backdrop-blur-md">
                    <p class="text-gray-900 dark:text-white font-medium">{{ empresa.email }}</p>
                  </div>
                </div>
              }

              <!-- Teléfono -->
              @if (empresa.phone) {
                <div class="space-y-2">
                  <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Teléfono
                  </label>
                  <div class="px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl backdrop-blur-md">
                    <p class="text-gray-900 dark:text-white font-medium">{{ empresa.phone }}</p>
                  </div>
                </div>
              }

              <!-- Dirección -->
              @if (empresa.address) {
                <div class="space-y-2 md:col-span-2 lg:col-span-3">
                  <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Dirección Completa
                  </label>
                  <div class="px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl backdrop-blur-md">
                    <p class="text-gray-900 dark:text-white font-medium">
                      {{ empresa.address.address }}, {{ cityName() }}, {{ departmentName() }}, {{ empresa.address.country }}
                    </p>
                  </div>
                </div>
              }

              <!-- Certificado Alegra -->
              <div class="space-y-2">
                <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Certificado Alegra
                </label>
                <div class="px-4 py-3 rounded-xl backdrop-blur-md"
                  [ngClass]="empresa.useAlegraCertificate ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-500/10 border border-gray-500/30'">
                  <p class="font-semibold"
                    [ngClass]="empresa.useAlegraCertificate ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'">
                    {{ empresa.useAlegraCertificate ? 'Activo' : 'Inactivo' }}
                  </p>
                </div>
              </div>

              <!-- Notificación por Email -->
              @if (empresa.notificationByEmail) {
                <div class="space-y-2">
                  <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Notificación por Email
                  </label>
                  <div class="px-4 py-3 rounded-xl backdrop-blur-md"
                    [ngClass]="empresa.notificationByEmail.enabled ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-500/10 border border-gray-500/30'">
                    <p class="font-semibold"
                      [ngClass]="empresa.notificationByEmail.enabled ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'">
                      {{ empresa.notificationByEmail.enabled ? 'Habilitado' : 'Deshabilitado' }}
                    </p>
                  </div>
                </div>
              }

              <!-- Tipo de Empresa -->
              @if (empresa.type) {
                <div class="space-y-2">
                  <label class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Tipo de Empresa
                  </label>
                  <div class="px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl backdrop-blur-md">
                    <p class="text-gray-900 dark:text-white font-medium">{{ empresa.type }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        }

      </div>
    </div>
  `,
  styles: [``]
})
export class EnterpriceDian {

    protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);
  protected invoiceService = inject(InvoiceService);
  protected locationService = inject(LocationDianService);

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

  readonly empresaId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  });

  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });



  // Obtiene la resolución DIAN de la empresa
  dataResolution = rxResource({
    params: () => ({
      empresaId: this.empresaId(),
    }),
    stream: ({ params }) => {
      const { empresaId } = params;
      if (!empresaId) {
        return of(null);
      }
      return this.invoiceService.getResolutionDian(empresaId).pipe(
        catchError(error => {
          console.error('Error obteniendo resolución:', error);
          return of(null);
        })
      );
    }
  });

  // Computed para extraer el idEmpresaDian de la resolución
  readonly idEmpresaDian = computed(() => {
    const resolution = this.dataResolution.value();
    if (resolution?.response?.empresa?.idEmpresaDian) {
      return resolution.response.empresa.idEmpresaDian;
    }
    return null;
  });

  // Obtiene los datos completos de la empresa DIAN usando el idEmpresaDian
  dataEnterpriceDian = rxResource({
    params: () => ({
      idCompany: this.idEmpresaDian(),
    }),
    stream: ({ params }) => {
      const { idCompany } = params;
      if (!idCompany) {
        return of(null);
      }
      return this.invoiceService.getEnterpriceDian(idCompany.toString()).pipe(
        catchError(error => {
          console.error('Error obteniendo empresa DIAN:', error);
          return of(null);
        })
      );
    }
  });

  // Obtiene la lista de departamentos DIAN
  dataDepartments = rxResource({
    stream: () => {
      return this.locationService.GetDepartmentsDian().pipe(
        catchError(error => {
          console.error('Error obteniendo departamentos:', error);
          return of(null);
        })
      );
    }
  });

  // Computed para obtener el código del departamento de la empresa
  readonly departmentCode = computed(() => {
    const empresa = this.dataEnterpriceDian.value()?.response?.company;
    return empresa?.address?.department || null;
  });

  // Obtiene los municipios del departamento de la empresa
  dataMunicipalities = rxResource({
    params: () => ({
      departmentCode: this.departmentCode(),
    }),
    stream: ({ params }) => {
      const { departmentCode } = params;
      if (!departmentCode) {
        return of(null);
      }
      return this.locationService.GetMunicipalitiesByDepartment(departmentCode).pipe(
        catchError(error => {
          console.error('Error obteniendo municipios:', error);
          return of(null);
        })
      );
    }
  });

  // Computed para obtener el nombre del departamento
  readonly departmentName = computed(() => {
    const departmentsData = this.dataDepartments.value();
    const code = this.departmentCode();
    if (!departmentsData || !code) return code || '';
    const departments = (departmentsData as any)?.response;
    if (!departments || !Array.isArray(departments)) return code;
    const dept = departments.find((d: any) => d.code === code);
    return dept?.value || code;
  });

  // Computed para obtener el nombre de la ciudad
  readonly cityName = computed(() => {
    const municipalitiesData = this.dataMunicipalities.value();
    const empresa = this.dataEnterpriceDian.value()?.response?.company;
    const cityCode = empresa?.address?.city;
    if (!municipalitiesData || !cityCode) return cityCode || '';
    const municipalities = (municipalitiesData as any)?.response;
    if (!municipalities || !Array.isArray(municipalities)) return cityCode;
    const city = municipalities.find((m: any) => m.code === cityCode);
    return city?.value || cityCode;
  });

}
