import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IUse } from '@interfaces/IUse';

@Component({
  selector: 'app-use-types-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      @if (useTypes.length === 0) {
        <div class="text-center py-8">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-600/20 mb-4">
            <svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-300 mb-2">No hay tipos de uso</h3>
          <p class="text-sm text-gray-400">Aún no se han creado tipos de uso en el sistema.</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (useType of useTypes; track useType.id) {
            <div class="rounded-xl border border-gray-600/70 bg-transparent p-4 hover:bg-white/5 transition-colors duration-200">
              <!-- Header con información principal -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-purple-600/20 text-purple-400 text-xs font-medium">
                      {{ useType.codigo || (useType.nombre && useType.nombre.substring(0, 2).toUpperCase()) }}
                    </span>
                    <h4 class="text-lg font-semibold text-gray-200">{{ useType.nombre }}</h4>
                  </div>

                  @if (useType.descripcion) {
                    <p class="text-sm text-gray-400 ml-11">{{ useType.descripcion }}</p>
                  }
                </div>

                <!-- Botones de acción -->
                <div class="flex items-center gap-2 ml-4">
                  <button
                    type="button"
                    (click)="onEdit(useType)"
                    class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-blue-600/50 text-blue-400 hover:bg-blue-600/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors duration-200"
                    title="Editar tipo de uso">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    (click)="onDelete(useType)"
                    class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-red-600/50 text-red-400 hover:bg-red-600/10 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-colors duration-200"
                    title="Eliminar tipo de uso">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class UseTypesListComponent {
  @Input() useTypes: IUse[] = [];
  @Output() edit = new EventEmitter<IUse>();
  @Output() delete = new EventEmitter<IUse>();

  onEdit(useType: IUse): void {
    this.edit.emit(useType);
  }

  onDelete(useType: IUse): void {
    this.delete.emit(useType);
  }
}
