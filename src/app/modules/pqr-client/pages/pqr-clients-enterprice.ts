import { Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@services/toast.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { PqrEnterprisesService } from '../services/pqr-enterprices.service';
import { of, switchMap, firstValueFrom } from 'rxjs';
import { ICreateNovedadWithFileRequest } from '@interfaces/INovelty/IClienteNovedad';
import { ITypeNovelty } from '@interfaces/INovelty/ItypeNovelty';

@Component({
  selector: 'app-pqr-clients-enterprice',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="w-full bg-transparent text-gray-200">
      <div class="mx-auto max-w-7xl px-4 py-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h2 class="text-2xl md:text-3xl font-semibold tracking-tight">
            Crear PQR de Cliente
          </h2>
          <div class="flex gap-3">
            <button
              type="button"
              (click)="limpiarFormulario()"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-600/70 bg-transparent px-6 py-3 text-sm text-gray-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-gray-400/40 transition-colors"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Limpiar
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <!-- Columna izquierda - Formulario -->
          <div class="space-y-6">
            <!-- Búsqueda de Factura -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-300">
                Código de Factura
              </label>
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="billTerm"
                  (ngModelChange)="onBillTermChange($event)"
                  class="block w-full appearance-none rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 pr-10 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-400/40"
                  placeholder="Buscar código de factura..."
                />
                @if (billcode.isLoading()) {
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg class="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                }
              </div>
              @if (billcode.value()?.response && billcode.value()!.response.length > 0) {
                <div class="mt-2 space-y-2">
                  <p class="text-sm text-gray-300 font-medium">Facturas encontradas:</p>
                  @for (bill of billcode.value()!.response; track bill.id) {
                    <div
                      class="p-3 rounded-lg border cursor-pointer transition-colors"
                      [class]="selectedBill?.id === bill.id ? 'border-green-600/70 bg-green-900/20' : 'border-gray-600/70 bg-gray-800/20 hover:bg-gray-700/20'"
                      (click)="selectBill(bill)"
                    >
                      <div class="flex items-center gap-2">
                        @if (selectedBill?.id === bill.id) {
                          <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        } @else {
                          <div class="w-4 h-4 rounded-full border border-gray-400"></div>
                        }
                        <span class="text-sm" [class]="selectedBill?.id === bill.id ? 'text-green-300' : 'text-gray-300'">
                          {{ bill.codigo }}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              }
              @if (shouldShowNoResultsMessage()) {
                <div class="mt-2 p-3 rounded-lg border border-red-600/70 bg-red-900/20">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-sm text-red-300">
                      No se encontró ninguna factura con ese código
                    </span>
                  </div>
                </div>
              }
            </div>

            <!-- Cliente -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-300">
                Contador
              </label>
              <div class="relative">
                <select
                 [(ngModel)]="selectedContador"
                 class="block w-full appearance-none rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 pr-10 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-400/40"
                >
                  <option [value]="null" class="bg-gray-900">
                    Seleccione el contador
                  </option>
                  @if (countersClient.value()?.response) {
                    @for(counter of countersClient.value()!.response; track counter.cliente.id) {
                      <option [value]="counter.id" class="bg-gray-900">
                        {{ counter.contador.serial }} - {{ counter.contador.tipoContador.nombre }}
                      </option>
                    }
                  }
                  @if (countersClient.isLoading()) {
                    <option disabled class="bg-gray-900">Cargando clientes...</option>
                  }
                  @if (countersClient.error()) {
                    <option disabled class="bg-gray-900">Error al cargar clientes</option>
                  }
                  @if (!empresaId() || !personaId()) {
                    <option disabled class="bg-gray-900">Faltan datos de usuario ({{ !empresaId() ? 'empresaId' : '' }} {{ !personaId() ? 'personaId' : '' }})</option>
                  }
                </select>
                @if (countersClient.isLoading()) {
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg class="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                }
              </div>
              <!-- Debug info - Remover en producción -->
              @if (countersClient.error()) {
                <div class="mt-2 p-2 bg-red-900/20 border border-red-600/70 rounded text-xs text-red-300">
                  Error: {{ countersClient.error() | json }}
                </div>
              }
            </div>

            <!-- Descripción -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-300">
                Descripción del PQR
              </label>
              <textarea
                [(ngModel)]="descripcionPQR"
                rows="6"
                placeholder="Describa detalladamente el motivo del PQR..."
                class="block w-full rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-400/40 resize-none"
              ></textarea>
              <div class="flex justify-between mt-2">
                <span class="text-xs text-gray-400">Máximo 500 caracteres</span>
                <span class="text-xs text-gray-400">{{ descripcionPQR.length || 0 }}/500</span>
              </div>
            </div>

            <!-- Botón Crear PQR - Solo visible en desktop -->
            <div class="mt-8 hidden lg:block">
              <button
                type="button"
                (click)="crearPQR()"
                [disabled]="!puedeCrearPQR() || guardandoPQR()"
                class="inline-flex w-full items-center justify-center rounded-xl border border-gray-600/70 bg-transparent px-6 py-4 text-sm font-medium text-gray-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-gray-400/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                @if (guardandoPQR()) {
                  <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando PQR...
                } @else {
                  <svg class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Crear PQR
                }
              </button>
            </div>
          </div>

          <!-- Columna derecha - Carga de imágenes -->
          <div class="space-y-6">
            <div>
              <label class="block mb-4 text-sm font-medium text-gray-300">
                Imágenes de soporte (Opcional)
              </label>

              <!-- Zona de carga -->
              <div class="flex items-center justify-center w-full">
                <label
                  for="dropzone-file"
                  class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600/70 border-dashed rounded-xl cursor-pointer bg-transparent hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-gray-400/40 transition-colors"
                  (dragover)="onDragOver($event)"
                  (dragleave)="onDragLeave($event)"
                  (drop)="onFileDrop($event)"
                >
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg class="w-10 h-10 mb-4 text-gray-400" aria-hidden="true" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p class="mb-2 text-sm text-gray-300">
                      <span class="font-semibold">Haz clic para subir</span> o arrastra y suelta
                    </p>
                    <p class="text-xs text-gray-400">
                      PNG, JPG, JPEG o PDF (Máx. 5MB por archivo)
                    </p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    class="hidden"
                    multiple
                    accept="image/*,.pdf"
                    (change)="onFileSelect($event)"
                  />
                </label>
              </div>

              <!-- Lista de archivos seleccionados -->
              @if (archivosSeleccionados.length > 0) {
                <div class="mt-4 space-y-2">
                  <h4 class="text-sm font-medium text-gray-300">Archivos seleccionados:</h4>
                  @for (archivo of archivosSeleccionados; track archivo.name; let i = $index) {
                    <div class="flex items-center justify-between rounded-lg border border-gray-600/70 bg-transparent p-3">
                      <div class="flex items-center gap-3">
                        <div class="flex-shrink-0">
                          @if (esImagen(archivo)) {
                            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                          } @else {
                            <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                          }
                        </div>
                        <div class="min-w-0 flex-1">
                          <p class="text-sm text-gray-200 truncate">{{ archivo.name }}</p>
                          <p class="text-xs text-gray-400">{{ formatFileSize(archivo.size) }}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        (click)="eliminarArchivo(i)"
                        class="flex-shrink-0 rounded-full p-1 text-red-400 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Botón Crear PQR - Visible en mobile al final, oculto en desktop -->
        <div class="mt-8 lg:hidden">
          <button
            type="button"
            (click)="crearPQR()"
            [disabled]="!puedeCrearPQR() || guardandoPQR()"
            class="inline-flex w-full items-center justify-center rounded-xl border border-gray-600/70 bg-transparent px-6 py-4 text-sm font-medium text-gray-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-gray-400/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            @if (guardandoPQR()) {
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creando PQR...
            } @else {
              <svg class="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Crear PQR
            }
          </button>
        </div>
      </div>
    </section>
  `,
})
export class PqrClientsEnterprice {
  protected readonly toastService = inject(ToastService);
  protected readonly pqrService = inject(PqrEnterprisesService);
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);


  selectedTipoPQR: any = null;
  selectedCliente: any = null;
  selectedContador: number = 0;
  descripcionPQR: string = '';
  archivosSeleccionados: File[] = [];
  guardandoPQR = signal(false);
  billTerm = signal('');
  selectedBill: { codigo: string; id: number } | null = null;

  billcode = rxResource({
    params: () => ({
      term: this.billTerm()
    }),
    stream: ({ params }) => {
      const { term } = params;
      if (!term || term.trim().length < 3) {
        return of(null);
      }
      return this.pqrService.getBillByCode(term);
    }
  })

  countersClient = rxResource({
    params: () => ({
      idEmpresa: this.empresaId(),
      idPersona: this.personaId()
    }),
    stream: ({ params }) => {
      const { idEmpresa, idPersona } = params;
      if (!idEmpresa || !idPersona) {
        return of(null);
      }
      return this.pqrService.getCounterByClientEnterprice(idEmpresa, idPersona);
    }
  })

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

    readonly personaId = computed(() => {
    const data = this.userData();
    return data?.personaId || null;
  });

  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });



  puedeCrearPQR(): boolean {
    return !!(
      this.selectedBill &&
      this.selectedContador &&
      this.descripcionPQR?.trim() &&
      this.descripcionPQR.trim().length <= 500
    );
  }

  async crearPQR(): Promise<void> {
    if (!this.puedeCrearPQR() || this.guardandoPQR()) {
      return;
    }

    const personaId = this.personaId();
    const usuario = this.nombreUsuario();

    if (!personaId || !usuario) {
      this.toastService.error('Error', 'No se pudo obtener la información del usuario');
      return;
    }

    this.guardandoPQR.set(true);

    try {
      // 1. Crear tipo de novedad
      const tipoNovedadData: ITypeNovelty = {
        novedad: "PQR Cliente",
        descripcion: this.descripcionPQR.trim(),
        activo: true,
        usuarioCreacion: usuario
      };

      // Obtener el ID del tipo de novedad usando subscribe
      const tipoNovedadResponse = await new Promise<any>((resolve, reject) => {
        this.pqrService.saveTypeNovelty(tipoNovedadData).subscribe({
          next: (response) => resolve(response),
          error: (error) => reject(new Error(error?.message || 'Error al crear tipo de novedad'))
        });
      });

      if (!tipoNovedadResponse?.response?.id) {
        this.toastService.error('Error', 'No se pudo crear el tipo de novedad');
        return;
      }

      // 2. Convertir archivo a base64 si existe
      let base64File = '';
      let nombreArchivo = usuario; // Usar el nombre de usuario como nombre del archivo
      let extension = 'jpg';

      if (this.archivosSeleccionados.length > 0) {
        const archivo = this.archivosSeleccionados[0];
        base64File = await this.convertirArchivoABase64(archivo);
        extension = archivo.name.split('.').pop() || 'jpg';
      }

      // 3. Construir el payload final
      const fechaActual = new Date().toISOString();

      const novedadRequest: ICreateNovedadWithFileRequest = {
        novedad: {
          tipoNovedad: { id: tipoNovedadResponse.response.id },
          empresaClienteContador: { id: Number(this.selectedContador) }, // Convertir a number
          estado: { codigo: "EST_PEN" },
          codigo: `PQR-${Date.now()}`, // Generar código único
          descripcion: this.descripcionPQR.trim(),
          activo: true,
          usuarioCreacion: usuario,
          fechaCreacion: fechaActual,
          usuarioModificacion: usuario,
          fechaModificacion: fechaActual
        },
        base64File: base64File,
        idPersona: personaId,
        nombreArchivo: nombreArchivo,
        extension: extension,
        categoriaCodigo: 'PQR'
      };

      // 4. Enviar la novedad al servicio
      this.pqrService.saveNovelty(novedadRequest).subscribe({
        next: (response) => {
          if (response.success) {
            this.toastService.success('Éxito', 'PQR creado exitosamente');
            this.limpiarFormulario();
          } else {
            this.toastService.error('Error', response.message || 'Error al crear el PQR');
          }
        },
        complete: () => {
          this.guardandoPQR.set(false);
        }
      });

    } catch (error) {
      console.error('Error en el proceso de creación:', error);
      this.toastService.error('Error', 'Error en el proceso de creación del PQR');
      this.guardandoPQR.set(false);
    }
  }

  private convertirArchivoABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          // Remover el prefijo "data:image/jpeg;base64," o similar
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Error al leer el archivo'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  }

  limpiarFormulario(): void {
    this.selectedTipoPQR = null;
    this.selectedCliente = null;
    this.selectedContador = 0;
    this.descripcionPQR = '';
    this.archivosSeleccionados = [];
    this.billTerm.set('');
    this.selectedBill = null;
  }

  // Métodos para manejo de archivos
  onFileSelect(event: any): void {
    const files = Array.from(event.target.files as FileList);
    this.procesarArchivos(files);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files) {
      const files = Array.from(event.dataTransfer.files);
      this.procesarArchivos(files);
    }
  }

  private procesarArchivos(files: File[]): void {
    const archivosValidos = files.filter(file => {
      const esValido = this.validarArchivo(file);
      if (!esValido) {
        this.toastService.error('Error', `El archivo ${file.name} no es válido`);
      }
      return esValido;
    });

    this.archivosSeleccionados = [...this.archivosSeleccionados, ...archivosValidos];
  }

  private validarArchivo(file: File): boolean {
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const tamañoMaximo = 5 * 1024 * 1024; // 5MB

    if (!tiposPermitidos.includes(file.type)) {
      return false;
    }

    if (file.size > tamañoMaximo) {
      return false;
    }

    return true;
  }

  eliminarArchivo(index: number): void {
    this.archivosSeleccionados.splice(index, 1);
  }

  esImagen(file: File): boolean {
    return file.type.startsWith('image/');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onBillTermChange(value: string): void {
    this.billTerm.set(value);
    // Limpiar la selección cuando se cambia el término de búsqueda
    this.selectedBill = null;
  }

  selectBill(bill: { codigo: string; id: number }): void {
    this.selectedBill = bill;
  }

  shouldShowNoResultsMessage(): boolean {
    const billData = this.billcode.value();
    const term = this.billTerm();

    // No mostrar mensaje si no hay término de búsqueda o es muy corto
    if (!term || term.trim().length < 3) {
      return false;
    }

    // No mostrar mensaje si está cargando
    if (this.billcode.isLoading()) {
      return false;
    }

    // Mostrar mensaje si hay error
    if (this.billcode.error()) {
      return true;
    }

    // Mostrar mensaje si la respuesta es null/undefined (204 No Content)
    if (!billData) {
      return true;
    }

    // Mostrar mensaje si la respuesta existe pero no tiene resultados
    if (billData.response && billData.response.length === 0) {
      return true;
    }

    return false;
  }
}
