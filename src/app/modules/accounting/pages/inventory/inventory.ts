import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import {RouterModule, Router, ActivatedRoute } from '@angular/router';
import {  TableComponent } from '@components/table';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventarioService } from '../../service/inventario.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';
import { EMPTY, catchError, of } from 'rxjs';
import { ProductCategoryService } from '../../service/product-category.service';
import { PopupComponent } from '../../../../shared/components/popUp';
import { IProducto, ICategoria } from '@interfaces/Iaccounting';
import { ProductoService } from '../../service/producto.service';
import { ToastService } from '@services/toast.service';
import { Sale } from '../sales/sale';
import { Account } from '../accounts/account';

@Component({
  selector: 'app-inventory-company',
  imports: [CommonModule, RouterModule, TableComponent, FormsModule, ReactiveFormsModule, PopupComponent, Sale, Account],
  styles: [`
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }

    .animate-fadeIn {
      animation: fadeIn 0.4s ease-in-out;
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
  `],
  template: `
    <ng-template #actionsTemplate let-row>
      <div class="flex items-center space-x-2">
        <button
          type="button"
          (click)="handleTableAction({ action: 'edit', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-blue-600/50 text-blue-400 hover:bg-blue-600/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors duration-200 cursor-pointer"
          title="Editar inventario"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          type="button"
          (click)="handleTableAction({ action: 'view', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-green-600/50 text-green-500 hover:bg-green-600/10 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-colors duration-200 cursor-pointer"
          title="Ver detalles"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      </div>
    </ng-template>

    <!-- Sistema de Navegación por Tabs -->
    <div class="px-4 sm:px-6 lg:px-8 py-6">


      <!-- Tabs Navigation -->
      <div class="">
        <div class="relative overflow-hidden shadow-xl sm:rounded-2xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl border border-white/20 dark:border-slate-700/30">
          <!-- Tab Headers -->
          <div class="flex overflow-x-auto scrollbar-hide border-b border-white/20 dark:border-slate-700/30">
            <button
              type="button"
              (click)="selectTab('inventory')"
              [class]="'flex-shrink-0 px-6 py-4 text-sm font-medium transition-all duration-300 border-b-2 ' +
                       (navigationTab() === 'inventory' ?
                        'border-blue-500 text-blue-600 dark:text-blue-400 bg-white/20 dark:bg-slate-700/20' :
                        'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600')"
            >
              <i class="fas fa-warehouse mr-2"></i>
              Inventario
            </button>

            <button
              type="button"
              (click)="selectTab('sales')"
              [class]="'flex-shrink-0 px-6 py-4 text-sm font-medium transition-all duration-300 border-b-2 ' +
                       (navigationTab() === 'sales' ?
                        'border-blue-500 text-blue-600 dark:text-blue-400 bg-white/20 dark:bg-slate-700/20' :
                        'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600')"
            >
              <i class="fas fa-shopping-cart mr-2"></i>
              Ventas
            </button>

            <button
              type="button"
              (click)="selectTab('accounts')"
              [class]="'flex-shrink-0 px-6 py-4 text-sm font-medium transition-all duration-300 border-b-2 ' +
                       (navigationTab() === 'accounts' ?
                        'border-blue-500 text-blue-600 dark:text-blue-400 bg-white/20 dark:bg-slate-700/20' :
                        'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600')"
            >
              <i class="fas fa-users mr-2"></i>
              Cuentas
            </button>
          </div>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="relative">
        @if (navigationTab() === 'inventory') {
        <div class="animate-fadeIn">
          <!-- Contenido original del inventario -->

    <app-table-dynamic
      [title]="title()"
      [columns]="inventoryColumns()"
      [serverMode]="true"
      [serverData]="serverInventoryData.value() ?? null"
      [loading]="serverInventoryData.isLoading()"
      [actionTemplate]="actionsTemplate"
      [showAddButton]="true"
      [addButtonText]="'Agregar Producto Categoria'"
      [showSecondaryButton]="true"
      [secondaryButtonText]="'Agregar Inventario'"
      [showExportButton]="true"
      [exportFileName]="exportFileName()"
      [showColumnFilters]="true"
      (action)="handleTableAction($event)"
      (secondaryButtonAction)="openInventoryPopup()"
      (serverPaginationChange)="onPaginationChange($event)"
    >
    </app-table-dynamic>
        </div>
        }

        @if (navigationTab() === 'sales') {
        <div class="animate-fadeIn">
          <app-sale></app-sale>
        </div>
        }

        @if (navigationTab() === 'accounts') {
        <div class="animate-fadeIn">
          <app-account></app-account>
        </div>
        }
      </div>
    </div>

    <!-- Popup Unificado para Agregar Producto o Categoría -->
    <app-pop-up
      [open]="showAddPopup"
      [title]="'Gestión de Inventario'"
      [maxWidth]="'max-w-3xl'"
      [contentPadding]="'p-0'"
    >
      <!-- Tabs -->
      <div class="border-b border-white/10">
        <nav class="flex -mb-px">
          <button
            type="button"
            (click)="activeTab.set('producto')"
            [class]="activeTab() === 'producto'
              ? 'border-blue-500 text-blue-400 bg-blue-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'"
            class="w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-all duration-200"
          >
            <div class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Agregar Producto
            </div>
          </button>
          <button
            type="button"
            (click)="activeTab.set('categoria')"
            [class]="activeTab() === 'categoria'
              ? 'border-green-500 text-green-400 bg-green-500/10'
              : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'"
            class="w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm transition-all duration-200"
          >
            <div class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Agregar Categoría
            </div>
          </button>
        </nav>
      </div>

      <!-- Contenido de los Tabs -->
      <div class="p-8">
        <!-- Tab: Producto -->
        @if (activeTab() === 'producto') {
          <form [formGroup]="productForm" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Código <span class="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  formControlName="codigo"
                  class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Ej: TUBPBC"
                />
                @if (productForm.get('codigo')?.invalid && productForm.get('codigo')?.touched) {
                  <p class="mt-1 text-xs text-red-400">El código es requerido</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">
                  Categoría <span class="text-red-400">*</span>
                </label>
                <select
                  formControlName="categoriaId"
                  class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="" disabled class="bg-gray-800">Seleccione una categoría</option>
                  @if (getAllCategories.value()?.response) {
                    @for (category of getAllCategories.value()!.response; track category.id) {
                      <option [value]="category.id" class="bg-gray-800">{{ category.nombre }}</option>
                    }
                  }
                </select>
                @if (productForm.get('categoriaId')?.invalid && productForm.get('categoriaId')?.touched) {
                  <p class="mt-1 text-xs text-red-400">La categoría es requerida</p>
                }
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Nombre <span class="text-red-400">*</span>
              </label>
              <input
                type="text"
                formControlName="nombre"
                class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ej: Tubo blanco de PVC 1/2 pulgadas"
              />
              @if (productForm.get('nombre')?.invalid && productForm.get('nombre')?.touched) {
                <p class="mt-1 text-xs text-red-400">El nombre es requerido</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Descripción <span class="text-red-400">*</span>
              </label>
              <textarea
                formControlName="descripcion"
                rows="3"
                class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Ej: Tubo para reparaciones de daños"
              ></textarea>
              @if (productForm.get('descripcion')?.invalid && productForm.get('descripcion')?.touched) {
                <p class="mt-1 text-xs text-red-400">La descripción es requerida</p>
              }
            </div>

            <!-- <div class="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                formControlName="activo"
                id="productoActivo"
                class="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label for="productoActivo" class="text-sm font-medium text-gray-300 cursor-pointer">
                Producto Activo
              </label>
            </div> -->

            <div class="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                (click)="closeAddPopup()"
                class="px-6 py-2.5 text-sm font-medium text-gray-300 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="saveProduct()"
                [disabled]="!productForm.valid"
                class="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Guardar Producto
              </button>
            </div>
          </form>
        }

        <!-- Tab: Categoría -->
        @if (activeTab() === 'categoria') {
          <form [formGroup]="categoryForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Nombre <span class="text-red-400">*</span>
              </label>
              <input
                type="text"
                formControlName="nombre"
                class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Ej: Tubos"
              />
              @if (categoryForm.get('nombre')?.invalid && categoryForm.get('nombre')?.touched) {
                <p class="mt-1 text-xs text-red-400">El nombre es requerido</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Descripción <span class="text-red-400">*</span>
              </label>
              <textarea
                formControlName="descripcion"
                rows="4"
                class="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                placeholder="Ej: Tubos de 1/2 pulgadas"
              ></textarea>
              @if (categoryForm.get('descripcion')?.invalid && categoryForm.get('descripcion')?.touched) {
                <p class="mt-1 text-xs text-red-400">La descripción es requerida</p>
              }
            </div>

            <!-- <div class="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                formControlName="activo"
                id="categoriaActiva"
                class="w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500 focus:ring-2"
              />
              <label for="categoriaActiva" class="text-sm font-medium text-gray-300 cursor-pointer">
                Categoría Activa
              </label>
            </div> -->

            <div class="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                (click)="closeAddPopup()"
                class="px-6 py-2.5 text-sm font-medium text-gray-300 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="saveCategory()"
                [disabled]="!categoryForm.valid"
                class="px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Guardar Categoría
              </button>
            </div>
          </form>
        }
      </div>
    </app-pop-up>

    <!-- Popup para Agregar Inventario -->
    <app-pop-up
      [open]="showInventoryPopup"
      [title]="'Agregar Inventario'"
      [maxWidth]="'max-w-4xl'"
    >
      <form [formGroup]="inventoryForm" class="space-y-6">
        <!-- Selector de Producto -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Producto <span class="text-red-400">*</span>
          </label>
          <select
            formControlName="productoId"
            (change)="onProductChange($event)"
            class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Seleccione un producto</option>
            @if (getAllProducts.value()?.response) {
              @for (product of getAllProducts.value()!.response; track product.id) {
                <option [value]="product.id">{{ product.nombre }} - {{ product.codigo }}</option>
              }
            }
          </select>
          @if (inventoryForm.get('productoId')?.invalid && inventoryForm.get('productoId')?.touched) {
            <p class="mt-1 text-sm text-red-400">El producto es requerido</p>
          }
        </div>

        <!-- Selector de Categoría -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Categoría <span class="text-red-400">*</span>
          </label>
          <select
            formControlName="categoriaId"
            class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Seleccione una categoría</option>
            @if (getAllCategories.value()?.response) {
              @for (category of getAllCategories.value()!.response; track category.id) {
                <option [value]="category.id">{{ category.nombre }}</option>
              }
            }
          </select>
          @if (inventoryForm.get('categoriaId')?.invalid && inventoryForm.get('categoriaId')?.touched) {
            <p class="mt-1 text-sm text-red-400">La categoría es requerida</p>
          }
        </div>

        <!-- Grid de campos numéricos -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Cantidad -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Cantidad <span class="text-red-400">*</span>
            </label>
            <input
              type="number"
              formControlName="cantidad"
              min="0"
              step="1"
              class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Ej: 100"
            />
            @if (inventoryForm.get('cantidad')?.invalid && inventoryForm.get('cantidad')?.touched) {
              <p class="mt-1 text-sm text-red-400">
                @if (inventoryForm.get('cantidad')?.errors?.['required']) {
                  La cantidad es requerida
                }
                @if (inventoryForm.get('cantidad')?.errors?.['min']) {
                  La cantidad debe ser mayor o igual a 0
                }
              </p>
            }
          </div>

          <!-- Precio Unitario -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Precio Unitario <span class="text-red-400">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                formControlName="precioUnitario"
                min="0"
                step="0.01"
                class="w-full pl-8 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="5000.00"
              />
            </div>
            @if (inventoryForm.get('precioUnitario')?.invalid && inventoryForm.get('precioUnitario')?.touched) {
              <p class="mt-1 text-sm text-red-400">
                @if (inventoryForm.get('precioUnitario')?.errors?.['required']) {
                  El precio unitario es requerido
                }
                @if (inventoryForm.get('precioUnitario')?.errors?.['min']) {
                  El precio debe ser mayor o igual a 0
                }
              </p>
            }
          </div>

          <!-- Precio Venta -->
          <div class="relative">
            <label class="flex items-center text-sm font-medium text-gray-300 mb-2">
              Precio Venta <span class="text-red-400">*</span>
            </label>

            <div id="tooltip-precio-venta" role="tooltip" class="absolute z-50 invisible inline-block w-72 px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
              <div class="space-y-2">
                <h3 class="font-semibold text-white">Cálculo Automático del Precio de Venta</h3>
                <p class="text-gray-300">El precio de venta se calcula automáticamente basado en:</p>
                <div class="bg-gray-800 p-2 rounded text-xs">
                  <strong>Fórmula:</strong><br/>
                  Precio Venta = Precio Unitario + (Precio Unitario × Porcentaje ÷ 100)
                </div>
                <p class="text-xs text-gray-300"><strong>Ejemplo:</strong> Si el precio unitario es $5000 y el porcentaje es 40%, el precio de venta será $7000.</p>
              </div>
              <div class="tooltip-arrow" data-popper-arrow></div>
            </div>
            <div class="relative">
              <input
                type="number"
                formControlName="precioVenta"
                min="0"
                step="0.01"
                readonly
                class="w-full px-4 py-3 pr-10 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-not-allowed"
                placeholder="Se calcula automáticamente"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                <div class="flex items-center space-x-1">
                  <span class="text-xs text-green-400">Auto</span>
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            @if (inventoryForm.get('precioVenta')?.invalid && inventoryForm.get('precioVenta')?.touched) {
              <p class="mt-1 text-sm text-red-400">
                @if (inventoryForm.get('precioVenta')?.errors?.['min']) {
                  El precio debe ser mayor o igual a 0
                }
              </p>
            }
          </div>

          <!-- Porcentaje -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Porcentaje de Ganancia <span class="text-red-400">*</span>
              @if (inventoryForm.get('precioUnitario')?.value && inventoryForm.get('porcentaje')?.value) {
                <span class="text-xs text-blue-400 ml-2">
                  ({{ inventoryForm.get('precioUnitario')?.value | currency:'COP':'symbol':'1.0-0' }} + {{ (inventoryForm.get('precioUnitario')?.value * inventoryForm.get('porcentaje')?.value / 100) | currency:'COP':'symbol':'1.0-0' }})
                </span>
              }
            </label>
            <div class="relative">
              <input
                type="number"
                formControlName="porcentaje"
                min="0"
                max="100"
                step="0.01"
                class="w-full px-4 pr-8 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="40.00"
              />
              <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
            </div>
            @if (inventoryForm.get('porcentaje')?.invalid && inventoryForm.get('porcentaje')?.touched) {
              <p class="mt-1 text-sm text-red-400">
                @if (inventoryForm.get('porcentaje')?.errors?.['required']) {
                  El porcentaje es requerido
                }
                @if (inventoryForm.get('porcentaje')?.errors?.['min']) {
                  El porcentaje debe ser mayor o igual a 0
                }
                @if (inventoryForm.get('porcentaje')?.errors?.['min']) {
                    El porcentaje debe ser mayor o igual a 0
                }
              </p>
            }
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            formControlName="descripcion"
            rows="3"
            class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="Descripción del inventario..."
          ></textarea>
        </div>
        <!-- <div class="flex items-center gap-3">
          <input
            type="checkbox"
            formControlName="activo"
            id="activo"
            class="w-5 h-5 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label for="activo" class="text-sm font-medium text-gray-300 cursor-pointer">
            Activo
          </label>
        </div> -->

        <!-- Botones de acción -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button
            type="button"
            (click)="closeInventoryPopup()"
            class="px-6 py-2.5 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            (click)="saveInventory()"
            [disabled]="!inventoryForm.valid"
            class="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Guardar Inventario
          </button>
        </div>
      </form>
    </app-pop-up>
  `
})
export class InventoryCompany {

  readonly InventarioService = inject(InventarioService)
  readonly productoService = inject(ProductoService)
  readonly categoryService = inject(ProductCategoryService)
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  // Señal unificada para controlar el popup
  showAddPopup = signal(false);
  // Señal para controlar el tab activo de los popups
  activeTab = signal<'producto' | 'categoria'>('producto');
  // Señal para la navegación principal de tabs
  navigationTab = signal<string>('inventory');
  // Señal para el popup de inventario (separado)
  showInventoryPopup = signal(false);

  // Formularios reactivos
  productForm: FormGroup;
  categoryForm: FormGroup;
  inventoryForm: FormGroup;

  title = signal('Inventario');

  inventoryColumns = signal([
    { field: 'codigo', header: 'Código', type: 'text' as const },
    { field: 'nombre', header: 'Nombre', type: 'text' as const },
    { field: 'descripcion', header: 'Descripción', type: 'text' as const },
    { field: 'cantidad', header: 'Cantidad', type: 'text' as const },
    { field: 'precioUnitario', header: 'Precio Unitario', type: 'text' as const },
    { field: 'precioVenta', header: 'Precio Venta', type: 'text' as const },
    { field: 'porcentaje', header: 'Porcentaje', type: 'text' as const },
    { field: 'fechaCreacion', header: 'Fecha Creación', type: 'date' as const  },
  ]);

  readonly enterpriseId = computed(() => {
    if (!this.isBrowser) return null;

    try {
      const userData = sessionStorage.getItem('userData');
      if (!userData) return null;

      const parsedUserData = JSON.parse(userData);
      return parsedUserData.empresaId ? Number(parsedUserData.empresaId) : null;
    } catch {
      return null;
    }
  });


  constructor() {
    this.productForm = this.fb.group({
      codigo: ['', Validators.required],
      categoriaId: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      activo: [true]
    });
    this.categoryForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      activo: [true]
    });

    this.inventoryForm = this.fb.group({
      productoId: ['', Validators.required],
      categoriaId: ['', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(0)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
      precioVenta: [0, [Validators.min(0)]], // Removido required ya que se calcula automáticamente
      porcentaje: [0, [Validators.required, Validators.min(0)]],
      descripcion: [''],
      activo: [true]
    });

    // Suscribirse a cambios en precio unitario y porcentaje para cálculo automático
    this.setupAutomaticCalculation();
  }

  private setupAutomaticCalculation(): void {
    // Escuchar cambios en precio unitario
    this.inventoryForm.get('precioUnitario')?.valueChanges.subscribe(value => {
      this.calculatePrecioVenta();
    });

    // Escuchar cambios en porcentaje
    this.inventoryForm.get('porcentaje')?.valueChanges.subscribe(value => {
      this.calculatePrecioVenta();
    });
  }

  private calculatePrecioVenta(): void {
    const precioUnitario = this.inventoryForm.get('precioUnitario')?.value || 0;
    const porcentaje = this.inventoryForm.get('porcentaje')?.value || 0;

    if (precioUnitario > 0 && porcentaje >= 0) {
      const precioVenta = precioUnitario + (precioUnitario * (porcentaje / 100));

      // Actualizar el valor sin disparar el evento valueChanges
      this.inventoryForm.get('precioVenta')?.setValue(
        Math.round(precioVenta * 100) / 100, // Redondear a 2 decimales
        { emitEvent: false }
      );
    } else if (precioUnitario > 0 && porcentaje === 0) {
      // Si no hay porcentaje, el precio de venta es igual al precio unitario
      this.inventoryForm.get('precioVenta')?.setValue(
        Math.round(precioUnitario * 100) / 100,
        { emitEvent: false }
      );
    }
  }

  readonly exportFileName = computed(
    () => `inventario_${new Date().toISOString().split('T')[0]}`
  );

  readonly paginationParams = signal<IPaginationParams>({
    page: 0,
    size: 5,
  });


  serverInventoryData = rxResource({
    params: () => ({
      enterpriseId: this.enterpriseId(),
      pagination: this.paginationParams(),
    }),
    stream: ({ params }) => {
      const { enterpriseId, pagination } = params;
      if (!enterpriseId) {
        return EMPTY;
      }
      return this.InventarioService.getInventoryCompanyPaginated(
        enterpriseId,
        pagination
      ).pipe(
        catchError((error) => {
          return of(null);
        })
      );
    },
  });


  getAllCategories = rxResource({
    stream: () => this.categoryService.getAllProductCategories()
  })

  getAllProducts = rxResource({
    params: () => ({ enterpriseId: this.enterpriseId() }),
        stream: ({ params }) => {
      const { enterpriseId } = params;
      if (!enterpriseId) {
        return EMPTY;
      }
       return this.productoService.getProductByIdEnterprise(enterpriseId).pipe(
        catchError((error) => {
          return of(null);
        })
      );
    },
  })

  handleTableAction(event: { action: string; row?: any }): void {
    if (event.action === 'add') {
      this.openAddPopup('producto'); // Abre el popup en la pestaña de producto
    } else if (event.action === 'edit' && event.row) {
      this.router.navigate(['edit', event.row.id], {
        relativeTo: this.route,
      });
    } else if (event.action === 'view' && event.row) {
      this.router.navigate(['detail', event.row.id], {
        relativeTo: this.route,
      });
    }
  }

  onPaginationChange(params: IPaginationParams): void {
    this.paginationParams.set(params);
  }

  openAddPopup(tab: 'producto' | 'categoria' = 'producto'): void {
    this.activeTab.set(tab);
    this.productForm.reset({
      codigo: '',
      categoriaId: '',
      nombre: '',
      descripcion: '',
      activo: true
    });
    this.categoryForm.reset({
      nombre: '',
      descripcion: '',
      activo: true
    });
    this.showAddPopup.set(true);
  }

  closeAddPopup(): void {
    this.showAddPopup.set(false);
    this.productForm.reset();
    this.categoryForm.reset();
  }

  saveProduct(): void {
    if (this.productForm.valid && this.enterpriseId()) {
      const formValue = this.productForm.value;

      const productData: Omit<IProducto, 'id' | 'fechaCreacion' | 'usuarioModificacion' | 'fechaModificacion'> = {
        empresa: {
          id: this.enterpriseId()!
        } as any,
        categoria: {
          id: Number(formValue.categoriaId)
        } as ICategoria,
        codigo: formValue.codigo,
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        activo: true,
        usuarioCreacion: this.getUserName()
      };

      this.productoService.createProduct(productData as any).subscribe({
        next: (response) => {
          this.toast.success('success','Producto creado exitosamente');
          this.closeAddPopup();
          this.serverInventoryData.reload();
          this.getAllProducts.reload();
          this.getAllCategories.reload();
        }
      });
    }
  }

  saveCategory(): void {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;

      // Crear objeto según la interfaz ICategoria (sin el id que se genera en el backend)
      const categoryData: Omit<ICategoria, 'id' | 'fechaCreacion' | 'usuarioModificacion' | 'fechaModificacion'> = {
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        activo: true,
        usuarioCreacion: this.getUserName()
      };

      this.categoryService.createCategory(categoryData as any).subscribe({
        next: (response) => {
          this.closeAddPopup();
          this.getAllCategories.reload();
          this.toast.success('success','Categoría creada exitosamente');
        }
      });
    }
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

  // Métodos para el popup de inventario
  openInventoryPopup(): void {
    this.inventoryForm.reset({
      productoId: '',
      categoriaId: '',
      cantidad: 0,
      precioUnitario: 0,
      precioVenta: 0,
      porcentaje: 0,
      descripcion: '',
      activo: true
    });
    this.showInventoryPopup.set(true);
  }

  closeInventoryPopup(): void {
    this.showInventoryPopup.set(false);
    this.inventoryForm.reset();
  }

  onProductChange(event: any): void {
    const productoId = event.target.value;
    if (productoId && this.getAllProducts.value()?.response) {
      const selectedProduct = this.getAllProducts.value()!.response.find(
        p => p.id === Number(productoId)
      );

      if (selectedProduct?.categoria?.id) {
        this.inventoryForm.patchValue({
          categoriaId: selectedProduct.categoria.id
        });
      }
    }
  }

  saveInventory(): void {
    if (this.inventoryForm.valid && this.enterpriseId()) {
      const formValue = this.inventoryForm.value;
      const inventoryData = {
        producto: {
          id: Number(formValue.productoId),
          empresa: {
            id: this.enterpriseId()!
          },
          categoria: {
            id: Number(formValue.categoriaId)
          }
        },
        cantidad: Number(formValue.cantidad),
        precioUnitario: Number(formValue.precioUnitario),
        precioVenta: Number(formValue.precioVenta),
        porcentaje: Number(formValue.porcentaje),
        descripcion: formValue.descripcion || '',
        activo: true,
        usuarioCreacion: this.getUserName()
      };

      this.InventarioService.createInventary(inventoryData).subscribe({
        next: (response) => {
          this.closeInventoryPopup();
          this.serverInventoryData.reload();
        }
      });
    }
  }

  // Tab navigation methods
  selectTab(tabId: string): void {
    this.navigationTab.set(tabId);
  }

  getTabClasses(tabId: string): string {
    const isActive = this.navigationTab() === tabId;
    return isActive ? 'active' : '';
  }
}
