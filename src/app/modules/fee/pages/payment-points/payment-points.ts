import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DocumentAzureBlobService } from '../../services/document-azure-blob.service';
import { ToastService } from '@services/toast.service';
import { DocumentUpload } from '@interfaces/document-azure-blob/document';

@Component({
  selector: 'app-payment-points',
  imports: [
    CommonModule
  ],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Puntos de Pago
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Sube y gestiona las imágenes de tus puntos de pago
        </p>
      </div>

      <!-- Upload Section -->
      <div class="relative overflow-hidden shadow-2xl sm:rounded-2xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 mb-6">
        <div class="p-6 sm:p-8">
          <div class="text-center space-y-6">
            <!-- Upload Icon -->
            <div class="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
              <i class="fas fa-map-marker-alt text-3xl text-blue-600 dark:text-blue-400"></i>
            </div>

            <!-- Preview de la imagen -->
            @if (imagePreview()) {
              <div class="relative inline-block">
                <img
                  [src]="imagePreview()!"
                  alt="Preview"
                  class="max-w-md max-h-64 rounded-xl border-4 border-white/20 dark:border-slate-600/30 shadow-xl object-contain"
                />
              </div>
            }

            <!-- Upload Button -->
            <div>
              <button
                (click)="fileInput.click()"
                [disabled]="isUploading()"
                class="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 backdrop-blur-md text-blue-700 dark:text-blue-300 font-medium rounded-xl hover:border-blue-500/50 transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                <i class="fas fa-upload mr-2"></i>
                Seleccionar imagen
              </button>
              <input
                #fileInput
                type="file"
                accept="image/*"
                (change)="onImageSelected($event)"
                class="hidden"
              />
            </div>

            <!-- Action Buttons -->
            @if (selectedFile()) {
              <div class="flex items-center justify-center gap-2">
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

            @if (!selectedFile()) {
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Formatos permitidos: JPG, PNG, GIF (máx. 5MB)
              </p>
            }
          </div>
        </div>
      </div>

      <!-- Info Section -->
      <div class="relative overflow-hidden shadow-2xl sm:rounded-2xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/20 dark:border-slate-700/30">
        <div class="p-6 sm:p-8">
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Información
          </h3>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="p-4 bg-white/10 dark:bg-slate-700/20 rounded-xl border border-white/20 dark:border-slate-600/30 backdrop-blur-md">
              <div class="flex items-center gap-3">
                <i class="fas fa-plus-circle text-green-500"></i>
                <span class="text-sm text-gray-700 dark:text-gray-300">Agregar puntos de pago</span>
              </div>
            </div>
            <div class="p-4 bg-white/10 dark:bg-slate-700/20 rounded-xl border border-white/20 dark:border-slate-600/30 backdrop-blur-md">
              <div class="flex items-center gap-3">
                <i class="fas fa-image text-blue-500"></i>
                <span class="text-sm text-gray-700 dark:text-gray-300">Subir imágenes</span>
              </div>
            </div>
            <div class="p-4 bg-white/10 dark:bg-slate-700/20 rounded-xl border border-white/20 dark:border-slate-600/30 backdrop-blur-md">
              <div class="flex items-center gap-3">
                <i class="fas fa-map text-purple-500"></i>
                <span class="text-sm text-gray-700 dark:text-gray-300">Visualización de la empresa</span>
              </div>
            </div>
            <div class="p-4 bg-white/10 dark:bg-slate-700/20 rounded-xl border border-white/20 dark:border-slate-600/30 backdrop-blur-md">
              <div class="flex items-center gap-3">
                <i class="fas fa-clock text-orange-500"></i>
                <span class="text-sm text-gray-700 dark:text-gray-300">Horarios de atención</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
        },
        error: (error) => {
          console.error('Error al subir punto de pago:', error);
          this.toast.error('Error', 'No se pudo subir el punto de pago');
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
}
