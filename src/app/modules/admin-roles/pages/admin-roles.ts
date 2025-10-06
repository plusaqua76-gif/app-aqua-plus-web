import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigRolesService } from '../services/config-roles.service';
import { IRoleMenu } from '@interfaces/menu/IRoleMenu';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-admin-roles',
  imports: [CommonModule],
  template: `
    <section class="w-full bg-transparent text-gray-200 min-h-screen">
      <!-- Header -->
      <div class="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 z-10">
        <div class="mx-auto max-w-7xl px-4 py-6">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-white">Catálogo de Menús</h1>
              <p class="text-gray-400 text-sm mt-1">Visualiza todos los menús disponibles en el sistema</p>
            </div>
            <button
              type="button"
              (click)="dataRolMenus.reload()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <i class="fas fa-sync-alt"></i>
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      @if (dataRolMenus.isLoading()) {
        <div class="flex items-center justify-center py-20">
          <div class="text-center">
            <div class="w-12 h-12 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-400">Cargando configuración...</p>
          </div>
        </div>
      }

      <!-- Error State -->
      @if (dataRolMenus.error()) {
        <div class="flex items-center justify-center py-20">
          <div class="text-center">
            <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-exclamation-triangle text-red-400 text-xl"></i>
            </div>
            <h3 class="text-lg font-semibold text-red-200 mb-2">Error al cargar datos</h3>
            <p class="text-red-300 text-sm mb-4">No se pudieron cargar los menús y roles</p>
            <button
              type="button"
              (click)="dataRolMenus.reload()"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      }

      <!-- Main Content -->
      @if (dataRolMenus.value()?.success) {
        <div class="mx-auto max-w-7xl px-4 py-6">
          <!-- Cards de Menús -->
          <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            @for (menu of getMenusData(); track menu.id) {
              <div class="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-600/50 rounded-xl p-6 hover:border-gray-500/70 transition-all duration-300 hover:scale-[1.02] w-full">
                <!-- Header del Menú -->
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                    <i [class]="menu.icono + ' text-blue-400 text-lg'"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-white">{{ menu.etiqueta }}</h3>
                    <p class="text-xs text-gray-400">ID: {{ menu.id }}</p>
                  </div>
                </div>

                <!-- Información del Menú -->
                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-link text-blue-400 text-sm"></i>
                    <span class="text-sm text-gray-300">Ruta:</span>
                    <span class="text-sm text-white font-mono">/{{ menu.link }}</span>
                  </div>

                  <div class="flex items-center gap-2">
                    <i class="fas fa-code text-purple-400 text-sm"></i>
                    <span class="text-sm text-gray-300">Icono:</span>
                    <span class="text-sm text-gray-400 font-mono">{{ menu.icono }}</span>
                  </div>
                </div>

                <!-- Estado -->
                <div class="mt-4 pt-3 border-t border-gray-700/50">
                  <span class="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs border border-green-500/30">
                    • Disponible
                  </span>
                </div>
              </div>
            } @empty {
              <div class="col-span-full text-center py-12">
                <div class="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-bars text-gray-400 text-xl"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-300 mb-2">No hay menús configurados</h3>
                <p class="text-gray-500 text-sm">No se encontraron menús en el sistema</p>
              </div>
            }
          </div>
        </div>
      }
    </section>
  `,
})
export class AdminRoles  {


  private readonly configRolesService = inject(ConfigRolesService);

  constructor() {}

  dataRolMenus = rxResource({
    stream: () =>  this.configRolesService.getAllMenuRoles()
  })

  getMenusData() {
    const data = this.dataRolMenus.value();
    if (!data?.success || !data.response) return [];

    const menus = data.response as any[];
    return menus.filter(menu => menu?.id && menu?.etiqueta);
  }
}
