import { Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DocumentAzureBlobService } from '../../services/document-azure-blob.service';
import { ToastService } from '@services/toast.service';
import { DocumentUpload } from '@interfaces/document-azure-blob/document';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { PopupComponent } from '@shared/components/popUp';

@Component({
  selector: 'app-payment-points',
  imports: [
    CommonModule,
    PopupComponent
  ],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Payment Points Gallery -->
      @if (paymentPointsData.isLoading()) {
        <div class="relative overflow-hidden shadow-2xl sm:rounded-2xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 mb-6">
          <div class="p-6 sm:p-8 flex items-center justify-center">
            <div class="flex items-center gap-3">
              <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span class="text-gray-600 dark:text-gray-400">Cargando puntos de pago...</span>
            </div>
          </div>
        </div>
      } @else if (paymentPointsData.value() && paymentPointsData.value()!.length > 0) {
        <div class="relative overflow-hidden shadow-2xl sm:rounded-2xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 mb-6">
          <div class="p-6 sm:p-8">
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">
              <i class="fas fa-map-marked-alt mr-2 text-blue-500"></i>
              Puntos de Pago Disponibles ({{ paymentPointsData.value()?.length ?? 0 }})
            </h3>

            <!-- File Upload Container con estilo del register -->
            <div style="position: relative; min-height: 48px; flex: 1; display: flex; flex-direction: column; gap: 0; margin-bottom: 24px;">
              <div style="position: relative; min-height: 48px; display: flex; flex-direction: column;">
                <input
                  type="file"
                  id="file_input_payment"
                  #fileInput
                  accept="image/*"
                  (change)="onImageSelected($event)"
                  style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer;"
                />
                <label for="file_input_payment" style="display: flex; align-items: center; justify-content: flex-start; gap: 8px; width: 100%; height: 48px; padding: 0 12px; background: rgb(255 255 255 / 4%); border: 2px solid transparent; border-radius: 6px; cursor: pointer; transition: 0.3s; color: rgb(156 163 175); font-size: 14px; position: relative;">
                  <svg
                    style="width: 18px; height: 18px; opacity: 0.7;"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 5v9m-5 0H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2M8 9l4-5 4 5m1 8h.01"
                    />
                  </svg>
                  Subir imagen del punto de pago
                </label>

                @if (imagePreview()) {
                  <div style="display: flex; gap: 12px; align-items: center; margin-top: 8px; padding: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1); width: 100%; position: relative;">
                    <img [src]="imagePreview()!" alt="Vista previa del archivo" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.2); flex-shrink: 0;" />
                    <div style="display: flex; flex-direction: column; gap: 2px; flex-grow: 1; min-width: 0;">
                      <span style="font-weight: 500; font-size: 12px; color: #ffffff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ previewName() }}</span>
                      <span style="font-size: 11px; color: #ada5b4;">{{ previewSizeKB() }} KB</span>
                    </div>
                    <button type="button"
                            style="padding: 4px 8px; border: 1px solid #ef4444; color: #ef4444; background: transparent; border-radius: 4px; cursor: pointer; font-size: 11px; transition: all 0.2s ease; flex-shrink: 0;"
                            (click)="clearSelectedFile(fileInput)">
                      Quitar imagen
                    </button>
                  </div>
                }
              </div>

              @if (selectedFile()) {
                <div class="flex items-center justify-start gap-2 mt-3">
                  <button
                    (click)="uploadPaymentPoint()"
                    [disabled]="isUploading()"
                    class="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 backdrop-blur-md text-green-700 dark:text-green-300 font-medium rounded-xl hover:border-green-500/50 transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                    @if (isUploading()) {
                      <div class="flex items-center gap-2">
                        <div class="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        Subiendo...
                      </div>
                    } @else {
                      <i class="fas fa-check mr-2"></i>
                      Subir punto de pago
                    }
                  </button>
                  <button
                    (click)="cancelUpload()"
                    [disabled]="isUploading()"
                    class="px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 backdrop-blur-md text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:border-gray-500/50 transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                    <i class="fas fa-times mr-2"></i>
                    Cancelar
                  </button>
                </div>
              }
            </div>

            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              @for (point of paymentPointsData.value() ?? []; track point.id ?? $index) {
                <div class="group relative overflow-hidden rounded-xl bg-white/10 dark:bg-slate-700/20 border border-white/20 dark:border-slate-600/30 backdrop-blur-md hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <!-- Image -->
                  <div class="aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img
                      [src]="'data:image/png;base64,' + point.imagen"
                      [alt]="point.nombre"
                      class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      (error)="onImageError($event)"
                    />
                  </div>
                  <!-- Info -->
                  <div class="p-4">
                    <h4 class="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      {{ point.nombre }}
                    </h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                      <i class="fas fa-folder-open mr-1"></i>
                      {{ point.ruta }}
                    </p>
                  </div>
                  <!-- Overlay on hover -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <button
                      (click)="deletePaymentPoint(point)"
                      [disabled]="deletingRuta() === point.ruta"
                      class="px-6 py-2 bg-red-500/30 hover:bg-red-500/50 backdrop-blur-md border border-red-400/50 hover:border-red-400 text-white rounded-lg text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                      @if (deletingRuta() === point.ruta) {
                        <div class="flex items-center gap-2">
                          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Eliminando...
                        </div>
                      } @else {
                        <i class="fas fa-trash-alt mr-2"></i>
                        Eliminar
                      }
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="relative overflow-hidden shadow-2xl sm:rounded-2xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 mb-6">
          <div class="p-6 sm:p-8 text-center">
            <div class="mx-auto w-16 h-16 bg-gray-300/20 dark:bg-gray-700/20 rounded-full flex items-center justify-center mb-4">
              <i class="fas fa-map-marker-alt text-3xl text-gray-400"></i>
            </div>
            <p class="text-gray-600 dark:text-gray-400">
              No hay puntos de pago registrados aún
            </p>
          </div>
        </div>
      }
    </div>

    <!-- Popup de confirmación para eliminar punto de pago -->
    <app-pop-up
      [open]="showDeleteConfirm"
      [isConfirmation]="true"
      title="Eliminar Punto de Pago"
      [message]="getDeleteConfirmMessage()"
      confirmText="Eliminar"
      cancelText="Cancelar"
      (confirmAction)="confirmDeletePaymentPoint()"
      (cancelAction)="cancelDeletePaymentPoint()"
    >
    </app-pop-up>
  `,
})
export class PaymentPoints {
  private readonly documentService = inject(DocumentAzureBlobService);
  private readonly toast = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  isUploading = signal<boolean>(false);
  deletingRuta = signal<string | null>(null);
  showDeleteConfirm = signal<boolean>(false);
  pointToDelete: any = null;

  readonly previewName = computed(() => {
    const file = this.selectedFile();
    return file ? file.name : '';
  });

  readonly previewSizeKB = computed(() => {
    const file = this.selectedFile();
    return file ? Math.round(file.size / 1024) : 0;
  });

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
    return data?.nombre || 'admin';
  });

  getDocumentId(point: any): number | null {
    if (point.id) return point.id;
    if (point.documentoId) return point.documentoId;
    if (point.idDocumento) return point.idDocumento;
    return null;
  }


  paymentPointsData = rxResource({
    params: () => ({
      idEmpresa: this.empresaId(),
    }),
    stream: ({ params }) => {
      if (!params.idEmpresa) {
        return of([]);
      }
      return this.documentService
        .getDocumentByCategoria('PUPA', params.idEmpresa)
        .pipe(
          map((response: any) => {
            if (response && typeof response === 'object' && !Array.isArray(response)) {
              const keys = Object.keys(response);
              for (const key of keys) {
                if (Array.isArray(response[key])) {
                  return response[key];
                }
              }
              return [response];
            }
            return Array.isArray(response) ? response : [];
          }),
          catchError((error) => {
            return of([]);
          })
        );
    },
  });

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toast.error('Error', 'Solo se permiten archivos de imagen');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toast.error('Error', 'La imagen no debe superar 5MB');
      return;
    }

    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview.set(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  uploadPaymentPoint(): void {
    const file = this.selectedFile();
    if (!file) return;

    const empresaId = this.empresaId();
    if (!empresaId) {
      this.toast.error('Error', 'No se encontró el ID de la empresa');
      return;
    }

    const usuario = this.nombreUsuario();
    if (!usuario) {
      this.toast.error('Error', 'No se encontró el usuario');
      return;
    }

    this.isUploading.set(true);

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];

      const document: DocumentUpload = {
        base64File: base64Data,
        idEmpresa: empresaId,
        nombreArchivo: file.name.split('.')[0],
        extension: `.${file.name.split('.').pop()}`,
        usuario: usuario,
        categoriaCodigo: 'PUPA'
      };

      this.documentService.documentIploadUrl(document).subscribe({
        next: (response) => {
          this.toast.success('Éxito', 'Punto de pago subido correctamente');
          this.cancelUpload();
          this.isUploading.set(false);
          this.paymentPointsData.reload();
        },
        error: (error) => {
          this.isUploading.set(false);
        }
      });
    };

    reader.readAsDataURL(file);
  }

  cancelUpload(): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
  }

  clearSelectedFile(fileInput: HTMLInputElement): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    if (fileInput) {
      fileInput.value = '';
    }
  }

  deletePaymentPoint(point: any): void {
    const documentId = this.getDocumentId(point);

    if (!documentId) {
      this.toast.error('Error', 'No se puede eliminar: ID no encontrado en la respuesta del servidor');
      console.error('Estructura del point:', point);
      console.error('No se encontró ningún campo de ID. Verifica la respuesta del backend.');
      return;
    }

    this.pointToDelete = point;
    this.showDeleteConfirm.set(true);
  }

  getDeleteConfirmMessage(): string {
    return this.pointToDelete
      ? `¿Estás seguro de que deseas eliminar el punto de pago "${this.pointToDelete.nombre}"?`
      : '¿Estás seguro de que deseas eliminar este punto de pago?';
  }

  confirmDeletePaymentPoint(): void {
    if (!this.pointToDelete) return;

    const point = this.pointToDelete;
    const documentId = this.getDocumentId(point);

    if (!documentId) {
      this.toast.error('Error', 'ID inválido');
      this.showDeleteConfirm.set(false);
      this.pointToDelete = null;
      return;
    }

    const usuario = this.nombreUsuario();

    this.showDeleteConfirm.set(false);
    this.deletingRuta.set(point.ruta);

    this.documentService.deleteDocument(documentId, usuario).subscribe({
      next: () => {
        this.toast.success('Éxito', 'Punto de pago eliminado correctamente');
        this.deletingRuta.set(null);
        this.pointToDelete = null;
        this.paymentPointsData.reload();
      },
      error: (error) => {
        console.error('Error al eliminar punto de pago:', error);
        this.toast.error('Error', 'No se pudo eliminar el punto de pago');
        this.deletingRuta.set(null);
        this.pointToDelete = null;
      }
    });
  }

  cancelDeletePaymentPoint(): void {
    this.showDeleteConfirm.set(false);
    this.pointToDelete = null;
  }

  onImageError(event: any): void {
    event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError%3C/text%3E%3C/svg%3E';
  }
}
