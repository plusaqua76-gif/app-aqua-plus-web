import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaces
interface TipoConcept {
  id: number;
  nombre: string;
  tipoTarifaId: number;
}

interface TipoTarifa {
  id: number;
  nombre: string;
}

interface Estrato {
  id: number;
  numero: number;
  valor: number;
}

interface TarifaItem {
  id: number;
  tipoTarifa: string;
  tipoConcepto: string;
  valor: number;
  estratos: Estrato[];
}

@Component({
  selector: 'app-fee',
  imports: [CommonModule, FormsModule],
  template: `

<section class="w-full bg-transparent text-gray-200">
  <div class="mx-auto max-w-7xl px-4 py-8">
    <h2 class="text-2xl md:text-3xl font-semibold tracking-tight mb-8">
      Configuracion de tarifas
    </h2>

    <!-- GRID de 3 columnas en md+ -->
    <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-start">
      <!-- IZQUIERDA: FORM -->
      <div class="space-y-6">
        <!-- Tipo de tarifa -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-300">Tipo de tarifa</label>
          <div class="flex gap-3">
            <div class="relative flex-1">
              <select
                [(ngModel)]="selectedTipoTarifa"
                class="block w-full appearance-none rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 pr-10 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-400/40">
                <option [value]="null" class="bg-gray-900">Seleccione una tarifa</option>
                @for (tarifa of tiposTarifa; track tarifa.id) {
                  <option [value]="tarifa.id" class="bg-gray-900">{{ tarifa.nombre }}</option>
                }
              </select>
              <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg class="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.107l3.71-3.877a.75.75 0 111.08 1.04l-4.24 4.43a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                    clip-rule="evenodd" />
                </svg>
              </span>
            </div>

            <button type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 text-sm text-gray-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-gray-400/40">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" />
              </svg>
              Agregar Tipo
            </button>
          </div>
        </div>

        <!-- Tipo concepto -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-300">Tipo concepto</label>
          <div class="flex gap-3">
            <div class="relative flex-1">
              <select
                [(ngModel)]="selectedTipoConcepto"
                class="block w-full appearance-none rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 pr-10 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-400/40">
                <option [value]="null" class="bg-gray-900">Seleccione un concepto</option>
                @for (concepto of tiposConcepto; track concepto.id) {
                  <option [value]="concepto.id" class="bg-gray-900">{{ concepto.nombre }}</option>
                }
              </select>
              <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg class="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.107l3.71-3.877a.75.75 0 111.08 1.04l-4.24 4.43a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                    clip-rule="evenodd" />
                </svg>
              </span>
            </div>

            <button type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 text-sm text-gray-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-gray-400/40">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" />
              </svg>
              Agregar Concepto
            </button>
          </div>
        </div>

        <!-- Valor tarifa concepto -->
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-300">Valor tarifa concepto</label>
          <input
            type="number"
            [(ngModel)]="valorTarifa"
            placeholder="0"
            class="block w-full rounded-xl border border-gray-600/70 bg-transparent px-4 py-3 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-400/40" />
        </div>

        <!-- Agregar estrato + botón Agregar -->
        <div class="flex flex-wrap items-center gap-3">
          <button 
            type="button"
            (click)="toggleTablaEstratos()"
            class="inline-flex items-center gap-2 rounded-xl border border-gray-600/70 bg-transparent px-5 py-3 text-sm text-gray-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-gray-400/40">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" />
            </svg>
            {{ mostrarTablaEstratos ? 'Ocultar estratos' : 'Agregar estrato' }}
          </button>

          <button
            type="button"
            (click)="agregarTarifa()"
            [disabled]="!canAddTarifa()"
            class="inline-flex items-center justify-center rounded-xl border border-gray-600/70 bg-transparent px-5 py-3 text-sm font-medium text-gray-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-gray-400/40 disabled:opacity-50 disabled:cursor-not-allowed">
            Agregar
          </button>
        </div>

        <!-- Tabla Estratos Editable -->
        @if (mostrarTablaEstratos) {
          <div class="space-y-4">
            <!-- Agregar nuevo estrato -->
            <div class="rounded-xl border border-gray-600/70 bg-transparent p-4">
              <h4 class="text-sm font-medium text-gray-300 mb-3">Agregar nuevo estrato</h4>
              <div class="flex gap-3">
                <div class="flex-1">
                  <label class="block mb-1 text-xs text-gray-400">Número de estrato</label>
                  <input 
                    type="number" 
                    [(ngModel)]="nuevoEstratoNumero"
                    min="1"
                    class="block w-full rounded-lg border border-gray-600/70 bg-transparent px-3 py-2 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-400/40" />
                </div>
                <div class="flex-1">
                  <label class="block mb-1 text-xs text-gray-400">Valor</label>
                  <input 
                    type="number" 
                    [(ngModel)]="nuevoEstratoValor"
                    min="0"
                    placeholder="0"
                    class="block w-full rounded-lg border border-gray-600/70 bg-transparent px-3 py-2 text-sm text-gray-100 placeholder-gray-400 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-400/40" />
                </div>
                <div class="flex items-end">
                  <button 
                    type="button"
                    (click)="agregarNuevoEstrato()"
                    [disabled]="!nuevoEstratoValor || nuevoEstratoValor <= 0"
                    class="inline-flex items-center justify-center rounded-lg border border-gray-600/70 bg-transparent px-3 py-2 text-sm text-gray-200 hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-gray-400/40 disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Tabla de estratos -->
            <div class="overflow-hidden rounded-xl border border-gray-600/70">
              <table class="min-w-full divide-y divide-gray-600/70">
                <thead>
                  <tr>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-200">Estrato</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-200">Valor</th>
                    <th class="px-6 py-3 text-left text-sm font-semibold text-gray-200">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-600/70">
                  @if (estratosActuales.length === 0) {
                    <tr>
                      <td colspan="3" class="px-6 py-4 text-sm text-gray-400 text-center">No hay estratos configurados</td>
                    </tr>
                  } @else {
                    @for (estrato of estratosActuales; track estrato.id) {
                      <tr>
                        <td class="px-6 py-4 text-sm">{{ estrato.numero }}</td>
                        <td class="px-6 py-4 text-sm">
                          <input 
                            type="number" 
                            [value]="estrato.valor"
                            (input)="actualizarEstratoValor(estrato.id, +$any($event.target).value)"
                            min="0"
                            class="block w-full rounded border border-gray-600/70 bg-transparent px-2 py-1 text-sm text-gray-100 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-400/40" />
                        </td>
                        <td class="px-6 py-4 text-sm">
                          <button 
                            type="button"
                            (click)="eliminarEstrato(estrato.id)"
                            class="inline-flex items-center justify-center rounded border border-red-600/70 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 focus:outline-none focus:ring-1 focus:ring-red-500/40">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>

      <!-- CENTRO: Separador -->
      <div class="hidden md:block">
        <div class="w-px h-full bg-gray-400/50 mx-auto rounded"></div>
      </div>

      <!-- DERECHA: INFORMACIÓN SELECCIONADA -->
      <div class="flex flex-col gap-8">
        <!-- Lista de tarifas agregadas -->
        @if (tarifasAgregadas.length === 0) {
          <div class="rounded-xl border border-gray-600/70 bg-transparent p-8 text-center">
            <p class="text-gray-400">No hay tarifas agregadas</p>
          </div>
        } @else {
          @for (tarifa of tarifasAgregadas; track tarifa.id) {
            <div class="rounded-xl border border-gray-600/70 bg-transparent p-5">
              <div class="grid grid-cols-12 items-center gap-4">
                <!-- Cabeceras -->
                <div class="col-span-12 grid grid-cols-12 text-xs text-gray-400">
                  <span class="col-span-3">Tipo de tarifa</span>
                  <span class="col-span-3">Tipo concepto</span>
                  <span class="col-span-3">Valor tarifa concepto</span>
                  <span class="col-span-1">Estratos</span>
                  <span class="col-span-2"></span>
                </div>
                <!-- Valores -->
                <div class="col-span-12 grid grid-cols-12 items-center">
                  <div class="col-span-3">
                    <span class="text-lg font-semibold">{{ tarifa.tipoTarifa }}</span>
                  </div>
                  <div class="col-span-3">
                    <span class="text-lg font-semibold">{{ tarifa.tipoConcepto }}</span>
                  </div>
                  <div class="col-span-3">
                    <span class="text-lg font-bold">$ {{ tarifa.valor | number:'1.0-0' }}</span>
                  </div>
                  <div class="col-span-1">
                    <span class="text-sm text-gray-300">{{ tarifa.estratos.length }}</span>
                  </div>
                  <div class="col-span-2 flex justify-end">
                    <button
                      type="button"
                      (click)="eliminarTarifa(tarifa.id)"
                      class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-600/70 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                      aria-label="Eliminar">
                      <svg class="h-4 w-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a2 2 0 012-2h4a2 2 0 012 2m-8 0H5" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <!-- Estratos (si existen) -->
                @if (tarifa.estratos && tarifa.estratos.length > 0) {
                  <div class="col-span-12 mt-4 pt-4 border-t border-gray-600/50">
                    <div class="mb-2">
                      <span class="text-xs text-gray-400">Estratos configurados:</span>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      @for (estrato of tarifa.estratos; track estrato.id) {
                        <div class="flex items-center justify-between rounded border border-gray-600/50 px-2 py-1 text-xs">
                          <span class="text-gray-300">Estrato {{ estrato.numero }}</span>
                          <span class="font-medium text-gray-200">$ {{ estrato.valor | number:'1.0-0' }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        }

        <!-- Botón Guardar -->
        <div class="mt-auto">
          <div class="flex md:justify-end">
            <button
              type="button"
              (click)="guardarTarifas()"
              [disabled]="tarifasAgregadas.length === 0"
              class="inline-flex w-full md:w-auto items-center justify-center rounded-2xl border border-gray-600/70 bg-transparent px-8 py-3 text-sm font-medium text-gray-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-gray-400/40 disabled:opacity-50 disabled:cursor-not-allowed">
              Guardar ({{ tarifasAgregadas.length }})
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>




  `,
})
export class FeeComponent {
  // Propiedades del formulario
  selectedTipoTarifa: any = null;
  selectedTipoConcepto: any = null;
  valorTarifa: number | null = null;

  // Propiedades para estratos
  mostrarTablaEstratos: boolean = false;
  estratosActuales: Estrato[] = [];
  nuevoEstratoNumero: number = 1;
  nuevoEstratoValor: number | null = null;

  // Arrays para almacenar las tarifas agregadas
  tarifasAgregadas: TarifaItem[] = [];

  // Mock data para tipos de tarifa
  tiposTarifa: TipoTarifa[] = [
    { id: 1, nombre: 'Aseo' },
    { id: 2, nombre: 'Alumbrado' },
    { id: 3, nombre: 'Acueducto' },
    { id: 4, nombre: 'Alcantarillado' }
  ];

  // Mock data para tipos de concepto (simplificados)
  tiposConcepto: TipoConcept[] = [
    { id: 1, nombre: 'Calles', tipoTarifaId: 1 },
    { id: 2, nombre: 'Parques', tipoTarifaId: 1 },
    { id: 3, nombre: 'Plazas', tipoTarifaId: 1 },
    { id: 4, nombre: 'Mercados', tipoTarifaId: 1 },
    { id: 5, nombre: 'Vías principales', tipoTarifaId: 2 },
    { id: 6, nombre: 'Vías secundarias', tipoTarifaId: 2 },
    { id: 7, nombre: 'Zonas deportivas', tipoTarifaId: 2 },
    { id: 8, nombre: 'Consumo básico', tipoTarifaId: 3 },
    { id: 9, nombre: 'Consumo complementario', tipoTarifaId: 3 },
    { id: 10, nombre: 'Residencial', tipoTarifaId: 4 },
    { id: 11, nombre: 'Comercial', tipoTarifaId: 4 },
    { id: 12, nombre: 'Industrial', tipoTarifaId: 4 }
  ];

  // Contador para IDs únicos
  private nextId = 1;

  // Verificar si se puede agregar una tarifa
  canAddTarifa(): boolean {
    const canAdd = !!(
      this.selectedTipoTarifa &&
      this.selectedTipoConcepto &&
      this.valorTarifa !== null &&
      this.valorTarifa > 0
    );

    console.log('canAddTarifa:', {
      selectedTipoTarifa: this.selectedTipoTarifa,
      selectedTipoConcepto: this.selectedTipoConcepto,
      valorTarifa: this.valorTarifa,
      canAdd
    });

    return canAdd;
  }  // Agregar una nueva tarifa
  agregarTarifa(): void {
    if (!this.canAddTarifa()) {
      return;
    }

    // Convertir a número si es string
    const tipoTarifaId = typeof this.selectedTipoTarifa === 'string' ?
      parseInt(this.selectedTipoTarifa) : this.selectedTipoTarifa;
    const tipoConceptoId = typeof this.selectedTipoConcepto === 'string' ?
      parseInt(this.selectedTipoConcepto) : this.selectedTipoConcepto;

    const tipoTarifaNombre = this.tiposTarifa.find(t => t.id === tipoTarifaId)?.nombre || '';
    const tipoConceptoNombre = this.tiposConcepto.find(c => c.id === tipoConceptoId)?.nombre || '';

    console.log('Datos para agregar:', {
      selectedTipoTarifa: this.selectedTipoTarifa,
      selectedTipoConcepto: this.selectedTipoConcepto,
      tipoTarifaId,
      tipoConceptoId,
      tipoTarifaNombre,
      tipoConceptoNombre,
      valorTarifa: this.valorTarifa
    });

    const nuevaTarifa: TarifaItem = {
      id: this.nextId++,
      tipoTarifa: tipoTarifaNombre,
      tipoConcepto: tipoConceptoNombre,
      valor: this.valorTarifa!,
      estratos: [...this.estratosActuales]
    };

    this.tarifasAgregadas.push(nuevaTarifa);

    console.log('Tarifa agregada:', nuevaTarifa);
    console.log('Lista completa:', this.tarifasAgregadas);

    // Limpiar el formulario
    this.limpiarFormulario();
  }

  // Eliminar una tarifa específica
  eliminarTarifa(id: number): void {
    this.tarifasAgregadas = this.tarifasAgregadas.filter(tarifa => tarifa.id !== id);
  }

  // Limpiar el formulario
  private limpiarFormulario(): void {
    this.selectedTipoTarifa = null;
    this.selectedTipoConcepto = null;
    this.valorTarifa = null;
    this.estratosActuales = [];
    this.mostrarTablaEstratos = false;
  }

  // Métodos para manejo de estratos
  toggleTablaEstratos(): void {
    this.mostrarTablaEstratos = !this.mostrarTablaEstratos;
    if (this.mostrarTablaEstratos && this.estratosActuales.length === 0) {
      // Inicializar con 3 estratos por defecto
      this.estratosActuales = [
        { id: 1, numero: 1, valor: 1000 },
        { id: 2, numero: 2, valor: 2000 },
        { id: 3, numero: 3, valor: 3000 }
      ];
    }
  }

  agregarNuevoEstrato(): void {
    if (this.nuevoEstratoValor !== null && this.nuevoEstratoValor > 0) {
      const maxId = this.estratosActuales.length > 0 ? 
        Math.max(...this.estratosActuales.map(e => e.id)) : 0;
      
      const nuevoEstrato: Estrato = {
        id: maxId + 1,
        numero: this.nuevoEstratoNumero,
        valor: this.nuevoEstratoValor
      };

      this.estratosActuales.push(nuevoEstrato);
      this.estratosActuales.sort((a, b) => a.numero - b.numero);
      
      // Limpiar campos
      this.nuevoEstratoNumero = Math.max(...this.estratosActuales.map(e => e.numero)) + 1;
      this.nuevoEstratoValor = null;
    }
  }

  eliminarEstrato(id: number): void {
    this.estratosActuales = this.estratosActuales.filter(estrato => estrato.id !== id);
  }

  actualizarEstratoValor(estratoId: number, nuevoValor: number): void {
    const estrato = this.estratosActuales.find(e => e.id === estratoId);
    if (estrato) {
      estrato.valor = nuevoValor;
    }
  }

  // Guardar todas las tarifas
  guardarTarifas(): void {
    if (this.tarifasAgregadas.length === 0) {
      return;
    }

    console.log('Guardando tarifas:', this.tarifasAgregadas);

    // Aquí podrías hacer la llamada al servicio para guardar en el backend
    // this.tarifaService.guardarTarifas(this.tarifasAgregadas).subscribe(...)

    alert(`Se han guardado ${this.tarifasAgregadas.length} tarifa(s) exitosamente`);

    // Opcional: limpiar las tarifas después de guardar
    // this.tarifasAgregadas = [];
  }
}
