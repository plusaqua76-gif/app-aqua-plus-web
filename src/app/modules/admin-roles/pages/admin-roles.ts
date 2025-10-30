import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigRolesService } from '../services/config-roles.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, of } from 'rxjs';
import { TableComponent } from '@components/table';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-admin-roles',
  imports: [CommonModule, TableComponent, FormsModule],
  template: `
    <ng-template #actionsTemplate let-row>
      <div class="flex items-center space-x-2">
        <button
          type="button"
          (click)="handleTableAction({ action: 'roles', row })"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-green-600/50 text-green-500 hover:bg-green-600/10 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-colors duration-200 cursor-pointer"
          title="Editar rol del usuario"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    </ng-template>

    <app-table-dynamic
      [title]="title()"
      [columns]="userColumns()"
      [serverMode]="false"
      [datasource]="usersData()"
      [loading]="serverUsersData.isLoading()"
      [actionTemplate]="actionsTemplate"
      [showAddButton]="true"
      [addButtonText]="'Agregar Rol'"
      [showExportButton]="true"
      [exportFileName]="exportFileName()"
      [showColumnFilters]="true"
      (action)="handleTableAction($event)"
    >
    </app-table-dynamic>

    <!-- Modal para gestionar roles -->
    @if (mostrarModalRoles()) {
      <div class="fixed inset-0 z-[1002] flex items-center justify-center p-2 sm:p-4 pt-16 sm:pt-20">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" (click)="cerrarModalRoles()"></div>

        <div class="relative w-full max-w-2xl max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-6rem)] flex flex-col bg-black/10 backdrop-blur-xl border-2 border-white/10 rounded-2xl sm:rounded-3xl shadow-xl" (click)="$event.stopPropagation()">

          <!-- Header fijo -->
          <div class="flex-shrink-0 relative p-4 sm:p-6 pb-2 sm:pb-4 border-b border-white/10">
            <!-- Botón de cerrar -->
            <button
              (click)="cerrarModalRoles()"
              aria-label="Close"
              class="absolute top-2 right-2 sm:top-3 sm:right-3 h-8 w-8 grid place-content-center text-gray-400 hover:bg-white/10 rounded-lg backdrop-blur-sm z-10"
            >
              <svg class="h-3 w-3" viewBox="0 0 14 14" fill="none">
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
            </button>

            <!-- Título del modal -->
            <h3 class="text-lg sm:text-xl font-semibold text-white text-center pr-8">
              Editar rol - {{ usuarioSeleccionado()?.nombre }}
            </h3>

            <!-- Información del usuario -->
            @if (usuarioSeleccionado()) {
              <div class="mt-4 p-3 sm:p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <span class="text-gray-300">Usuario:</span>
                    <span class="text-white ml-2">{{ usuarioSeleccionado()!.username }}</span>
                  </div>
                  <div>
                    <span class="text-gray-300">Cédula:</span>
                    <span class="text-white ml-2">{{ usuarioSeleccionado()!.numeroCedula }}</span>
                  </div>
                  <div class="sm:col-span-2">
                    <span class="text-gray-300">Rol Actual:</span>
                    <span class="text-white ml-2">{{ usuarioSeleccionado()!.rolNombre }}</span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Contenido con scroll -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 pt-2 sm:pt-4">
            <!-- Selector de nuevo rol -->
            <div class="mb-6">
              <label for="nuevoRol" class="block text-sm font-medium text-gray-300 mb-3">
                Cambiar Rol
              </label>
              @if (allRolesData.isLoading()) {
                <div class="flex items-center justify-center py-3">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                  <span class="ml-2 text-sm text-gray-400">Cargando roles...</span>
                </div>
              } @else if (allRolesData.error()) {
                <div class="text-center py-3">
                  <div class="text-red-400 text-sm mb-2">Error al cargar los roles</div>
                  <button
                    (click)="allRolesData.reload()"
                    class="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Reintentar
                  </button>
                </div>
              } @else {
                <select
                  id="nuevoRol"
                  [(ngModel)]="rolSeleccionado"
                  class="w-full px-3 sm:px-4 py-2 sm:py-3 bg-transparent border border-gray-600/70 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 text-sm"
                >
                  <option value="" class="bg-gray-800 text-gray-300">Seleccionar nuevo rol...</option>
                  @for (rol of availableRoles(); track rol.id) {
                    <option [value]="rol.id" class="bg-gray-800 text-white">{{ rol.nombre }}</option>
                  }
                </select>
              }
            </div>

            <!-- Lista de menús y roles -->
            <div class="space-y-4">
              <h4 class="text-base sm:text-lg font-medium text-gray-200 border-b border-gray-600/50 pb-2">
                Menús Asignados al Rol
              </h4>

              @if (roleMenuData.isLoading()) {
                <div class="flex justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                </div>
              } @else if (roleMenuData.error()) {
                <div class="text-center py-8">
                  <svg class="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-yellow-300">Usuario sin acceso a módulos</h3>
                  <p class="mt-1 text-sm text-gray-400">Este usuario no tiene acceso a ningún módulo del sistema.</p>
                </div>
              } @else if (menuItems().length === 0) {
                <div class="text-center py-8">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-300">Sin menús asignados</h3>
                  <p class="mt-1 text-sm text-gray-400">Este rol no tiene menús asignados actualmente.</p>
                </div>
              } @else {
                <div class="space-y-3 max-h-80 overflow-y-auto">
                  @for (item of menuItems(); track item.id) {
                    <div class="rounded-lg border border-gray-600/70 bg-white/5 p-3 sm:p-4 hover:bg-white/10 transition-colors">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                          <!-- Icono del menú -->
                          <div class="flex-shrink-0">
                            <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                              <svg class="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                            </div>
                          </div>
                          <!-- Información del menú -->
                          <div>
                            <h5 class="text-xs sm:text-sm font-medium text-white">{{ item.menu.etiqueta }}</h5>
                          </div>
                        </div>
                        <!-- Badge del rol -->
                        <span class="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                          {{ item.rol.nombre }}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Footer fijo con botones -->
          <div class="flex-shrink-0 p-4 sm:p-6 pt-2 sm:pt-4 border-t border-white/10">
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                (click)="cerrarModalRoles()"
                class="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-gray-300 bg-transparent border border-gray-600/70 rounded-lg hover:bg-gray-600/10 focus:outline-none focus:ring-2 focus:ring-gray-500/40 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="cambiarRolUsuario()"
                [disabled]="!rolSeleccionado() || rolSeleccionado() === usuarioSeleccionado()?.rolId?.toString()"
                class="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Modal para agregar nuevo rol -->
    @if (mostrarModalAgregarRol()) {
      <div class="fixed inset-0 z-[1002] flex items-center justify-center p-2 sm:p-4 pt-16 sm:pt-20">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" (click)="cerrarModalAgregarRol()"></div>

        <div class="relative w-full max-w-3xl max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-6rem)] flex flex-col bg-black/10 backdrop-blur-xl border-2 border-white/10 rounded-2xl sm:rounded-3xl shadow-xl" (click)="$event.stopPropagation()">

          <!-- Header fijo -->
          <div class="flex-shrink-0 relative p-4 sm:p-6 pb-2 sm:pb-4 border-b border-white/10">
            <!-- Botón de cerrar -->
            <button
              (click)="cerrarModalAgregarRol()"
              aria-label="Close"
              class="absolute top-2 right-2 sm:top-3 sm:right-3 h-8 w-8 grid place-content-center text-gray-400 hover:bg-white/10 rounded-lg backdrop-blur-sm z-10"
            >
              <svg class="h-3 w-3" viewBox="0 0 14 14" fill="none">
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
            </button>

            <!-- Título del modal -->
            <h3 class="text-lg sm:text-xl font-semibold text-white text-center pr-8">
              Crear Nuevo Rol
            </h3>
          </div>

          <!-- Contenido con scroll -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 pt-2 sm:pt-4">
            <div class="space-y-6">
              <!-- Campo nombre del rol -->
              <div>
                <label for="nombreRol" class="block text-sm font-medium text-gray-300 mb-2">
                  Nombre del Rol
                </label>
                <input
                  id="nombreRol"
                  type="text"
                  [(ngModel)]="nombreNuevoRol"
                  placeholder="Ingrese el nombre del rol..."
                  class="w-full px-3 sm:px-4 py-2 sm:py-3 bg-transparent border border-gray-600/70 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 text-sm"
                />
              </div>

              <!-- Selección de menús -->
              <div>
                <h4 class="text-base sm:text-lg font-medium text-gray-200 mb-4">
                  Permisos de Acceso
                </h4>
                <p class="text-xs sm:text-sm text-gray-400 mb-4">
                  Seleccione los módulos a los que tendrá acceso este rol:
                </p>

                @if (allMenusData.isLoading()) {
                  <div class="flex justify-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  </div>
                } @else if (allMenusData.error()) {
                  <div class="text-center py-8">
                    <div class="text-red-400 mb-2 text-sm">Error al cargar los menús</div>
                    <button
                      (click)="allMenusData.reload()"
                      class="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Reintentar
                    </button>
                  </div>
                } @else if (availableMenus().length === 0) {
                  <div class="text-center py-8">
                    <p class="text-gray-400 text-sm">No hay menús disponibles</p>
                  </div>
                } @else {
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-64 sm:max-h-80 overflow-y-auto">
                    @for (menu of availableMenus(); track menu.id) {
                      <div
                        class="flex items-center p-2 sm:p-3 rounded-lg border border-gray-600/70 hover:bg-white/5 transition-colors cursor-pointer"
                        (click)="toggleMenuSelection(menu.id)"
                      >
                        <div class="flex items-center w-full">
                          <input
                            type="checkbox"
                            [checked]="isMenuSelected(menu.id)"
                            (change)="toggleMenuSelection(menu.id)"
                            class="w-4 h-4 text-blue-600 bg-transparent border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <div class="ml-2 sm:ml-3 flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                            <!-- Icono del menú -->
                            <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                              <svg class="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                            </div>

                            <!-- Información del menú -->
                            <div class="min-w-0 flex-1">
                              <h5 class="text-xs sm:text-sm font-medium text-white truncate">{{ menu.etiqueta }}</h5>
                              <!-- <p class="text-xs text-gray-400 truncate">{{ menu.link }}</p> -->
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Resumen de selección -->
                  <div class="mt-4 p-2 sm:p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p class="text-xs sm:text-sm text-blue-300">
                      <strong>{{ menusSeleccionados().length }}</strong> menús seleccionados de <strong>{{ availableMenus().length }}</strong> disponibles
                    </p>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Footer fijo con botones -->
          <div class="flex-shrink-0 p-4 sm:p-6 pt-2 sm:pt-4 border-t border-white/10">
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="button"
                (click)="cerrarModalAgregarRol()"
                class="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-gray-300 bg-transparent border border-gray-600/70 rounded-lg hover:bg-gray-600/10 focus:outline-none focus:ring-2 focus:ring-gray-500/40 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="crearNuevoRol()"
                [disabled]="!nombreNuevoRol().trim() || menusSeleccionados().length === 0"
                class="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear Rol
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminRoles {
  private readonly configRolesService = inject(ConfigRolesService);
  private readonly toastService = inject(ToastService);
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

  title = signal('Gestión de Usuarios y Roles');
  mostrarModalRoles = signal(false);
  usuarioSeleccionado = signal<any>(null);
  mostrarModalAgregarRol = signal(false);
  nombreNuevoRol = signal('');
  menusSeleccionados = signal<number[]>([]);
  rolSeleccionado = signal<string>('');

  userColumns = signal([
    { field: 'numeroCedula', header: 'Cédula', type: 'text' as const },
    { field: 'nombre', header: 'Nombre', type: 'text' as const },
    { field: 'username', header: 'Usuario', type: 'text' as const },
    { field: 'rolNombre', header: 'Rol', type: 'text' as const },
    { field: 'tipoDocumento', header: 'Tipo Documento', type: 'text' as const },
    // { field: 'activo', header: 'Estado', type: 'text' as const },
  ]);


  readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) {
        console.warn('No userData found in sessionStorage');
        return null;
      }
      const parsed = JSON.parse(userDataString);
      if (!parsed || typeof parsed !== 'object') {
        console.warn('Invalid userData format in sessionStorage');
        return null;
      }
      return parsed;
    } catch (e) {
      console.error('Error parsing userData from sessionStorage:', e);
      sessionStorage.removeItem('userData'); // Limpiar datos corruptos
      return null;
    }
  });

  readonly empresaId = computed(() => {
    const data = this.userData();
    const id = data?.empresaId;
    if (!id) {
      console.warn('No empresaId found in userData');
    }
    return id || null;
  });

    readonly rolId = computed(() => {
    const data = this.userData();
    const id = data?.rolId;
    if (!id) {
      console.warn('No rolId found in userData');
    }
    return id || null;
  });

  readonly username = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });

  readonly exportFileName = computed(
    () => `usuarios_roles_${new Date().toISOString().split('T')[0]}`
  );

  serverUsersData = rxResource({
    params: () => ({
      empresaId: this.empresaId(),
    }),
    stream: ({ params }) => {
      const { empresaId } = params;
      if (!empresaId) {
        return EMPTY;
      }
      return this.configRolesService.getUsersEnterprice(empresaId).pipe(
        catchError(error => {
          console.error('Error loading users:', error);
          return of({ success: false, response: [], message: 'Error al cargar usuarios' });
        })
      );
    },
  });

  dataByMenusByRole = rxResource({
    params: () => ({
      empresaId: this.empresaId(),
      rolId: this.rolId(),
    }),
    stream: ({ params }) => {
      const { empresaId, rolId } = params;
      if (!empresaId || !rolId) {
        return EMPTY;
      }
      return this.configRolesService.getmenuByRole(empresaId, rolId).pipe(
        catchError(error => {
          return of({ success: false, response: [], message: 'Error al cargar menús del rol' });
        })
      );
    }
  })

  usersData = computed(() => {
    const data = this.serverUsersData.value();
    if (data?.success === false) {
      return []; // Retornar array vacío en caso de error
    }
    return data?.response || [];
  });

  roleMenuData = rxResource({
    params: () => ({
      empresaId: this.empresaId(),
      rolId: this.usuarioSeleccionado()?.rolId,
    }),
    stream: ({ params }) => {
      const { empresaId, rolId } = params;
      if (!empresaId || !rolId) {
        return EMPTY;
      }
      return this.configRolesService.getmenuByRole(empresaId, rolId).pipe(
        catchError(error => {
          return of({ success: false, response: [], message: 'Error al cargar menús del rol' });
        })
      );
    },
  });

  menuItems = computed(() => {
    const data = this.roleMenuData.value();
    if (data?.success === false) {
      return []; // Retornar array vacío en caso de error
    }
    return data?.response || [];
  });

  allMenusData = rxResource({
    stream: () => this.configRolesService.getMenusAll().pipe(
      catchError(error => {
        return of({ success: false, response: [], message: 'Error al cargar menús' });
      })
    )
  });

  allRolesData = rxResource({
    stream: () => this.configRolesService.getAllRoles().pipe(
      catchError(error => {
        return of({ success: false, response: [], message: 'Error al cargar roles' });
      })
    )
  });

  availableRoles = computed(() => {
    const data = this.allRolesData.value();
    if (data?.success === false) {
      return []; // Retornar array vacío en caso de error
    }
    return data?.response || [];
  });

  availableMenus = computed(() => {
    const data = this.allMenusData.value();
    if (!data?.response || data?.success === false) return [];

    // Extraer menús únicos
    const uniqueMenus = new Map();
    data.response.forEach(item => {
      if (item?.menu && !uniqueMenus.has(item.menu.id)) {
        uniqueMenus.set(item.menu.id, item.menu);
      }
    });

    return Array.from(uniqueMenus.values());
  });

  handleTableAction(event: { action: string; row?: any }): void {
    if (event.action === 'add') {
      this.abrirModalAgregarRol();
    } else if (event.action === 'roles' && event.row) {
      this.abrirModalRoles(event.row);
    }
  }

  abrirModalRoles(usuario: any): void {
    this.usuarioSeleccionado.set(usuario);
    this.rolSeleccionado.set(usuario.rolId?.toString() || '');
    this.mostrarModalRoles.set(true);
  }

  cerrarModalRoles(): void {
    this.mostrarModalRoles.set(false);
    this.usuarioSeleccionado.set(null);
    this.rolSeleccionado.set('');
  }

  abrirModalAgregarRol(): void {
    this.mostrarModalAgregarRol.set(true);
    this.nombreNuevoRol.set('');
    this.menusSeleccionados.set([]);
  }

  cerrarModalAgregarRol(): void {
    this.mostrarModalAgregarRol.set(false);
    this.nombreNuevoRol.set('');
    this.menusSeleccionados.set([]);
  }

  toggleMenuSelection(menuId: number): void {
    const current = this.menusSeleccionados();
    if (current.includes(menuId)) {
      this.menusSeleccionados.set(current.filter(id => id !== menuId));
    } else {
      this.menusSeleccionados.set([...current, menuId]);
    }
  }

  isMenuSelected(menuId: number): boolean {
    return this.menusSeleccionados().includes(menuId);
  }

  /**
   * Cambiar el rol del usuario seleccionado
   */
  cambiarRolUsuario(): void {
    const usuario = this.usuarioSeleccionado();
    const nuevoRolId = Number(this.rolSeleccionado());

    if (!usuario || !nuevoRolId) {
      this.toastService.error('Error', 'Seleccione un rol válido');
      return;
    }

    if (nuevoRolId === usuario.rolId) {
      this.toastService.error('Error', 'El usuario ya tiene este rol asignado');
      return;
    }

    this.configRolesService.updateUserRole(usuario.id, nuevoRolId).subscribe({
      next: (response) => {
        if (response.success !== false) {
          this.toastService.success('Éxito', 'Rol actualizado correctamente');
          this.cerrarModalRoles();
          // Recargar la data de usuarios
          this.serverUsersData.reload?.();
        }
      }
    });
  }

  crearNuevoRol(): void {
    const nombre = this.nombreNuevoRol().trim();
    const menuIds = this.menusSeleccionados();
    const empresaId = this.empresaId();
    const usuarioCreacion = this.username();

    if (!nombre) {
      this.toastService.error('Error', 'El nombre del rol es obligatorio');
      return;
    }

    if (menuIds.length === 0) {
      this.toastService.error('Error', 'Debe seleccionar al menos un menú');
      return;
    }

    if (!empresaId) {
      this.toastService.error('Error', 'No se pudo obtener el ID de la empresa');
      return;
    }

    if (!usuarioCreacion) {
      this.toastService.error('Error', 'No se pudo obtener el usuario actual');
      return;
    }

    // Paso 1: Crear el tipo de rol
    this.configRolesService.createTypeRol({
      nombre,
      usuarioCreacion: this.username(),
      activo: true
    }).subscribe({
      next: (responseCreateType) => {
        if (responseCreateType.success === false) return;

        // Paso 2: Obtener todos los roles para encontrar el ID del rol recién creado
        this.configRolesService.getAllRoles().subscribe({
          next: (responseAllRoles) => {
            if (responseAllRoles.success === false) return;

            const roles = responseAllRoles?.response || [];
            // Buscar el rol recién creado por nombre
            const rolCreado = roles.find(rol => rol.nombre === nombre);

            if (!rolCreado) {
              this.toastService.error('Error', 'No se pudo obtener el ID del rol creado');
              return;
            }

            // Paso 3: Asociar los menús al rol
            this.configRolesService.createRole({
              rolId: rolCreado.id,
              empresaId: empresaId,
              menuIds: menuIds,
              usuarioCreacion: usuarioCreacion
            }).subscribe({
              next: (response) => {
                if (response.success !== false) {
                  this.toastService.success('Éxito', 'Rol creado correctamente');
                  this.cerrarModalAgregarRol();
                  this.serverUsersData.reload?.();
                  this.allRolesData.reload?.();
                }
              }
            });
          }
        });
      }
    });
  }
}
