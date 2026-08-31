import { ColombianCurrencyPipe } from '@shared/pipes/colombian-currency.pipe';
import { UserService } from './../../modules/auth/service/user.service';
import {
  Component,
  inject,
  HostListener,
  input,
  PLATFORM_ID,
  computed,
  effect,
  signal,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, map, of } from 'rxjs';
import { BreadcrumbService } from '@services/breadcrumb.service';
import { PopupComponent } from '@shared/components/popUp';
import { FacturaColillasPagosService } from '@services/factura-colillas-pagos.service';
import {
  PagoItem,
  ColillasPayload,
  ApiResponseValidacionColillas,
  DetalleValidacionColilla,
} from '@interfaces/bill/colilla';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, PopupComponent, ColombianCurrencyPipe],
  template: `
    <nav
      class="fixed top-0 z-[999] bg-white/70 dark:bg-gray-900/60 backdrop-blur-md  transition-all duration-300"
      [style.left]="
        screenWidth() > 768 ? (collapsed() ? '16.5625rem' : '5rem') : '0'
      "
      [style.width]="
        screenWidth() > 768
          ? 'calc(100% - ' + (collapsed() ? '16.5625rem' : '5rem') + ')'
          : '100%'
      "
    >
      @let user = dataUser.value();
      <div
        class="flex items-center justify-end md:justify-between h-16 pr-6 pl-6 gap-4"
      >
        <!-- Breadcrumb Section -->
        <div
          class="hidden md:flex items-center flex-1 min-w-0 overflow-hidden"
          [class.mt-[86px]]="screenWidth() <= 768"
        >
          @if (
            breadcrumbService.breadcrumbs().length > 0 &&
            !router.url.includes('welcome-user')
          ) {
            <nav class="flex w-full min-w-0" aria-label="Breadcrumb">
              <ol
                class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse flex-wrap"
              >
                @for (item of breadcrumbService.breadcrumbs(); track $index) {
                  <li
                    [class]="$index === 0 ? 'inline-flex items-center' : ''"
                    class="flex-shrink-0"
                  >
                    @if ($index === 0) {
                      @if (!item.isActive) {
                        <a
                          [routerLink]="item.url"
                          class="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                        >
                          <svg
                            class="w-3 h-3 me-2.5 text-gray-600 dark:text-gray-400 flex-shrink-0"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"
                            />
                          </svg>
                          <span class="truncate max-w-[150px]">{{
                            item.label
                          }}</span>
                        </a>
                      } @else {
                        <span
                          class="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                          <svg
                            class="w-3 h-3 me-2.5 text-gray-500 dark:text-gray-400 flex-shrink-0"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"
                            />
                          </svg>
                          <span class="truncate max-w-[150px]">{{
                            item.label
                          }}</span>
                        </span>
                      }
                    } @else {
                      <div class="flex items-center flex-shrink-0">
                        <svg
                          class="rtl:rotate-180 w-3 h-3 text-gray-400 dark:text-gray-500 mx-1 flex-shrink-0"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 6 10"
                        >
                          <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="m1 9 4-4-4-4"
                          />
                        </svg>
                        @if (!item.isActive) {
                          <a
                            [routerLink]="item.url"
                            class="ms-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 md:ms-2 transition-colors duration-200"
                          >
                            <span class="truncate max-w-[150px] inline-block">{{
                              item.label
                            }}</span>
                          </a>
                        } @else {
                          <span
                            class="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2"
                            aria-current="page"
                          >
                            <span class="truncate max-w-[150px] inline-block">{{
                              item.label
                            }}</span>
                          </span>
                        }
                      </div>
                    }
                  </li>
                }
              </ol>
            </nav>
          }
        </div>

        <!-- User Section -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <!-- Input file oculto -->
          <input
            #fileInput
            type="file"
            accept=".xlsx, .xls"
            class="hidden"
            (change)="onFileSelected($event)"
          />
          <div class="relative h-10 w-10 flex-shrink-0">

            <div
              class="absolute top-0 left-0 flex flex-col z-50"
              (mouseenter)="openActionsMenu()"
              (mouseleave)="closeActionsMenu()"
            >
          <button
            type="button"
            class="flex items-center justify-center w-10 h-10
                  bg-white/10 dark:bg-slate-800/20
                  backdrop-blur-[35px] border border-white/20
                  text-white rounded-full shadow-md"
          >
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>


          <button
            type="button"
            (click)="triggerFileInput()"
            class="group/item flex items-center w-9 hover:w-[9rem] px-2 hover:px-3
                  bg-white/10 dark:bg-slate-800/20
                  backdrop-blur-[35px] border border-white/20
                  text-white rounded-full overflow-hidden cursor-pointer
                  transition-all duration-300 ease-out"
            [style.height]="isActionsDropdownOpen() ? '2.25rem' : '0'"
            [style.margin-top]="isActionsDropdownOpen() ? '0.4rem' : '0'"
            [style.opacity]="isActionsDropdownOpen() ? '1' : '0'"
            [class.pointer-events-none]="!isActionsDropdownOpen()"
          >
            <div class="flex items-center justify-center min-w-[20px]
                        transition-transform duration-300 ease-in-out
                        group-hover/item:-translate-x-1">
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2M12 4v12m0-12 4 4m-4-4L8 8"/>
              </svg>
            </div>

            <span class="ml-2 whitespace-nowrap opacity-0 -translate-x-3
                        group-hover/item:opacity-100 group-hover/item:translate-x-0
                        transition-all duration-300 ease-in-out
                        text-xs font-medium">
              Cargar colillas
            </span>
          </button>

          <button
            type="button"
            (click)="downloadColillasTemplate()"
            class="group/item flex items-center w-9 hover:w-[11rem] px-2 hover:px-3
                  bg-white/10 dark:bg-slate-800/20
                  backdrop-blur-[35px] border border-white/20
                  text-white rounded-full overflow-hidden cursor-pointer
                  transition-all duration-300 ease-out"
            [style.height]="isActionsDropdownOpen() ? '2.25rem' : '0'"
            [style.margin-top]="isActionsDropdownOpen() ? '0.4rem' : '0'"
            [style.opacity]="isActionsDropdownOpen() ? '1' : '0'"
            [class.pointer-events-none]="!isActionsDropdownOpen()"
            title="Descargar plantilla Excel"
          >
            <div class="flex items-center justify-center min-w-[20px]
                        transition-transform duration-300 ease-in-out
                        group-hover/item:-translate-x-1">
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 10v6m0 0-3-3m3 3 3-3M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2M12 4v6"/>
              </svg>
            </div>

            <span class="ml-2 whitespace-nowrap opacity-0 -translate-x-3
                        group-hover/item:opacity-100 group-hover/item:translate-x-0
                        transition-all duration-300 ease-in-out
                        text-xs font-medium">
              Descargar plantilla
            </span>
          </button>

            </div>
          </div>
          <button
            #dropdownButton
            id="dropdownAvatarNameButton"
            (click)="toggleDropdown()"
            class="flex items-center text-sm pe-1 font-medium text-gray-900 rounded-full hover:text-blue-600 dark:hover:text-blue-500 md:me-0 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-white transition-all duration-200"
            type="button"
          >
            <span class="sr-only">Open user menu</span>
            <span>{{ user?.nombre || 'Usuario' }}</span>
            <svg
              class="w-2.5 h-2.5 ms-3 transition-transform duration-200"
              [class.rotate-180]="isDropdownOpen()"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>
          <div
            #dropdownMenu
            id="dropdownAvatarName"
            class="z-10 absolute top-14 right-6 bg-white/90 dark:bg-gray-800/95 backdrop-blur-lg divide-y divide-gray-200/50 dark:divide-gray-600/30 rounded-xl shadow-2xl w-56 border border-gray-200/50 dark:border-gray-600/50"
            [class.hidden]="!isDropdownOpen()"
          >
            <div class="px-4 py-3 text-sm text-gray-900 dark:text-white">
              <div class="flex items-center gap-2">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <div class="font-medium">{{ user?.nombre || 'Usuario' }}</div>
              </div>
            </div>
            <ul class="py-2 text-sm" aria-labelledby="dropdownAvatarNameButton">
              <li>
                <a
                  [routerLink]="['profile']"
                  (click)="closeDropdown()"
                  class="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                >
                  <svg
                    class="w-4 h-4 text-gray-500 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Mi Perfil</span>
                </a>
              </li>
            </ul>
            <div class="py-2">
              <button
                (click)="logout()"
                class="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50/60 dark:hover:bg-red-600/10 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Wrapper para el popup - Asegura posicionamiento correcto -->
    @defer (when isValidationPopupOpen()) {
      <div class="relative">
        <app-pop-up
          [open]="isValidationPopupOpen"
          [title]="validationTitle()"
          [maxWidth]="'max-w-4xl'"
          [contentPadding]="'p-0'"
        >
      @if (validationResult()) {
        <div class="p-6">
          <!-- Resumen -->
          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {{ validationResult()!.response.totalRegistros }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Total Registros
              </div>
            </div>
            <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div
                class="text-2xl font-bold text-green-600 dark:text-green-400"
              >
                {{ validationResult()!.response.pagosCompletos }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Pagos Completos
              </div>
            </div>
            <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div
                class="text-2xl font-bold text-yellow-600 dark:text-yellow-400"
              >
                {{ validationResult()!.response.pagosParcialesAbono }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Pagos Parciales
              </div>
            </div>
            <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div class="text-2xl font-bold text-red-600 dark:text-red-400">
                {{ validationResult()!.response.registrosConError }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Con Errores
              </div>
            </div>
          </div>

          <!-- Detalle de registros -->
          @if (validationResult()!.response.detalle.length > 0) {
            <div class="space-y-4">
              <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Detalle de Validaciones
              </h4>
              <div class="max-h-96 overflow-y-auto space-y-4">
                @for (detalle of validationResult()!.response.detalle;track detalle.idFactura) {
                  <!-- PAGO COMPLETO -->
                  @if (detalle.estado.nombre === 'PAGO COMPLETO') {
                    <div class="bg-green-500/10 border border-green-500/20 dark:border-green-500/30 rounded-xl p-4 space-y-2">
                      <div class="flex justify-between items-start">
                        <div class="flex items-center gap-2">
                          <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h3 class="text-sm font-semibold text-white">
                            Factura #{{ detalle.idFactura }}
                          </h3>
                        </div>
                        <span class="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/30">
                          {{ detalle.estado.nombre }}
                        </span>
                      </div>

                      <p class="text-sm text-slate-300">
                        {{ detalle.mensaje }}
                      </p>

                      @if (detalle.valorFactura !== null || detalle.valorPago !== null) {
                        <div class="flex gap-6 text-xs text-slate-400">
                          @if (detalle.valorFactura !== null) {
                            <span>Factura: <span class="text-white">{{  detalle.valorFactura | colombianCurrency }}</span></span>
                          }
                          @if (detalle.valorPago !== null) {
                            <span>Pago: <span class="text-white">{{  detalle.valorPago | colombianCurrency }}</span></span>
                          }
                        </div>
                      }
                    </div>
                  }

                  <!-- PAGO PARCIAL -->
                  @if (detalle.estado.nombre === 'PAGO PARCIAL') {
                    <div class="bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 rounded-xl p-4 space-y-2">
                      <div class="flex justify-between items-start">
                        <div class="flex items-center gap-2">
                          <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01" />
                          </svg>
                          <h3 class="text-sm font-semibold text-white">
                            Factura #{{ detalle.idFactura }}
                          </h3>
                        </div>
                        <span class="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          {{ detalle.estado.nombre }}
                        </span>
                      </div>

                      <p class="text-sm text-slate-300">
                        {{ detalle.mensaje }}
                      </p>

                      @if (detalle.valorFactura !== null || detalle.valorPago !== null) {
                        <div class="flex gap-6 text-xs text-slate-400">
                          @if (detalle.valorFactura !== null) {
                            <span>Factura: <span class="text-white">{{  detalle.valorFactura | colombianCurrency }}</span></span>
                          }
                          @if (detalle.valorPago !== null) {
                            <span>Pago: <span class="text-white">{{  detalle.valorPago | colombianCurrency }}</span></span>
                          }
                          @if (detalle.valorPendiente !== null) {
                            <span>Pendiente: <span class="text-amber-400">{{  detalle.valorPendiente | colombianCurrency }}</span></span>
                          }
                        </div>
                      }
                    </div>
                  }

                  <!-- PENDIENTE / ERROR -->
                  @if (detalle.estado.nombre === 'PENDIENTE') {
                    <div class="bg-red-500/10 border border-red-500/20 dark:border-red-500/30 rounded-xl p-4 space-y-2">
                      <div class="flex justify-between items-start">
                        <div class="flex items-center gap-2">
                          <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86l-7.2 12.48A2 2 0 004.8 19h14.4a2 2 0 001.71-2.66l-7.2-12.48a2 2 0 00-3.42 0z" />
                          </svg>
                          <h3 class="text-sm font-semibold text-white">
                            Factura #{{ detalle.idFactura }}
                          </h3>
                        </div>
                        <span class="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
                          {{ detalle.estado.nombre }}
                        </span>
                      </div>

                      <p class="text-sm text-slate-300">
                        {{ detalle.mensaje }}
                      </p>

                      @if (detalle.valorPago !== null) {
                        <p class="text-xs text-slate-400">
                          Valor pago: <span class="text-white">{{  detalle.valorPago | colombianCurrency }}</span>
                        </p>
                      }
                    </div>
                  }
                }
              </div>
            </div>
          }

          <!-- Mensaje de información -->
          @if (
            validationResult()!.response.registrosConError > 0 ||
            validationResult()!.response.pagosParcialesAbono > 0
          ) {
            <div
              class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <div class="flex items-start gap-3">
                <svg
                  class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div class="text-sm text-blue-800 dark:text-blue-300">
                  <p class="font-semibold mb-1">Importante:</p>
                  <p>
                    Por favor revise los registros con errores o pagos parciales
                    antes de continuar. Los pagos parciales generarán deudas por
                    el saldo restante.
                  </p>
                </div>
              </div>
            </div>
          }

          <!-- Botones de acción -->
          <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              (click)="closeValidationPopup()"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 transition-colors"
            >
              Cancelar
            </button>
            @if (
              validationResult()!.response.pagosCompletos > 0 ||
              validationResult()!.response.pagosParcialesAbono > 0
            ) {
              <button
                type="button"
                (click)="openConfirmProcessPopup()"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors"
              >
                Procesar Pagos
              </button>
            }
          </div>
        </div>
      } @else {
        <div class="p-6 text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
          ></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">
            Validando colillas...
          </p>
        </div>
      }
        </app-pop-up>
      </div>
    } @placeholder {
      <!-- Placeholder opcional mientras se carga el popup -->
    }

    <!-- Popup de confirmación de procesamiento -->
    @defer (when isConfirmProcessPopupOpen()) {
      <div class="relative">
        <app-pop-up
          [open]="isConfirmProcessPopupOpen"
          [title]="'Confirmar Procesamiento de Pagos'"
          [maxWidth]="'max-w-lg'"
        >
          <div class="p-6">
            <div class="flex items-start gap-4 mb-6">
              <div class="flex-shrink-0">
                <svg
                  class="w-12 h-12 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  ¿Está seguro de procesar estos pagos?
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Esta acción procesará todos los pagos válidos y generará las deudas
                  correspondientes para los pagos parciales. Esta operación no se puede deshacer.
                </p>

                @if (validationResult()) {
                  <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <ul class="space-y-2 text-sm">
                      <li class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-gray-700 dark:text-gray-300">
                          <strong>{{ validationResult()!.response.pagosCompletos }}</strong> pagos completos
                        </span>
                      </li>
                      <li class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-gray-700 dark:text-gray-300">
                          <strong>{{ validationResult()!.response.pagosParcialesAbono }}</strong> pagos parciales
                        </span>
                      </li>
                      <li class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-gray-700 dark:text-gray-300">
                          Total: <strong>{{ validationResult()!.response.totalRegistros }}</strong> registros
                        </span>
                      </li>
                    </ul>
                  </div>
                }
              </div>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                (click)="cancelProcessPayments()"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="confirmProcessPayments()"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors"
              >
                Confirmar y Procesar
              </button>
            </div>
          </div>
        </app-pop-up>
      </div>
    }

    <!-- Popup de resultado del procesamiento -->
    @defer (when isProcessResultPopupOpen()) {
      <div class="relative">
        <app-pop-up
          [open]="isProcessResultPopupOpen"
          [title]="processResult()?.success ? 'Procesamiento Exitoso' : 'Resultado del Procesamiento'"
          [maxWidth]="'max-w-3xl'"
          [contentPadding]="'p-0'"
        >
          @if (processResult()) {
            <div class="p-6">
              <!-- Mensaje de éxito/error -->
              @if (processResult()!.success) {
                <div class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div class="flex items-start gap-3">
                    <svg
                      class="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p class="font-semibold text-green-800 dark:text-green-300">
                        {{ processResult()!.message }}
                      </p>
                      <p class="text-sm text-green-700 dark:text-green-400 mt-1">
                        Los pagos se han procesado correctamente.
                      </p>
                    </div>
                  </div>
                </div>
              } @else {
                <div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div class="flex items-start gap-3">
                    <svg
                      class="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p class="font-semibold text-red-800 dark:text-red-300">
                        {{ processResult()!.message }}
                      </p>
                    </div>
                  </div>
                </div>
              }

              <!-- Resumen del procesamiento -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {{ processResult()!.response.totalRegistros }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    Total Procesados
                  </div>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                    {{ processResult()!.response.pagosCompletos }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    Pagos Completos
                  </div>
                </div>
                <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {{ processResult()!.response.pagosParcialesAbono }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    Pagos Parciales
                  </div>
                </div>
                <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div class="text-2xl font-bold text-red-600 dark:text-red-400">
                    {{ processResult()!.response.registrosConError }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    Con Errores
                  </div>
                </div>
              </div>

              <!-- Detalle de procesamiento -->


              <!-- Botón para cerrar -->
              <div class="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  (click)="closeProcessResultPopup()"
                  class="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          } @else {
            <div class="p-6 text-center">
              <div
                class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
              ></div>
              <p class="mt-4 text-gray-600 dark:text-gray-400">
                Procesando pagos...
              </p>
            </div>
          }
        </app-pop-up>
      </div>
    }



  `,
  styles: [`
    :host ::ng-deep app-pop-up #overlay {
      z-index: 998 !important;
    }
  `],
})
export class Header {
  @ViewChild('dropdownButton') dropdownButton!: ElementRef;
  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Estado del dropdown
  isDropdownOpen = signal<boolean>(false);

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 0;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.dropdownButton && this.dropdownMenu) {
      const target = event.target as HTMLElement;
      const isClickInsideButton =
        this.dropdownButton.nativeElement.contains(target);
      const isClickInsideMenu =
        this.dropdownMenu.nativeElement.contains(target);

      if (!isClickInsideButton && !isClickInsideMenu) {
        this.closeDropdown();
      }
    }
  }
  readonly router = inject(Router);
  readonly userService = inject(UserService);
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly breadcrumbService = inject(BreadcrumbService);
  readonly colillasService = inject(FacturaColillasPagosService);

  collapsed = input<boolean>(false);
  screenWidth = input<number>(0);
  isScrolled = false;
  isValidationPopupOpen = signal<boolean>(false);
  validationResult = signal<ApiResponseValidacionColillas | null>(null);
  validationTitle = computed(() => {
    const result = this.validationResult();
    if (!result) return 'Validando Colillas...';
    return result.success ? 'Resultado de Validación' : 'Error en Validación';
  });

  // Para el popup de confirmación de procesamiento
  isConfirmProcessPopupOpen = signal<boolean>(false);
  colillasToProcess = signal<PagoItem[]>([]);

  // Para el resultado del procesamiento
  isProcessResultPopupOpen = signal<boolean>(false);
  processResult = signal<ApiResponseValidacionColillas | null>(null);

  isActionsDropdownOpen = signal<boolean>(false);
  private actionsMenuTimer: ReturnType<typeof setTimeout> | null = null;

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

  readonly userId = computed(() => {
    const data = this.userData();
    return data?.id || null;
  });

  readonly usuario = computed(() => {
    const data = this.userData();
    return data?.nombre || '';
  });

  dataUser = rxResource({
    params: () => ({ enterpriseId: this.userId() }),
    stream: ({ params }) => {
      const { enterpriseId } = params;
      if (!enterpriseId) {
        console.warn('No enterprise ID available for bills');
        return of(null);
      }
      return this.userService
        .getUserSignal(enterpriseId)
        .pipe(map((apiResponse) => apiResponse.response));
    },
  });

  // Métodos para controlar el dropdown
  toggleDropdown(): void {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  openDropdown(): void {
    this.isDropdownOpen.set(true);
  }

  openActionsMenu(): void {
    if (this.actionsMenuTimer) {
      clearTimeout(this.actionsMenuTimer);
      this.actionsMenuTimer = null;
    }
    this.isActionsDropdownOpen.set(true);
  }

  closeActionsMenu(): void {
    this.actionsMenuTimer = setTimeout(() => {
      this.isActionsDropdownOpen.set(false);
      this.actionsMenuTimer = null;
    }, 150);
  }

  logout() {
    this.closeDropdown();
    sessionStorage.clear();
    this.router.navigate(['/welcome']);
  }

  // Métodos para cargar Excel
  triggerFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    } else {
      console.error('fileInput no está definido');
    }
  }

  async downloadColillasTemplate(): Promise<void> {
    try {
      const XLSX = await import('xlsx');
      const rows = [
        { idFactura: '', valorPago: '' },
        { idFactura: 12345, valorPago: 50000 },
      ];
      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet['!cols'] = [{ wch: 14 }, { wch: 14 }];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Colillas');
      XLSX.writeFile(workbook, 'plantilla-cargue-colillas.xlsx');
    } catch (error) {
      console.error('Error al generar la plantilla de colillas:', error);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = async (e: ProgressEvent<FileReader>) => {
      try {
        const XLSX = await import('xlsx');
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        this.processExcelData(jsonData);
      } catch (error) {
        console.error('Error al procesar el archivo Excel:', error);
      }
    };

    reader.onerror = (error) => {
      console.error('Error al leer el archivo:', error);
    };

    reader.readAsBinaryString(file);
    input.value = '';
  }

  processExcelData(data: any[]): void {
    if (!data || data.length === 0) {
      console.error('No hay datos para procesar');
      return;
    }

    const sessionData = this.userData();
    const idEmpresa = Number(sessionData?.empresaId ?? 0);
    const usuarioCreacion: string = sessionData?.nombre ?? '';

    const pagos: PagoItem[] = data.map((row: any) => ({
      idFactura: Number(row.idFactura || row.IdFactura || row.IDFACTURA || 0),
      valorPago: Number(row.valorPago || row.ValorPago || row.VALORPAGO || 0),
    }));

    this.colillasToProcess.set(pagos);
    this.isValidationPopupOpen.set(true);
    this.validationResult.set(null);

    const payload: ColillasPayload = { idEmpresa, usuarioCreacion, pagos };

    this.colillasService.getValidationsBill(payload).subscribe({
      next: (response) => {
        this.validationResult.set(response);
      },
      error: (error) => {
        console.error('Error al validar colillas:', error);
        this.validationResult.set({
          success: false,
          message:
            'Error al validar las colillas. Por favor intente nuevamente.',
          code: 500,
          response: {
            totalRegistros: 0,
            pagosCompletos: 0,
            pagosParcialesAbono: 0,
            registrosConError: 0,
            detalle: [],
          },
        });
      },
    });
  }

  openConfirmProcessPopup(): void {
    this.isValidationPopupOpen.set(false);
    this.isConfirmProcessPopupOpen.set(true);
  }

  cancelProcessPayments(): void {
    this.isConfirmProcessPopupOpen.set(false);
    this.isValidationPopupOpen.set(true);
  }

  confirmProcessPayments(): void {
    const pagos = this.colillasToProcess();

    if (!pagos || pagos.length === 0) {
      console.error('No hay colillas para procesar');
      return;
    }

    const sessionData = this.userData();
    const payload: ColillasPayload = {
      idEmpresa: Number(sessionData?.empresaId ?? 0),
      usuarioCreacion: sessionData?.nombre ?? '',
      pagos,
    };

    this.isConfirmProcessPopupOpen.set(false);
    this.isProcessResultPopupOpen.set(true);
    this.processResult.set(null);

    this.colillasService.processPayments(payload).subscribe({
      next: (response) => {
        this.processResult.set(response);
      },
      error: (error) => {
        console.error('Error al procesar pagos:', error);
        this.processResult.set({
          success: false,
          message:
            'Error al procesar los pagos. Por favor intente nuevamente.',
          code: 500,
          response: {
            totalRegistros: 0,
            pagosCompletos: 0,
            pagosParcialesAbono: 0,
            registrosConError: 0,
            detalle: [],
          },
        });
      },
    });
  }

  closeProcessResultPopup(): void {
    this.isProcessResultPopupOpen.set(false);
    this.processResult.set(null);
    this.validationResult.set(null);
    this.colillasToProcess.set([]);
  }

  closeValidationPopup(): void {
    this.isValidationPopupOpen.set(false);
    this.validationResult.set(null);
  }
}
