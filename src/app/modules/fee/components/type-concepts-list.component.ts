import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IrateTypes } from '@interfaces/IrateTypes';

@Component({
  selector: 'app-type-concepts-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3">
      @if (typeConcepts().length === 0) {
        <div class="text-center py-8">
          <p class="text-gray-400 text-sm">No hay tipos de concepto registrados</p>
        </div>
      } @else {
        @for (typeConcept of typeConcepts(); track typeConcept.id) {
          <div class="flex items-center justify-between p-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300">
            <div class="flex-1">
              <h4 class="text-white font-medium text-sm mb-1">{{ typeConcept.nombre }}</h4>
              @if (typeConcept.descripcion) {
                <p class="text-gray-300 text-xs">{{ typeConcept.descripcion }}</p>
              }
              @if (typeConcept.codigo) {
                <span class="inline-block mt-2 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-md">
                  {{ typeConcept.codigo }}
                </span>
              }
            </div>
            <div class="flex gap-2 ml-4">
              <button
                type="button"
                (click)="edit.emit(typeConcept)"
                class="inline-flex items-center justify-center w-8 h-8 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-lg transition-all duration-200"
                title="Editar tipo de concepto">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                type="button"
                (click)="delete.emit(typeConcept)"
                class="inline-flex items-center justify-center w-8 h-8 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition-all duration-200"
                title="Eliminar tipo de concepto">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a2 2 0 012-2h4a2 2 0 012 2m-8 0H5" />
                </svg>
              </button>
            </div>
          </div>
        }
      }
    </div>
  `
})
export class TypeConceptsListComponent {
  typeConcepts = input.required<IrateTypes[]>();
  edit = output<IrateTypes>();
  delete = output<IrateTypes>();
}
