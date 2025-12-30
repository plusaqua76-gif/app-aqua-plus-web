import {
  Component,
  computed,
  inject,
  PLATFORM_ID,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, of } from 'rxjs';
import { ProductoService } from '../../service/producto.service';
import { SalesService } from '../../service/sales.service';
import { ToastService } from '@services/toast.service';
import { ICreateVenta, IProductoVenta } from '@interfaces/ICreateVenta';
import { InventarioService } from '../../service/inventario.service';
import { ColombianCurrencyPipe } from '@shared/index';

// Interfaz extendida para productos en venta con cálculos
interface IProductoVentaDetalle extends IProductoVenta {
  precioUnitario: number;
  subtotal: number;
  nombre: string;
}

@Component({
  selector: 'app-create-sale',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, ColombianCurrencyPipe],
  template: `
    <!-- Formulario de creación de venta con estilos glassmorphism -->
    <div class="px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header con estilo similar al de la tabla -->
      <div class="mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-200 mb-4">
          Crear Nueva Venta
        </h1>

        <!-- Breadcrumb o botón de regreso -->
        <div class="flex items-center gap-4 mb-6">
          <button
            type="button"
            (click)="goBack()"
            class="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-gray-900 dark:text-white hover:bg-white/20 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a la lista
          </button>
        </div>
      </div>

      <!-- Contenedor principal unificado con estilo glassmorphism -->
      <div class="relative overflow-hidden shadow-2xl sm:rounded-2xl bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/20 dark:border-slate-700/30">
        <div class="p-6 sm:p-8">
          <!-- Formulario unificado -->
          <form [formGroup]="ventaForm">
            <!-- Sección Información del Cliente -->
            <div class="mb-8">
              <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 mb-6">
                Información del Cliente
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Nombre Cliente -->
                <div>
                  <label for="nombreCliente" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                    Nombre del Cliente <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      id="nombreCliente"
                      formControlName="nombreCliente"
                      type="text"
                      placeholder="Nombre del cliente..."
                      class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  @if (ventaForm.get('nombreCliente')?.invalid && ventaForm.get('nombreCliente')?.touched) {
                    <p class="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                      Este campo es requerido
                    </p>
                  }
                </div>

                <!-- Identificación -->
                <div>
                  <label for="identificacion" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                    Identificación <span class="text-red-500">*</span>
                  </label>
                  <div class="relative">
                    <input
                      id="identificacion"
                      formControlName="identificacion"
                      type="text"
                      placeholder="Número de identificación..."
                      class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a1 1 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                    </div>
                  </div>
                  @if (ventaForm.get('identificacion')?.invalid && ventaForm.get('identificacion')?.touched) {
                    <p class="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                      Este campo es requerido
                    </p>
                  }
                </div>
              </div>
            </div>

            <!-- Sección Productos de la Venta -->
            <div class="mb-8">
              <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 mb-6">
                Productos de la Venta
              </h2>

              <!-- Formulario para agregar productos -->
              <div [formGroup]="productoForm" class="mb-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <!-- Selector de Producto -->
                  <div>
                    <label for="idProducto" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                      Producto <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <select
                        id="idProducto"
                        formControlName="idProducto"
                        class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer invalid:text-gray-400 dark:invalid:text-gray-500"
                      >
                        <option value="" disabled>Seleccione un producto</option>
                        @for (producto of serverInventoryData.value()?.response ?? []; track producto.id) {
                          <option [value]="producto.productoId" class="text-gray-900 dark:text-white bg-white dark:bg-gray-700 py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600">
                            {{ producto.nombre }}
                          </option>
                        }
                      </select>
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    </div>
                  </div>

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
                        min="1"
                        placeholder="Cantidad..."
                        class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
                      />
                      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Botón Agregar -->
                  <div class="flex items-end">
                    <button
                      type="button"
                      (click)="agregarProducto()"
                      [disabled]="productoForm.invalid"
                      class="w-full bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 backdrop-blur-md text-green-700 dark:text-green-300 font-semibold py-3 px-6 rounded-xl hover:border-green-500/50 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 active:scale-95 flex items-center gap-3 justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Agregar Producto
                    </button>
                  </div>
                </div>
              </div>

              <!-- Lista de productos agregados -->
              @if (productosVenta().length > 0) {
                <div class="mb-6">
                  <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
                    Productos Agregados ({{ productosVenta().length }})
                  </h3>
                  <div class="overflow-hidden rounded-xl border border-white/20 dark:border-slate-700/30 backdrop-blur-md">
                    <div class="overflow-x-auto">
                      <table class="min-w-full">
                        <thead class="bg-white/10 dark:bg-slate-700/20 backdrop-blur-md">
                          <tr>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              Producto
                            </th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              Cantidad
                            </th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              Precio Unit.
                            </th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              Subtotal
                            </th>
                            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody class="bg-white/5 dark:bg-slate-800/10 backdrop-blur-md divide-y divide-white/10 dark:divide-slate-700/20">
                          @for (producto of productosVenta(); track $index) {
                            <tr class="hover:bg-white/10 dark:hover:bg-slate-700/20 transition-colors duration-200">
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                                {{ producto.nombre }}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                                {{ producto.cantidad }}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">
                                {{  producto.precioUnitario | colombianCurrency }}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                                {{ producto.subtotal | colombianCurrency }}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  type="button"
                                  (click)="eliminarProducto($index)"
                                  class="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 backdrop-blur-md text-red-700 dark:text-red-300 font-medium py-2 px-4 rounded-lg hover:border-red-500/50 transition-all duration-300 ease-in-out hover:scale-105"
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Resumen de la venta -->
                  <div class="mt-6 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm">
                    <h4 class="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-4 tracking-wider uppercase">
                      Resumen de la Venta
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {{ totalCantidad() }}
                        </div>
                        <div class="text-sm text-blue-700 dark:text-blue-300 font-medium">
                          Total Productos
                        </div>
                      </div>
                      <!-- <div class="text-center">
                        <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                            {{ promedioprecioUnitario() | colombianCurrency }}
                        </div>
                        <div class="text-sm text-green-700 dark:text-green-300 font-medium">
                          Precio Unitario
                        </div>
                      </div> -->
                      <div class="text-center">
                        <div class="flex items-center justify-center gap-2 mb-2">
                          <!-- <div class="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
                            </svg>
                          </div> -->
                        </div>
                        <div class="text-3xl font-bold bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
                          {{ totalVenta() | colombianCurrency }}
                        </div>
                        <div class="text-sm text-amber-700 dark:text-amber-300 font-medium">
                          Total de la Venta
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Botones de acción con estilo glassmorphism -->
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10 dark:border-slate-700/30">
              <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>Formulario de registro de venta</span>
              </div>

              <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <!-- Botón Cancelar -->
                <button
                  type="button"
                  (click)="cancelarVenta()"
                  class="w-full sm:w-auto bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 backdrop-blur-md text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl hover:border-gray-500/50 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-gray-500/20 active:scale-95 flex items-center gap-3 justify-center"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar
                </button>

                <!-- Botón Guardar Venta -->
                <button
                  type="button"
                  (click)="guardarVenta()"
                  [disabled]="!puedeGuardar() || guardandoVenta()"
                  class="w-full sm:w-auto bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 backdrop-blur-md text-blue-700 dark:text-blue-300 font-semibold py-3 px-6 rounded-xl hover:border-blue-500/50 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 flex items-center gap-3 justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  @if (guardandoVenta()) {
                    <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar Venta
                  }
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class CreateSale implements OnInit {
  ventaForm!: FormGroup;
  productoForm!: FormGroup;
  productosVenta = signal<IProductoVentaDetalle[]>([]);
  guardandoVenta = signal<boolean>(false);

  protected readonly productoService = inject(ProductoService);
  readonly inventarioService = inject(InventarioService);
  protected readonly salesService = inject(SalesService);
  protected readonly toastService = inject(ToastService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly fb = inject(FormBuilder);
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

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

  readonly enterpriseId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  });

  readonly usuarioCreacion = computed(() => {
    const data = this.userData();
    return data?.nombre || 'admin';
  });

  // Computed para calcular totales
  readonly totalCantidad = computed(() => {
    return this.productosVenta().reduce((total, producto) => total + producto.cantidad, 0);
  });

  readonly totalVenta = computed(() => {
    return this.productosVenta().reduce((total, producto) => total + producto.subtotal, 0);
  });

  readonly promedioprecioUnitario = computed(() => {
    const productos = this.productosVenta();
    if (productos.length === 0) return 0;
    const totalPrecio = productos.reduce((total, producto) => total + producto.precioUnitario, 0);
    return totalPrecio / productos.length;
  });

  serverInventoryData = rxResource({
    params: () => ({
      enterpriseId: this.enterpriseId(),
    }),
    stream: ({ params }) => {
      const { enterpriseId } = params;
      if (!enterpriseId) {
        return EMPTY;
      }
      return this.inventarioService.getAllInventary(
        enterpriseId,
      ).pipe(
        catchError((error) => {
          return of(null);
        })
      );
    },
  });

  ngOnInit(): void {
    this.initializeForms();
  }

  private initializeForms(): void {
    this.ventaForm = this.fb.group({
      nombreCliente: ['', Validators.required],
      identificacion: ['', Validators.required],
    });

    this.productoForm = this.fb.group({
      idProducto: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(1)]],
    });
  }

  agregarProducto(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      this.toastService.error('Error', 'Por favor complete todos los campos del producto');
      return;
    }

    const formData = this.productoForm.value;
    const idProducto = Number(formData.idProducto);
    const cantidad = Number(formData.cantidad);

    // Buscar información del producto en el inventario
    const inventario = this.serverInventoryData.value()?.response;
    if (!inventario) {
      this.toastService.error('Error', 'No se pudo cargar la información del inventario');
      return;
    }

    const productoInventario = inventario.find((item: any) => item.productoId === idProducto);
    if (!productoInventario) {
      this.toastService.error('Error', 'Producto no encontrado en el inventario');
      return;
    }

    // Verificar si el producto ya está agregado
    const productoExistente = this.productosVenta().find(p => p.idProducto === idProducto);
    if (productoExistente) {
      this.toastService.warning('Advertencia', 'Este producto ya está agregado a la venta');
      return;
    }

    // Verificar stock disponible
    if (cantidad > productoInventario.cantidad) {
      this.toastService.error('Error', `Stock insuficiente. Disponible: ${productoInventario.cantidad}`);
      return;
    }

    // Crear producto con detalles calculados
    const nuevoProducto: IProductoVentaDetalle = {
      idProducto: idProducto,
      cantidad: cantidad,
      precioUnitario: productoInventario.precioVenta,
      subtotal: cantidad * productoInventario.precioVenta,
      nombre: productoInventario.nombre,
    };

    this.productosVenta.set([...this.productosVenta(), nuevoProducto]);
    this.productoForm.reset();
    this.toastService.success('Éxito', 'Producto agregado correctamente');
  }

  eliminarProducto(index: number): void {
    const productos = this.productosVenta();
    productos.splice(index, 1);
    this.productosVenta.set([...productos]);
    this.toastService.info('Información', 'Producto eliminado de la venta');
  }

  getProductoNombre(idProducto: number): string {
    const inventario = this.serverInventoryData.value()?.response;
    if (!inventario) return 'Producto no encontrado';

    const producto = inventario.find((item: any) => item.productoId === idProducto);
    return producto ? producto.nombre : 'Producto no encontrado';
  }

  puedeGuardar(): boolean {
    return this.ventaForm.valid && this.productosVenta().length > 0 && !this.guardandoVenta();
  }

  guardarVenta(): void {
    if (!this.puedeGuardar()) {
      this.toastService.error('Error', 'Complete todos los campos y agregue al menos un producto');
      return;
    }

    this.guardandoVenta.set(true);

    const formData = this.ventaForm.value;

    // Convertir productos detallados a formato simple para la API
    const productosParaAPI: IProductoVenta[] = this.productosVenta().map(producto => ({
      idProducto: producto.idProducto,
      cantidad: producto.cantidad,
    }));

    const ventaData: ICreateVenta = {
      idEmpresa: this.enterpriseId()!,
      nombreCliente: formData.nombreCliente,
      identificacion: formData.identificacion,
      usuarioCreacion: this.usuarioCreacion(),
      productos: productosParaAPI,
    };


    this.salesService.createVenta(ventaData).subscribe({
      next: (response) => {
        this.toastService.success('Éxito', 'Venta creada correctamente');
        this.guardandoVenta.set(false);
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (error) => {
        this.toastService.error('Error', 'No se pudo crear la venta');
        this.guardandoVenta.set(false);
      },
    });
  }
  cancelarVenta(): void {
    this.ventaForm.reset();
    this.productoForm.reset();
    this.productosVenta.set([]);
    this.guardandoVenta.set(false);
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
