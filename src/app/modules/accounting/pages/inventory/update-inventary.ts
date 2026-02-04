import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventarioService } from '../../service/inventario.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, of } from 'rxjs';
import { ProductCategoryService } from '../../service/product-category.service';
import { IProducto, ICategoria, IInventario } from '@interfaces/Iaccounting';
import { ProductoService } from '../../service/producto.service';
import { ToastService } from '@services/toast.service';

// Interfaz extendida para el inventario con estructura anidada del API
interface IInventarioDetallado {
  id: number;
  producto: {
    id: number;
    empresa: {
      id: number;
      usuario: any;
      direccion: any;
      nombre: string;
      nit: string;
      codigo: string;
      activo: boolean;
      usuarioCreacion: string;
      fechaCreacion: string;
      usuarioModificacion: string;
      fechaModificacion: string;
    };
    categoria: {
      id: number;
      nombre: string;
      descripcion: string;
      activo: boolean;
      usuarioCreacion: string;
      fechaCreacion: string;
    };
    codigo: string;
    nombre: string;
    descripcion: string;
    activo: boolean;
    usuarioCreacion: string;
    fechaCreacion: string;
  };
  cantidad: number;
  precioUnitario: number;
  precioVenta: number;
  porcentaje: number;
  descripcion: string;
  activo: boolean;
  usuarioCreacion: string;
  fechaCreacion: string;
  usuarioModificacion: string | null;
  fechaModificacion: string | null;
}

@Component({
  selector: 'app-update-inventary',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  styles: [`
    .animate-fadeIn {
      animation: fadeIn 1.4s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Estilos para los inputs de número */
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      opacity: 1;
    }
  `],
  template: `
    <!-- Formulario de actualización de inventario con estilos glassmorphism -->
    <div class="px-4 sm:px-6 lg:px-8 py-6 animate-fadeIn">
      <!-- Header con estilo glassmorphism -->
      <div class="mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-200 mb-4">
          Actualizar Inventario
        </h1>

        <!-- Botón de regreso -->
        <div class="flex items-center gap-4 mb-6">
          <button
            type="button"
            (click)="goBack()"
            class="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-gray-900 dark:text-white hover:bg-white/20 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Volver al inventario
          </button>
        </div>
      </div>

      <!-- Contenedor principal con glassmorphism -->
      <div class="relative overflow-hidden shadow-2xl sm:rounded-2xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/20 dark:border-slate-700/30">
        <div class="p-6 sm:p-8">
          @if (isLoading()) {
            <!-- Estado de carga -->
            <div class="flex flex-col items-center justify-center py-16">
              <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
              <p class="mt-4 text-gray-600 dark:text-gray-300 font-medium">Cargando datos del inventario...</p>
            </div>
          } @else if (loadError()) {
            <!-- Estado de error -->
            <div class="flex flex-col items-center justify-center py-16">
              <svg class="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-red-500 font-medium">{{ loadError() }}</p>
              <button
                type="button"
                (click)="goBack()"
                class="mt-4 px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 backdrop-blur-md text-blue-700 dark:text-blue-300 rounded-xl transition-all duration-300"
              >
                Volver al listado
              </button>
            </div>
          } @else {
            <!-- Formulario de actualización -->
            <form [formGroup]="inventoryForm" (ngSubmit)="updateInventory()">

              <!-- Información del Producto (Solo lectura) -->
              <div class="mb-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
                <h2 class="text-xl font-bold text-blue-700 dark:text-blue-300 mb-6 tracking-wider uppercase flex items-center gap-2">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Información del Producto
                </h2>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <!-- Código -->
                  <div>
                    <label class="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 tracking-wider uppercase">
                      Código
                    </label>
                    <div class="px-4 py-3 bg-white/20 dark:bg-slate-700/30 border border-blue-500/20 rounded-xl text-gray-900 dark:text-white backdrop-blur-md">
                      {{ currentInventory()?.producto?.codigo || '' }}
                    </div>
                  </div>

                  <!-- Nombre -->
                  <div>
                    <label class="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 tracking-wider uppercase">
                      Producto
                    </label>
                    <div class="px-4 py-3 bg-white/20 dark:bg-slate-700/30 border border-blue-500/20 rounded-xl text-gray-900 dark:text-white backdrop-blur-md">
                      {{ currentInventory()?.producto?.nombre || '' }}
                    </div>
                  </div>

                  <!-- Categoría -->
                  <div>
                    <label class="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 tracking-wider uppercase">
                      Categoría
                    </label>
                    <div class="px-4 py-3 bg-white/20 dark:bg-slate-700/30 border border-blue-500/20 rounded-xl text-gray-900 dark:text-white backdrop-blur-md">
                      {{ currentInventory()?.producto?.categoria?.nombre || '' }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Campos Editables del Inventario -->
              <div class="mb-8">
                <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 mb-6 tracking-wider uppercase flex items-center gap-2">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Datos del Inventario
                </h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <!-- Cantidad -->
                  <div>
                    <label for="cantidad" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                      Cantidad <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <input
                        id="cantidad"
                        formControlName="cantidad"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Ej: 100"
                        class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                      />
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                      </div>
                    </div>
                    @if (inventoryForm.get('cantidad')?.invalid && inventoryForm.get('cantidad')?.touched) {
                      <p class="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        La cantidad debe ser mayor o igual a 0
                      </p>
                    }
                  </div>

                  <!-- Precio Unitario -->
                  <div>
                    <label for="precioUnitario" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                      Precio Unitario <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 font-medium">$</span>
                      <input
                        id="precioUnitario"
                        formControlName="precioUnitario"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="5000.00"
                        class="w-full pl-8 pr-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                      />
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    @if (inventoryForm.get('precioUnitario')?.invalid && inventoryForm.get('precioUnitario')?.touched) {
                      <p class="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        El precio debe ser mayor o igual a 0
                      </p>
                    }
                  </div>

                  <!-- Porcentaje -->
                  <div>
                    <label for="porcentaje" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                      Porcentaje de Ganancia <span class="text-red-500">*</span>
                      @if (inventoryForm.get('precioUnitario')?.value && inventoryForm.get('porcentaje')?.value) {
                        <span class="text-xs text-blue-600 dark:text-blue-400 ml-2 font-normal">
                          (Ganancia: {{ (inventoryForm.get('precioUnitario')?.value * inventoryForm.get('porcentaje')?.value / 100).toFixed(2) }})
                        </span>
                      }
                    </label>
                    <div class="relative">
                      <input
                        id="porcentaje"
                        formControlName="porcentaje"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="40.00"
                        class="w-full px-4 pr-8 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                      />
                      <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 font-medium">%</span>
                    </div>
                    @if (inventoryForm.get('porcentaje')?.invalid && inventoryForm.get('porcentaje')?.touched) {
                      <p class="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        El porcentaje debe estar entre 0 y 100
                      </p>
                    }
                  </div>

                  <!-- Precio Venta (Calculado) -->
                  <div>
                    <label for="precioVenta" class="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                      Precio Venta <span class="text-red-500">*</span>
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30">
                        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Automático
                      </span>
                    </label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 font-medium">$</span>
                      <input
                        id="precioVenta"
                        formControlName="precioVenta"
                        type="number"
                        readonly
                        class="w-full pl-8 pr-4 py-3 bg-green-500/10 dark:bg-green-900/20 border border-green-500/30 rounded-xl text-gray-900 dark:text-white backdrop-blur-md cursor-not-allowed font-semibold"
                      />
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <p class="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                      </svg>
                      Se calcula automáticamente: Precio Unitario + (Precio Unitario × Porcentaje ÷ 100)
                    </p>
                  </div>
                </div>

                <!-- Descripción -->
                <div class="mt-6">
                  <label for="descripcion" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                    Descripción
                  </label>
                  <textarea
                    id="descripcion"
                    formControlName="descripcion"
                    rows="4"
                    placeholder="Descripción adicional del inventario..."
                    class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 resize-none"
                  ></textarea>
                </div>
              </div>

              <!-- Resumen de Cambios -->
              @if (hasChanges()) {
                <div class="mb-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl backdrop-blur-sm">
                  <h3 class="text-lg font-semibold text-yellow-700 dark:text-yellow-300 mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                    Cambios Pendientes
                  </h3>
                  <p class="text-sm text-yellow-700 dark:text-yellow-300">
                    Has realizado modificaciones en el inventario. Revisa los datos antes de guardar.
                  </p>
                </div>
              }

              <!-- Botones de acción -->
              <div class="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-white/10 dark:border-slate-700/30">
                <button
                  type="button"
                  (click)="goBack()"
                  class="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 dark:border-slate-400/30 backdrop-blur-md text-gray-900 dark:text-white font-semibold rounded-xl hover:border-white/40 transform transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 flex items-center gap-3 justify-center"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar
                </button>

                <button
                  type="submit"
                  [disabled]="!inventoryForm.valid || !hasChanges() || isSaving()"
                  class="px-8 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 backdrop-blur-md text-blue-700 dark:text-blue-300 font-semibold rounded-xl hover:border-blue-500/50 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 flex items-center gap-3 justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                  @if (isSaving()) {
                    <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Actualizando...
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Actualizar Inventario
                  }
                </button>
              </div>
            </form>
          }
        </div>
      </div>
    </div>
  `
})
export class UpdateInventary implements OnInit {
  private readonly inventarioService = inject(InventarioService);
  private readonly productoService = inject(ProductoService);
  private readonly categoryService = inject(ProductCategoryService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  // Signals para manejo de estado
  currentInventory = signal<IInventarioDetallado | null>(null);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  loadError = signal<string | null>(null);
  inventoryId = signal<number | null>(null);

  // Signal para forzar actualización cuando cambia el formulario
  private formChangesTrigger = signal<number>(0);

  // Formulario reactivo
  inventoryForm: FormGroup;

  // Signal para detectar cambios
  hasChanges = computed(() => {
    // Forzar re-evaluación cuando cambia el formulario
    this.formChangesTrigger();

    if (!this.currentInventory() || !this.inventoryForm) return false;

    const formValue = this.inventoryForm.value;
    const current = this.currentInventory();

    if (!current) return false;

    // Normalizar descripción (convertir null/undefined a string vacío)
    const formDescripcion = (formValue.descripcion || '').trim();
    const currentDescripcion = (current.descripcion || '').trim();

    // Comparar valores numéricos con conversión explícita
    const cantidadChanged = Number(formValue.cantidad) !== Number(current.cantidad);
    const precioUnitarioChanged = Number(formValue.precioUnitario) !== Number(current.precioUnitario);
    const porcentajeChanged = Number(formValue.porcentaje) !== Number(current.porcentaje);
    const descripcionChanged = formDescripcion !== currentDescripcion;

    return cantidadChanged || precioUnitarioChanged || porcentajeChanged || descripcionChanged;
  });  constructor() {
    // Inicializar el formulario
    this.inventoryForm = this.fb.group({
      cantidad: [0, [Validators.required, Validators.min(0)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      precioVenta: [{ value: 0, disabled: true }, [Validators.min(0)]],
      porcentaje: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      descripcion: ['']
    });

    // Configurar cálculo automático del precio de venta
    this.setupAutomaticCalculation();
  }

  ngOnInit(): void {
    // Obtener el ID desde la ruta
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.inventoryId.set(+id);
        this.loadInventoryData(+id);
      } else {
        this.loadError.set('ID de inventario no proporcionado');
        this.isLoading.set(false);
      }
    });
  }

  private loadInventoryData(id: number): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.inventarioService.getInventoryById(id).subscribe({
      next: (response) => {
        if (response.success && response.response) {
          // Cast del response al tipo detallado
          const detailedInventory = response.response as any as IInventarioDetallado;
          this.currentInventory.set(detailedInventory);
          this.populateForm(detailedInventory);
          this.isLoading.set(false);
        } else {
          this.loadError.set('No se pudo cargar el inventario');
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        console.error('Error al cargar inventario:', error);
        this.loadError.set('Error al cargar los datos del inventario');
        this.isLoading.set(false);
        this.toast.error('error', 'Error al cargar el inventario');
      }
    });
  }

  private populateForm(inventory: IInventarioDetallado): void {
    this.inventoryForm.patchValue({
      cantidad: inventory.cantidad,
      precioUnitario: inventory.precioUnitario,
      precioVenta: inventory.precioVenta,
      porcentaje: inventory.porcentaje,
      descripcion: inventory.descripcion || ''
    }, { emitEvent: false });

    // Calcular precio de venta inicial
    this.calculatePrecioVenta();
  }

  private setupAutomaticCalculation(): void {
    // Escuchar cambios en precio unitario
    this.inventoryForm.get('precioUnitario')?.valueChanges.subscribe(() => {
      this.calculatePrecioVenta();
      this.formChangesTrigger.update(v => v + 1); // Trigger para hasChanges
    });

    // Escuchar cambios en porcentaje
    this.inventoryForm.get('porcentaje')?.valueChanges.subscribe(() => {
      this.calculatePrecioVenta();
      this.formChangesTrigger.update(v => v + 1); // Trigger para hasChanges
    });

    // Escuchar cambios en cantidad
    this.inventoryForm.get('cantidad')?.valueChanges.subscribe(() => {
      this.formChangesTrigger.update(v => v + 1); // Trigger para hasChanges
    });

    // Escuchar cambios en descripción
    this.inventoryForm.get('descripcion')?.valueChanges.subscribe(() => {
      this.formChangesTrigger.update(v => v + 1); // Trigger para hasChanges
    });
  }

  private calculatePrecioVenta(): void {
    const precioUnitario = this.inventoryForm.get('precioUnitario')?.value || 0;
    const porcentaje = this.inventoryForm.get('porcentaje')?.value || 0;

    if (precioUnitario > 0 && porcentaje >= 0) {
      const precioVenta = precioUnitario + (precioUnitario * (porcentaje / 100));

      // Actualizar el valor sin disparar eventos
      this.inventoryForm.get('precioVenta')?.setValue(
        Math.round(precioVenta * 100) / 100,
        { emitEvent: false }
      );
    } else if (precioUnitario > 0 && porcentaje === 0) {
      this.inventoryForm.get('precioVenta')?.setValue(
        Math.round(precioUnitario * 100) / 100,
        { emitEvent: false }
      );
    }
  }

  updateInventory(): void {
    if (!this.inventoryForm.valid || !this.currentInventory() || this.isSaving()) {
      console.warn('⚠️ No se puede actualizar:', {
        formValid: this.inventoryForm.valid,
        hasInventory: !!this.currentInventory(),
        isSaving: this.isSaving()
      });
      return;
    }

    this.isSaving.set(true);
    const formValue = this.inventoryForm.getRawValue();
    const current = this.currentInventory()!;


    // Validar que tenemos el ID
    if (!current.id) {
      this.isSaving.set(false);
      return;
    }

    // Construir el payload para actualización
    // DEBE incluir empresa y categoría en el producto
    // NO incluir usuarioModificacion (el backend lo calcula automáticamente)
    // IMPORTANTE: Usar Object.assign para forzar que el id se incluya
    const inventoryData = Object.assign({}, {
      id: current.id, // ← CRÍTICO: Forzar inclusión del ID
      producto: {
        id: current.producto.id,
        empresa: {
          id: current.producto.empresa.id
        },
        categoria: {
          id: current.producto.categoria.id
        }
      },
      cantidad: Number(formValue.cantidad),
      precioUnitario: Number(formValue.precioUnitario),
      precioVenta: Number(formValue.precioVenta),
      porcentaje: Number(formValue.porcentaje),
      descripcion: (formValue.descripcion || '').trim(),
      activo: current.activo !== undefined ? current.activo : true,
      usuarioCreacion: current.usuarioCreacion || 'sistema',
      fechaCreacion: new Date(current.fechaCreacion).toISOString(), // ← CRÍTICO: Normalizar formato de fecha
      usuarioModificacion: this.getUserName(), // ← CRÍTICO: Usuario modificador
      fechaModificacion: new Date().toISOString() // ← CRÍTICO: Fecha modificación
    });

    // Usar el mismo método createInventary (POST) que funciona para crear y actualizar
    this.inventarioService.createInventary(inventoryData).subscribe({
      next: (response) => {
        this.isSaving.set(false);
        this.toast.success('success', 'Inventario actualizado exitosamente');
        this.goBack();
      },
      error: (error) => {
        this.isSaving.set(false);
      }
    });
  }

  private getUserName(): string {
    if (!this.isBrowser) return 'sistema';

    try {
      const userData = sessionStorage.getItem('userData');
      if (!userData) return 'sistema';

      const parsedUserData = JSON.parse(userData);
      return parsedUserData.username || parsedUserData.usuario || 'sistema';
    } catch {
      return 'sistema';
    }
  }

  goBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
