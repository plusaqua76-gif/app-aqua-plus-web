import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@services/toast.service';

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
            <!-- Tipo de PQR -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-300">
                Tipo de PQR
              </label>
              <div class="relative">
                <select
                  [(ngModel)]="selectedTipoPQR"
                  class="block w-full appearance-none rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 pr-10 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-400/40"
                >
                  <option [value]="null" class="bg-gray-900">
                    Seleccione el tipo de PQR
                  </option>
                  @for (tipo of tiposPQR; track tipo.id) {
                  <option [value]="tipo.id" class="bg-gray-900">
                    {{ tipo.nombre }}
                  </option>
                  }
                </select>

              </div>
            </div>

            <!-- Cliente -->
            <div>
              <label class="block mb-2 text-sm font-medium text-gray-300">
                Cliente
              </label>
              <div class="relative">
                <select
                  [(ngModel)]="selectedCliente"
                  class="block w-full appearance-none rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 pr-10 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-400/40"
                >
                  <option [value]="null" class="bg-gray-900">
                    Seleccione el cliente
                  </option>
                  @for (cliente of clientes; track cliente.id) {
                  <option [value]="cliente.id" class="bg-gray-900">
                    {{ cliente.nombre }} - {{ cliente.documento }}
                  </option>
                  }
                </select>

              </div>
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
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

  // Señales para el estado del componente
  selectedTipoPQR: any = null;
  selectedCliente: any = null;
  descripcionPQR: string = '';
  archivosSeleccionados: File[] = [];
  guardandoPQR = signal(false);

  // Datos de ejemplo - reemplazar por servicios reales
  tiposPQR = [
    { id: 1, nombre: 'Petición' },
    { id: 2, nombre: 'Queja' },
    { id: 3, nombre: 'Reclamo' },
    { id: 4, nombre: 'Sugerencia' },
  ];

  clientes = [
    { id: 1, nombre: 'Juan Pérez', documento: '12345678' },
    { id: 2, nombre: 'María García', documento: '87654321' },
    { id: 3, nombre: 'Carlos López', documento: '11223344' },
  ];

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

  puedeCrearPQR(): boolean {
    return !!(
      this.selectedTipoPQR &&
      this.selectedCliente &&
      this.descripcionPQR?.trim() &&
      this.descripcionPQR.trim().length <= 500
    );
  }

  crearPQR(): void {
    if (!this.puedeCrearPQR() || this.guardandoPQR()) {
      return;
    }

    const empresaId = this.empresaId();
    const usuario = this.nombreUsuario();

    if (!empresaId || !usuario) {
      this.toastService.error('Error', 'No se pudo obtener la información del usuario');
      return;
    }

    this.guardandoPQR.set(true);

    // Simular guardado del PQR
    setTimeout(() => {
      this.toastService.success('Éxito', 'PQR creado exitosamente');
      this.limpiarFormulario();
      this.guardandoPQR.set(false);
    }, 2000);
  }

  limpiarFormulario(): void {
    this.selectedTipoPQR = null;
    this.selectedCliente = null;
    this.descripcionPQR = '';
    this.archivosSeleccionados = [];
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
}
