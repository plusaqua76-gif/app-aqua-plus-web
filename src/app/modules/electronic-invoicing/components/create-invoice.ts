import {
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  of,
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
} from 'rxjs';
import { ColombianCurrencyPipe } from '@shared/index';
import { EnterpriseClientCounterService } from '../../client/service/enterpriseClientCounter.service';
import { ClientRaw } from '@interfaces/client/IclientRaw';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';
import { ProductDian } from '@interfaces/invoice/dian-invoice';
import { GeneralsParamsService } from '@shared/services/generals-params.service';
import { InvoiceService } from '../services/invoice.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-create-invoice',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ColombianCurrencyPipe,
  ],
  template: `
    <div class="min-h-screen  text-white p-6">
      <div class="max-w-5xl mx-auto">
        <div
          class="p-8 rounded-xl border border-gray-700/50 bg-gradient-to-b from-gray-900/80 to-gray-900/60 backdrop-blur-md space-y-6"
        >
          <div
            class="flex justify-between items-start pb-6 border-b border-gray-700/50"
          >
            <div>
              <h1 class="text-3xl font-bold text-white mb-2">
                FACTURA DE VENTA
              </h1>
              <p class="text-sm text-gray-400">Factura Electrónica de Venta</p>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-400 mb-1">N° Factura</div>
              <div class="text-2xl font-bold text-blue-400">SETT-0015</div>
              <div class="text-xs text-gray-500 mt-1">Fecha: 17/12/2025</div>
            </div>
          </div>

          <!-- Datos Empresa -->
          <div class="grid grid-cols-2 gap-6 pb-6 border-b border-gray-700/50">
            <div>
              <h3
                class="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide"
              >
                Emisor
              </h3>
              <div class="space-y-1.5">
                <p class="text-white font-semibold">
                  CODE MAKERS DEVELOPERS S.A.S
                </p>
                <p class="text-sm text-gray-400">NIT: 901859695-1</p>
                <p class="text-sm text-gray-400">Persona Jurídica</p>
              </div>
            </div>
            <div>
              <h3
                class="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wide"
              >
                Cliente
              </h3>
              <!-- Buscador de Cliente -->
              <div class="relative mb-3">
                <input
                  type="text"
                  #searchInput
                  [(ngModel)]="searchTerm"
                  (input)="onSearchChange($event)"
                  placeholder="Buscar cliente por documento o nombre..."
                  class="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-600/70 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-sm"
                />
                @if (isSearching()) {
                <div class="absolute right-3 top-3">
                  <div
                    class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"
                  ></div>
                </div>
                } @else {
                <svg
                  class="w-5 h-5 text-gray-400 absolute right-3 top-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                } @if (showResults() && searchResults().length > 0) {
                <div
                  class="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  @for (cliente of searchResults(); track cliente.id) {
                  <button
                    type="button"
                    (click)="selectClient(cliente)"
                    class="w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors border-b border-gray-700 last:border-b-0"
                  >
                    <div class="flex flex-col">
                      <span class="text-white font-medium">{{
                        cliente.nombreCompleto
                      }}</span>
                      <span class="text-sm text-gray-400"
                        >Cédula: {{ cliente.numeroCedula }}</span
                      >
                      @if (cliente.correo) {
                      <span class="text-xs text-gray-500">{{
                        cliente.correo
                      }}</span>
                      }
                    </div>
                  </button>
                  }
                </div>
                } @if (showResults() && searchResults().length === 0 &&
                searchTerm.length > 2) {
                <div
                  class="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-4"
                >
                  <p class="text-gray-400 text-sm text-center">
                    No se encontraron clientes
                  </p>
                </div>
                }
              </div>
              @if (selectedClient()) {
              <div
                class="space-y-1.5 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <p class="text-white font-semibold">
                      {{ selectedClient()?.nombreCompleto }}
                    </p>
                    <p class="text-sm text-gray-400">
                      Cédula: {{ selectedClient()?.numeroCedula }}
                    </p>
                    @if (selectedClient()?.correo) {
                    <p class="text-sm text-gray-400">
                      {{ selectedClient()?.correo }}
                    </p>
                    } @if (selectedClient()?.telefono) {
                    <p class="text-sm text-gray-400">
                      Tel: {{ selectedClient()?.telefono }}
                    </p>
                    }
                  </div>
                  <button
                    type="button"
                    (click)="clearClient()"
                    class="text-red-400 hover:text-red-300 p-1"
                    title="Limpiar selección"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              } @else {
              <div
                class="text-sm text-gray-500 italic p-3 bg-gray-800/30 rounded-lg"
              >
                Busca y selecciona un cliente
              </div>
              }
            </div>
          </div>

          <!-- Detalle de la Factura -->
          <div [formGroup]="invoiceForm">
            <div class="flex items-center justify-between mb-4">
              <h3
                class="text-sm font-semibold text-purple-400 uppercase tracking-wide"
              >
                Detalle de la Factura
              </h3>
              <button
                type="button"
                (click)="addItem()"
                class="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-400 text-xs font-medium transition-all"
              >
                + Agregar Producto
              </button>
            </div>

            @if (items.length === 0) {
            <div
              class="text-center py-8 text-gray-400 border border-gray-700/50 rounded-lg bg-gray-800/20"
            >
              <p class="text-sm">No hay productos agregados</p>
              <p class="text-xs mt-2">
                Haz clic en "Agregar Producto" para comenzar
              </p>
            </div>
            } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-700/50">
                    <th
                      class="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase"
                    >
                      Producto a seleccionar
                    </th>
                    <th
                      class="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase"
                    >
                      Descripción
                    </th>
                    <th
                      class="text-center py-3 px-3 text-xs font-semibold text-gray-400 uppercase"
                    >
                      Cant.
                    </th>
                    <th
                      class="text-right py-3 px-3 text-xs font-semibold text-gray-400 uppercase"
                    >
                      Precio Unit.
                    </th>
                    <th
                      class="text-center py-3 px-3 text-xs font-semibold text-gray-400 uppercase"
                    >
                      IVA
                    </th>
                    <th
                      class="text-left py-3 px-3 text-xs font-semibold text-gray-400 uppercase"
                    >
                      Nota
                    </th>
                    <th
                      class="text-right py-3 px-3 text-xs font-semibold text-gray-400 uppercase"
                    >
                      Total
                    </th>
                    <th class="py-3 px-3"></th>
                  </tr>
                </thead>
                <tbody formArrayName="items">
                  @for (item of items.controls; track $index) {
                  <tr
                    [formGroupName]="$index"
                    class="border-b border-gray-700/30 hover:bg-gray-800/30"
                  >
                    <!-- Producto seleccionable -->
                    <td class="py-3 px-3">
                      <select
                        formControlName="codigoProducto"
                        (change)="onProductSelected($index, $event)"
                        class="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/70 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40 invalid:text-gray-400"
                        required
                      >
                        <option
                          value=""
                          disabled
                          selected
                          hidden
                          class="text-gray-400"
                        >
                          @if (ProductCodesDian.isLoading()) { Cargando productos... }
                          @else if (ProductCodesDian.error()) { Error al cargar productos }
                          @else { Seleccione producto }
                        </option>
                        @for (producto of ProductCodesDian.value()?.response ?? [];
                        track producto.id) {
                        <option
                          [value]="producto.id"
                          class="text-white bg-gray-700 py-2 px-4 hover:bg-gray-600"
                        >
                          {{ producto.nombre }} - {{ producto.descripcion }}
                        </option>
                        }
                      </select>

                      <!-- Mensaje para crear producto -->
                      <div class="mt-2">
                        <button
                          type="button"
                          (click)="toggleCambioTipo($index)"
                          class="text-xs text-blue-400 hover:text-blue-300 underline"
                        >
                          ¿No encuentra su producto? Créelo aquí
                        </button>
                      </div>
                    </td>
                    <td class="py-3 px-3">
                      <input
                        type="text"
                        formControlName="descripcion"
                        placeholder="Descripción del producto"
                        class="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </td>
                    <td class="py-3 px-3 text-center">
                      <input
                        type="number"
                        formControlName="cantidad"
                        min="1"
                        class="w-16 text-center bg-gray-800/50 border border-gray-600/50 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </td>
                    <td class="py-3 px-3">
                      <input
                        type="number"
                        formControlName="precioUnitario"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        class="w-24 text-right bg-gray-800/50 border border-gray-600/50 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </td>

                    <!-- IVA -->
                    <td class="py-3 px-3 text-center">
                      <select
                        formControlName="iva"
                        class="w-16 text-center bg-gray-800/50 border border-gray-600/50 rounded px-1 py-1 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="19" selected>19%</option>
                      </select>
                    </td>

                    <!-- Nota -->
                    <td class="py-3 px-3">
                      <input
                        type="text"
                        formControlName="nota"
                        placeholder="Nota..."
                        class="w-32 bg-gray-800/50 border border-gray-600/50 rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </td>

                    <!-- Total -->
                    <td
                      class="py-3 px-3 text-right text-white font-semibold text-sm"
                    >
                      {{ item.get('total')?.value | colombianCurrency }}
                    </td>

                    <!-- Eliminar -->
                    <td class="py-3 px-3 text-center">
                      <button
                        type="button"
                        (click)="removeItem($index)"
                        class="text-red-400 hover:text-red-300 p-1 transition-colors"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  }
                </tbody>
              </table>
            </div>
            }
          </div>

          <!-- Totales y Forma de Pago -->
          <div
            class="p-6 rounded-lg border border-gray-600/70 bg-gradient-to-br from-emerald-600/5 to-transparent"
          >
            <div class="flex items-center gap-3 mb-4">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-500/30"
              >
                <svg
                  class="w-5 h-5 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-emerald-400">
                Forma de Pago y Totales
              </h2>
            </div>

            <div
              class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-700/50"
              [formGroup]="invoiceForm"
            >
              <!-- Forma de Pago -->
              <div class="space-y-4">
                <h3
                  class="text-sm font-semibold text-emerald-400 uppercase tracking-wide"
                >
                  Forma de Pago
                </h3>


                  <!-- Medio de Pago -->
                  <div>
                    <label class="block text-xs text-gray-400 mb-1.5 tracking-wide uppercase">
                      Medio de Pago
                      <span class="text-red-400">*</span>
                    </label>
                    <select
                      formControlName="medioPago"
                      class="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/70 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 invalid:text-gray-400 cursor-pointer"
                      required
                    >
                      <option value="" disabled selected hidden class="text-gray-400">
                        Seleccione medio de pago
                      </option>
                      @for (medio of ParamsGeneral.value()?.response ?? []; track medio.codigo) {
                      @if (medio.codigoPadre === 'FORMA_PAGO_DIAN') {
                      <option [value]="medio.codigo" class="text-white bg-gray-700 py-2 px-4 hover:bg-gray-600">
                        {{ medio.descripcion }}
                      </option>
                      }
                      }
                    </select>
                  </div>
                <div class="space-y-3">
                  <!-- Tipo de Documento -->
                  <div>
                    <label
                      for="tipoDocumento"
                      class="block text-xs text-gray-400 mb-1.5 tracking-wide uppercase"
                      >Forma de Pago
                      <span class="text-red-400">*</span></label
                    >
                    <select
                      id="tipoDocumento"
                      formControlName="tipoDocumento"
                      class="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/70 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 invalid:text-gray-400 cursor-pointer"
                      required
                    >
                      <option
                        value=""
                        disabled
                        selected
                        hidden
                        class="text-gray-400"
                      >
                        @if (PaymentMethodsDian.isLoading()) { Cargando tipos de
                        documento... } @else if (PaymentMethodsDian.error()) {
                        Error al cargar tipos de documento } @else { Seleccione
                        tipo de documento }
                      </option>
                      @for (tipo of PaymentMethodsDian.value()?.response ?? [];
                      track tipo.code) {
                      <option
                        [value]="tipo.code"
                        class="text-white bg-gray-700 py-2 px-4 hover:bg-gray-600"
                      >
                        {{ tipo.value }}
                      </option>
                      }
                    </select>
                  </div>

                  <!-- Medio de Pago -->
                  <!-- <div>
                    <label class="block text-xs text-gray-400 mb-1.5 tracking-wide uppercase">
                      Medio de Pago
                      <span class="text-red-400">*</span>
                    </label>
                    <select
                      formControlName="medioPago"
                      class="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/70 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 invalid:text-gray-400 cursor-pointer"
                      required
                    >
                      <option value="" disabled selected hidden class="text-gray-400">
                        Seleccione medio de pago
                      </option>
                      @for (medio of ParamsGeneral.value()?.response ?? []; track medio.codigo) {
                      @if (medio.codigoPadre === 'FORMA_PAGO_DIAN') {
                      <option [value]="medio.codigo" class="text-white bg-gray-700 py-2 px-4 hover:bg-gray-600">
                        {{ medio.descripcion }}
                      </option>
                      }
                      }
                    </select>
                  </div> -->
<!--
                                        <div class="col-span-3">
                          <select
                            formControlName="codigoRazon"
                            class="w-full px-2 py-1 bg-gray-800/50 border border-gray-600/70 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                          >
                            <option value="" disabled selected hidden>Código</option>
                            @for (razon of ParamsGeneral.value()?.response ?? []; track razon.codigo) {
                            @if (razon.codigoPadre === 'RAZON_DESCUENTO_DIAN') {
                            <option [value]="razon.codigo">{{ razon.descripcion }}</option>
                            }
                            }
                          </select>
                        </div> -->

                  <!-- Total Anticipado -->
                  <div>
                    <label class="block text-xs text-gray-400 mb-1.5">
                      Total Anticipado
                    </label>
                    <input
                      type="number"
                      formControlName="totalAnticipado"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      class="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/70 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                </div>

                <!-- Descuentos Globales -->
                <div class="pt-4 border-t border-gray-700/50">
                  <div class="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id="aplicarDescuentoGlobal"
                      formControlName="aplicarDescuentoGlobal"
                      class="w-4 h-4 text-emerald-600 bg-gray-800 border-gray-600 rounded focus:ring-emerald-500"
                    />
                    <label
                      for="aplicarDescuentoGlobal"
                      class="ml-2 text-sm text-gray-400 cursor-pointer"
                    >
                      Aplicar descuentos a la factura
                    </label>
                  </div>

                  @if (invoiceForm.get('aplicarDescuentoGlobal')?.value) {
                  <div class="space-y-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                        Descuentos/Cargos Globales
                      </h4>
                      <button
                        type="button"
                        (click)="addDescuento()"
                        class="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded text-emerald-400 text-xs font-medium"
                      >
                        + Agregar
                      </button>
                    </div>

                    <div formArrayName="descuentos" class="space-y-2">
                      @for (descuento of descuentos.controls; track $index) {
                      <div
                        [formGroupName]="$index"
                        class="grid grid-cols-12 gap-2 p-2 bg-gray-900/50 rounded border border-gray-700/30"
                      >
                        <div class="col-span-2">
                          <input
                            type="number"
                            formControlName="valor"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="%"
                            class="w-full px-2 py-1 bg-gray-800/50 border border-gray-600/70 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                          />
                        </div>
                        <div class="col-span-2 flex items-center">
                          <label class="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              formControlName="indCargo"
                              class="w-4 h-4 text-emerald-600 bg-gray-800 border-gray-600 rounded focus:ring-emerald-500"
                            />
                            <span class="ml-1 text-xs text-gray-400">Cargo</span>
                          </label>
                        </div>
                        <div class="col-span-2">
                          <select
                            formControlName="codigoRazon"
                            class="w-full px-2 py-1 bg-gray-800/50 border border-gray-600/70 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                          >
                            <option value="" disabled selected hidden>Código</option>
                            @for (razon of ParamsGeneral.value()?.response ?? []; track razon.codigo) {
                            @if (razon.codigoPadre === 'RAZON_DESCUENTO_DIAN') {
                            <option [value]="razon.codigo">{{ razon.descripcion }}</option>
                            }
                            }
                          </select>
                        </div>
                        <div class="col-span-5">
                          <input
                            type="text"
                            formControlName="razon"
                            placeholder="Descripción de la razón..."
                            class="w-full px-2 py-1 bg-gray-800/50 border border-gray-600/70 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                          />
                        </div>
                        <div class="col-span-1 flex items-center justify-center">
                          <button
                            type="button"
                            (click)="removeDescuento($index)"
                            class="text-red-400 hover:text-red-300 p-1"
                          >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      }
                      @if (descuentos.length === 0) {
                      <p class="text-xs text-gray-500 text-center py-2">
                        No hay descuentos/cargos globales agregados
                      </p>
                      }
                    </div>
                  </div>
                  }
                </div>

                <!-- Nota -->
                <div class="pt-2">
                  <label class="block text-xs text-gray-400 mb-1.5">
                    Observaciones
                  </label>
                  <textarea
                    formControlName="observaciones"
                    rows="2"
                    placeholder="Nota adicional..."
                    class="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/70 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/40 resize-none"
                  ></textarea>
                </div>
              </div>

              <!-- Totales -->
              <div class="space-y-3">
                <h3
                  class="text-sm font-semibold text-blue-400 uppercase tracking-wide"
                >
                  Totales
                </h3>
                <div
                  class="space-y-2 p-4 rounded-lg bg-gray-800/30 border border-gray-700/50"
                >
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-400">Subtotal:</span>
                    <span class="text-white font-medium">{{
                      calculateTotals().subtotal | colombianCurrency
                    }}</span>
                  </div>

                  @if (calculateTotals().totalDescuentos > 0) {
                  <div class="flex justify-between text-sm">
                    <span class="text-green-400">Descuentos:</span>
                    <span class="text-green-400 font-medium">-{{
                      calculateTotals().totalDescuentos | colombianCurrency
                    }}</span>
                  </div>
                  }

                  @if (calculateTotals().totalCargos > 0) {
                  <div class="flex justify-between text-sm">
                    <span class="text-orange-400">Cargos:</span>
                    <span class="text-orange-400 font-medium">+{{
                      calculateTotals().totalCargos | colombianCurrency
                    }}</span>
                  </div>
                  }

                  <div class="flex justify-between text-sm">
                    <span class="text-gray-400">Total IVA:</span>
                    <span class="text-purple-400 font-medium">{{
                      calculateTotals().totalIva | colombianCurrency
                    }}</span>
                  </div>

                  <div class="h-px bg-gray-700/50"></div>

                  <div class="flex justify-between items-center pt-2">
                    <span class="text-emerald-400 font-semibold text-lg"
                      >Total a Pagar:</span
                    >
                    <span class="text-emerald-400 font-bold text-2xl">{{
                      calculateTotals().total | colombianCurrency
                    }}</span>
                  </div>

                  <div class="text-xs text-gray-500 text-center pt-2">
                    COP - Peso Colombiano
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <button
              type="button"
              (click)="submitInvoice()"
              [disabled]="!invoiceForm.valid || items.length === 0 || !selectedClient()"
              class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:opacity-50 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
            >
              <span class="flex items-center justify-center gap-2">
                <svg
                  class="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Generar Factura
              </span>
            </button>

            <!-- <button
              type="button"
              class="w-full px-6 py-3 bg-transparent border border-gray-600/70 hover:bg-gray-600/10 text-gray-300 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/40 transition-all duration-200"
            >
              Vista Previa PDF
            </button> -->

            <!-- <button
              type="button"
              class="w-full px-6 py-3 bg-transparent border border-gray-600/70 hover:bg-gray-600/10 text-gray-300 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/40 transition-all duration-200"
            >
              Guardar como Borrador
            </button> -->
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para crear nuevo producto -->
    @if (showCreateProductModal()) {
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/20 dark:border-slate-700/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-gradient-to-r from-[#2563eb00] to-blue-500 px-6 py-4 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-white flex items-center gap-2">
              <i class="fas fa-plus-circle"></i>
              Crear Nuevo Producto
            </h3>
            <button
              (click)="closeCreateProductModal()"
              class="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-4">
          <form [formGroup]="newProductForm" class="space-y-4">
            <!-- Código de Unidad -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                Código de Unidad
                <span class="text-red-500">*</span>
              </label>
              <select
                formControlName="codigoUnidad"
                class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer"
              >
                @if (UnitCodes.isLoading()) {
                <option disabled selected class="text-gray-900 dark:text-white bg-white dark:bg-gray-700">Cargando unidades...</option>
                } @else if (UnitCodes.error()) {
                <option disabled selected class="text-gray-900 dark:text-white bg-white dark:bg-gray-700">Error al cargar unidades</option>
                } @else {
                @for (unitCode of UnitCodes.value()?.response ?? []; track unitCode.code) {
                <option [value]="unitCode.code" class="text-gray-900 dark:text-white bg-white dark:bg-gray-700 py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600">
                  {{ unitCode.value }} ({{ unitCode.code }})
                </option>
                }
                }
              </select>
            </div>

            <!-- Nombre -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                Nombre del Producto
                <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                formControlName="nombre"
                placeholder="Ej: Agua Potable"
                class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40"
              />
            </div>

            <!-- Descripción -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                Descripción
                <span class="text-red-500">*</span>
              </label>
              <textarea
                formControlName="descripcion"
                rows="3"
                placeholder="Descripción detallada del producto..."
                class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 resize-none"
              ></textarea>
            </div>

            <!-- IVA -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 tracking-wider uppercase">
                IVA (%)
                <span class="text-red-500">*</span>
              </label>
              <select
                formControlName="iva"
                class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/20 dark:focus:bg-slate-600/50 backdrop-blur-md transition-all duration-300 hover:bg-white/15 dark:hover:bg-slate-600/40 appearance-none cursor-pointer"
              >
                <option value="0" class="text-gray-900 dark:text-white bg-white dark:bg-gray-700">0%</option>
                <option value="5" class="text-gray-900 dark:text-white bg-white dark:bg-gray-700">5%</option>
                <option value="19" selected class="text-gray-900 dark:text-white bg-white dark:bg-gray-700">19%</option>
              </select>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="sticky bottom-0 bg-white/10 dark:bg-slate-700/30 backdrop-blur-md border-t border-white/20 dark:border-slate-600/30 px-6 py-4 rounded-b-2xl flex gap-3">
          <button
            (click)="closeCreateProductModal()"
            class="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-gray-900 dark:text-white hover:bg-white/20 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 font-semibold"
          >
            Cancelar
          </button>
          <button
            (click)="createNewProduct()"
            [disabled]="!newProductForm.valid"
            class="flex-1 px-4 py-3 bg-blue-600 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105"
          >
            <span>Crear Producto</span>
          </button>
        </div>
      </div>
    </div>
    }
  `,
  styles: [
    `
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: rgba(31, 41, 55, 0.5);
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(75, 85, 99, 0.8);
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(107, 114, 128, 0.9);
      }
    `,
  ],
})
export class CreateInvoiceComponent {
  protected invoiceService = inject(InvoiceService);
  protected clientService = inject(EnterpriseClientCounterService);
  private generalsParamsService = inject(GeneralsParamsService);
  private fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  invoiceForm!: FormGroup;

  searchTerm = '';
  private searchSubject = new Subject<string>();
  searchResults = signal<ClientRaw[]>([]);
  selectedClient = signal<ClientRaw | null>(null);
  showResults = signal(false);
  isSearching = signal(false);
  showCreateProductModal = signal(false);
  activeItemIndex = signal<number | null>(null);
  newProductForm!: FormGroup;

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

  readonly usuario = computed(() => {
    const data = this.userData();
    return data?.nombre  || '';
  });

  UnitCodes = rxResource({
    stream: () => this.invoiceService.getUnitCodes(),
  });

  PaymentMethodsDian = rxResource({
    stream: () => this.invoiceService.getPaymentMethodsDian(),
  });

  ParamsGeneral = rxResource({
    stream: () => this.generalsParamsService.getGeneralsParams(),
  });


  ProductCodesDian = rxResource({
    stream: () => this.invoiceService.getProductCodesDian('MTQ')
  });



  constructor() {
    this.initForm();
    this.initNewProductForm();
    this.initClientSearch();
  }

  private initClientSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term.length < 3) {
            this.searchResults.set([]);
            this.showResults.set(false);
            this.isSearching.set(false);
            return of(null);
          }

          this.isSearching.set(true);
          const empresaId = this.empresaId();

          if (!empresaId) {
            this.isSearching.set(false);
            return of(null);
          }

          // Detectar si es número (cédula) o texto (nombre)
          const isNumeric = /^\d+$/.test(term.trim());

          const params: IPaginationParams = {
            page: 0,
            size: 10,
            filters: isNumeric
              ? { numeroCedula: term.trim() }
              : { nombreCompleto: term.trim() },
          };

          return this.clientService
            .getAllClientsByIdEnterprisePaginated(empresaId, params)
            .pipe(
              catchError((error) => {
                console.error('Error buscando clientes:', error);
                return of(null);
              })
            );
        })
      )
      .subscribe((response) => {
        this.isSearching.set(false);
        if (response?.response) {
          this.searchResults.set(response.response);
          this.showResults.set(true);
        } else {
          this.searchResults.set([]);
          this.showResults.set(false);
        }
      });
  }

  onSearchChange(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchSubject.next(term);
  }

  selectClient(cliente: ClientRaw): void {
    this.selectedClient.set(cliente);
    this.showResults.set(false);
    this.searchTerm = cliente.nombreCompleto || '';
  }

  clearClient(): void {
    this.selectedClient.set(null);
    this.searchTerm = '';
    this.searchResults.set([]);
    this.showResults.set(false);
  }

  private initForm(): void {
    this.invoiceForm = this.fb.group({
      tipoDocumento: ['', Validators.required],
      medioPago: ['', Validators.required],
      observaciones: [''],
      totalAnticipado: [0, [Validators.min(0)]],
      aplicarDescuentoGlobal: [false],
      descuentos: this.fb.array([]),
      items: this.fb.array([]),
    });
  }

  private initNewProductForm(): void {
    this.newProductForm = this.fb.group({
      codigoUnidad: ['MTQ', Validators.required],
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      iva: [19, [Validators.required, Validators.min(0), Validators.max(100)]],
    });
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  get descuentos(): FormArray {
    return this.invoiceForm.get('descuentos') as FormArray;
  }

  private createItem(): FormGroup {
    return this.fb.group({
      tipoUnidad: ['MTQ', Validators.required],
      codigoProducto: ['', Validators.required],
      productoId: [''],
      descripcion: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [1, [Validators.required, Validators.min(1)]],
      iva: [19, Validators.required],
      nota: [''],
      total: [{ value: 0, disabled: true }],
    });
  }

  addItem(): void {
    const newItem = this.createItem();
    newItem.valueChanges.subscribe(() => {
      this.calculateItemTotal(newItem);
    });
    this.items.push(newItem);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
    this.calculateTotals();
  }

  private calculateItemTotal(itemForm: FormGroup): void {
    const cantidad = itemForm.get('cantidad')?.value || 0;
    const precioUnitario = itemForm.get('precioUnitario')?.value || 0;
    const iva = itemForm.get('iva')?.value || 0;

    // Cálculo: (cantidad * precio) + IVA
    const subtotal = cantidad * precioUnitario;
    const totalIva = subtotal * (iva / 100);
    const total = subtotal + totalIva;

    itemForm.get('total')?.setValue(total, { emitEvent: false });
    this.calculateTotals();
  }

  calculateTotals(): { subtotal: number; totalDescuentos: number; totalCargos: number; totalIva: number; total: number } {
    let subtotal = 0;

    // Calcular subtotal sin IVA
    this.items.controls.forEach((item) => {
      const cantidad = item.get('cantidad')?.value || 0;
      const precioUnitario = item.get('precioUnitario')?.value || 0;
      const itemSubtotal = cantidad * precioUnitario;
      subtotal += itemSubtotal;
    });

    // Calcular descuentos y cargos globales
    const descuentosGlobales = this.invoiceForm.get('descuentos')?.value || [];
    let totalDescuentos = 0;
    let totalCargos = 0;

    descuentosGlobales.forEach((desc: any) => {
      const porcentaje = desc.valor || 0;
      const valorMonetario = subtotal * (porcentaje / 100);
      if (desc.indCargo) {
        totalCargos += valorMonetario;
      } else {
        totalDescuentos += valorMonetario;
      }
    });

    // Aplicar descuentos y cargos al subtotal
    const subtotalConDescuentos = subtotal - totalDescuentos + totalCargos;

    // Calcular IVA sobre el subtotal con descuentos/cargos aplicados
    let totalIva = 0;
    this.items.controls.forEach((item) => {
      const cantidad = item.get('cantidad')?.value || 0;
      const precioUnitario = item.get('precioUnitario')?.value || 0;
      const iva = item.get('iva')?.value || 0;
      const itemSubtotal = cantidad * precioUnitario;

      // Aplicar proporción de descuento/cargo a cada item para calcular IVA
      const proporcion = subtotal > 0 ? itemSubtotal / subtotal : 0;
      const descuentoItem = totalDescuentos * proporcion;
      const cargoItem = totalCargos * proporcion;
      const baseImponible = itemSubtotal - descuentoItem + cargoItem;

      totalIva += baseImponible * (iva / 100);
    });

    return {
      subtotal,
      totalDescuentos,
      totalCargos,
      totalIva,
      total: subtotalConDescuentos + totalIva,
    };
  }

  onUnitTypeSelected(index: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const unitCode = select.value;

    // Solo limpiar el formulario del item, NO volver a consumir el endpoint
    const itemForm = this.items.at(index) as FormGroup;
    itemForm.patchValue({
      codigoProducto: '',
      productoId: '',
      descripcion: '',
    });
  }

  toggleCambioTipo(index: number): void {
    this.activeItemIndex.set(index);
    this.showCreateProductModal.set(true);
  }

  closeCreateProductModal(): void {
    this.showCreateProductModal.set(false);
    this.activeItemIndex.set(null);
    this.newProductForm.reset({
      codigoUnidad: 'MTQ',
      iva: 19,
    });
  }

  createNewProduct(): void {
    if (!this.newProductForm.valid) {
      this.toast.error('Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    const formValue = this.newProductForm.value;
    const newProduct: ProductDian = {
      iva: formValue.iva,
      codigoUnidad: formValue.codigoUnidad,
      nombre: formValue.nombre,
      descripcion: formValue.descripcion,
      activo: true,
      usuarioCreacion: this.usuario(),
    };

    this.invoiceService.createProductDian(newProduct).subscribe({
      next: (response) => {
        this.toast.success('Éxito', 'Producto creado exitosamente');

        const activeIndex = this.activeItemIndex();
        if (activeIndex !== null && response.response) {
          const itemForm = this.items.at(activeIndex) as FormGroup;
          itemForm.patchValue({

            codigoProducto: response.response.id,
            descripcion: response.response.descripcion || response.response.nombre,
            iva: response.response.iva || 19,
            tipoUnidad: response.response.codigoUnidad,
            activo: true,
            usuarioCreacion: this.usuario(),
          });
        }
        this.ProductCodesDian.reload();
        this.closeCreateProductModal();
      },
      error: (error) => {
        console.error('Error creando producto:', error);
        this.toast.error('Error', 'No se pudo crear el producto');
      }
    });
  }

  onProductSelected(index: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const productId = select.value;
    const product = this.ProductCodesDian.value()?.response?.find(
      (p) => p.id?.toString() === productId
    );

    if (product) {
      const itemForm = this.items.at(index) as FormGroup;
      itemForm.patchValue({
        productoId: product.id?.toString() || '',
        descripcion: product.descripcion || product.nombre,
        iva: product.iva || 19,
      });
    }
  }

  hasNonWaterProducts(): boolean {
    return this.items.controls.some(
      (item) => item.get('tipoUnidad')?.value !== 'MTQ'
    );
  }

  private createDescuento(): FormGroup {
    return this.fb.group({
      valor: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      indCargo: [false],
      codigoRazon: ['00', Validators.required],
      razon: ['', Validators.required],
    });
  }

  addDescuento(): void {
    this.descuentos.push(this.createDescuento());
  }

  removeDescuento(index: number): void {
    this.descuentos.removeAt(index);
  }

  getCodigoEstandar(): { idIdentificacion: string; id: string } | null {
    const params = this.ParamsGeneral.value()?.response;
    if (!params) return null;

    const codigoEstandar = params.find(
      (item: any) => item.codigoPadre === 'CODIGO_ESTANDAR_DIAN'
    );

    if (!codigoEstandar) return null;
    const codigoValue = codigoEstandar.codigo?.toString() || '';

    return {
      idIdentificacion: codigoValue,
      id: codigoValue,
    };
  }

  private buildInvoiceRequest(): any {
    const formValue = this.invoiceForm.getRawValue();
    const cliente = this.selectedClient();
    const empresaId = this.empresaId();
    const usuario = this.usuario();
    const codigoEstandar = this.getCodigoEstandar();

    if (!cliente || !empresaId) {
      console.error('Falta información de cliente o empresa');
      return null;
    }

    let subtotalTotal = 0;
    formValue.items.forEach((item: any) => {
      subtotalTotal += (item.cantidad || 0) * (item.precioUnitario || 0);
    });

    let descuentoPorcentaje = 0;
    let cargoPorcentaje = 0;

    if (formValue.aplicarDescuentoGlobal && formValue.descuentos.length > 0) {
      formValue.descuentos.forEach((desc: any) => {
        const porcentaje = desc.valor || 0;
        if (desc.indCargo) {
          cargoPorcentaje += porcentaje;
        } else {
          descuentoPorcentaje += porcentaje;
        }
      });
    }


    const productos = formValue.items.map((item: any) => {
      return {
        codigoEstandar: {
          id: item.productoId || '',
          idIdentificacion: codigoEstandar?.id || ''
        },
        precio: item.precioUnitario,
        descuento: descuentoPorcentaje,
        cargo: cargoPorcentaje,
        cantidad: item.cantidad,
        codigoUnidadMedida: item.tipoUnidad,
        iva: item.iva,
        nombre: item.descripcion,
        nota: item.nota || '',
      };
    });


    const request: any = {
      idEmpresa: empresaId,
      idCliente: cliente.id,
      productos: productos,
    };


    if (formValue.aplicarDescuentoGlobal && formValue.descuentos.length > 0) {
      request.descuentos = formValue.descuentos.map((desc: any) => ({
        indCargo: desc.indCargo,
        codigoRazon: (desc.codigoRazon || '00').trim(),
        razon: (desc.razon || '').trim(),
      }));
    }


    request.medioPago = {
      forma: formValue.medioPago,
      medio: formValue.tipoDocumento,
    };
    request.totalAnticipado = formValue.totalAnticipado || 0;
    request.usuario = usuario || 'sistema';

    return request;
  }

  submitInvoice(): void {
    if (!this.invoiceForm.valid || this.items.length === 0) {
      console.warn('Formulario inválido o sin items');
      return;
    }

    if (!this.selectedClient()) {
      console.warn('Debe seleccionar un cliente');
      return;
    }

    const request = this.buildInvoiceRequest();
    if (!request) {
      console.error('No se pudo construir el request');
      return;
    }

    this.invoiceService.SendInvoiceDianClient(request).subscribe({
      next: (response) => {
        this.toast.success('Exito', 'Factura creada y enviada a DIAN exitosamente.');
      },
      error: (error) => {
        console.error('Error al crear factura:', error);
      }
    });
  }
}
