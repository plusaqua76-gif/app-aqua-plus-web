import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-delete-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-[#0c121df7] rounded-2xl shadow-2xl max-w-md w-full">
          <!-- Modal Header -->
          <div class="bg-gradient-to-r from-[#dc262600] to-red-600 px-6 py-4 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <i [class]="headerIcon()"></i>
                {{ headerTitle() }}
              </h3>
              <button
                (click)="onCancel()"
                [disabled]="isSubmitting()"
                class="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="p-6">
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <i [class]="bodyIcon()"></i>
              </div>
              <div class="flex-1">
                <p class="text-gray-800 dark:text-gray-200 font-semibold mb-2">
                  {{ confirmMessage() }}
                </p>
                <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {{ warningMessage() }}
                </p>
                @if (itemName()) {
                  <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p class="text-sm text-gray-700 dark:text-gray-300">
                      <span class="font-semibold">{{ itemLabel() }}:</span> {{ itemName() }}
                    </p>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="bg-gray-50 dark:bg-slate-700/50 px-6 py-4 rounded-b-2xl flex gap-3">
            <button
              (click)="onCancel()"
              [disabled]="isSubmitting()"
              class="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ cancelText() }}
            </button>
            <button
              (click)="onConfirm()"
              [disabled]="isSubmitting()"
              [class]="confirmButtonClass()"
            >
              @if (isSubmitting()) {
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              }
              @if (!isSubmitting()) {
                <i [class]="confirmIcon()"></i>
              }
              <span>{{ isSubmitting() ? loadingText() : confirmText() }}</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDeletePopupComponent {
  // Estado del modal
  readonly isOpen = input.required<boolean>();
  readonly isSubmitting = input<boolean>(false);

  // Textos personalizables
  readonly headerTitle = input<string>('Confirmar Eliminación');
  readonly headerIcon = input<string>('fas fa-exclamation-triangle');
  readonly bodyIcon = input<string>('fas fa-trash-alt text-red-600 dark:text-red-400 text-xl');
  readonly confirmMessage = input<string>('¿Está seguro de eliminar este elemento?');
  readonly warningMessage = input<string>('Esta acción no se puede deshacer.');
  readonly itemLabel = input<string>('Elemento');
  readonly itemName = input<string>('');
  readonly confirmText = input<string>('Eliminar');
  readonly cancelText = input<string>('Cancelar');
  readonly loadingText = input<string>('Eliminando...');
  readonly confirmIcon = input<string>('fas fa-trash-alt');

  // Estilos personalizables
  readonly confirmButtonClass = input<string>(
    'flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
  );

  // Eventos
  readonly confirm = output<void>();
  readonly cancel = output<void>();

  onConfirm(): void {
    if (!this.isSubmitting()) {
      this.confirm.emit();
    }
  }

  onCancel(): void {
    if (!this.isSubmitting()) {
      this.cancel.emit();
    }
  }
}
