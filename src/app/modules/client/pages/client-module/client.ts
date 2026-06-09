import { EnterpriseClientCounterService } from './../../service/enterpriseClientCounter.service';
import { SaldoClienteService } from './../../service/saldo-cliente.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  inject,
  signal,
  computed,
  PLATFORM_ID,
  effect,
} from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Action, TableComponent } from '../../../../core/components/table';
import { rxResource } from '@angular/core/rxjs-interop';
import { ToastService } from '@services/toast.service';
import { TableStateService } from '../../../../core/services/table-state.service';
import { catchError, of, firstValueFrom } from 'rxjs';
import { PopupComponent } from '@shared/components/popUp';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';

@Component({
  selector: 'app-client',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PopupComponent, TableComponent],
  template: `
    <ng-template #actionsTemplate let-row>
      <div class="flex items-center space-x-4">
        <button
          type="button"
          (click)="editar(row)"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-blue-600/50 text-blue-400 hover:bg-blue-600/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors duration-200"
          title="Editar cliente"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          type="button"
          (click)="openSaldoModal(row)"
          class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-emerald-600/50 text-emerald-400 hover:bg-emerald-600/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-colors duration-200"
          title="Gestionar saldo"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </ng-template>

    <ng-template #estadoTpl let-row>
      <div class="flex items-center gap-2">
        <label class="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            [checked]="row.activo"
            class="sr-only peer"
            (change)="onToggle(row)"
          />
          <div
            class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"
          ></div>
        </label>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ row.activo ? 'Activo' : 'Inactivo' }}
        </span>
      </div>
    </ng-template>

    <app-table-dynamic
      [title]="title"
      [columns]="clienteColumns()"
      [serverMode]="true"
      [serverData]="serverClientData.value() ?? null"
      [loading]="serverClientData.isLoading()"
      [actionTemplate]="actionsTemplate"
      [columnTemplates]="{ activo: estadoTpl }"
      [showAddButton]="true"
      [addButtonText]="'Agregar Cliente'"
      [showColumnFilters]="true"
      [showExportButton]="true"
      [exportFileName]="exportFileName()"
      [externalFilters]="tableState.columnFilters()"
      [externalFiltersVisible]="tableState.filtersVisible()"
      [exportData]="exportDataForTable()"
      [isLoadingExportData]="isLoadingExportData()"
      (action)="onTableAction($event)"
      (serverPaginationChange)="onPaginationChange($event)"
      (filtersChange)="onFiltersChange($event)"
      (filtersVisibilityChange)="onFiltersVisibilityChange($event)"
      (exportAllDataRequest)="handleExportRequest($event)"
    >
    </app-table-dynamic>

    <app-pop-up
      [open]="showDeleteConfirm"
      [isConfirmation]="true"
      [title]="'Eliminar Cliente'"
      [message]="'¿Está seguro que desea eliminar este cliente? Esta acción no se puede deshacer.'"
      [confirmText]="'Eliminar'"
      [cancelText]="'Cancelar'"
      (confirmAction)="confirmDelete()"
    >
    </app-pop-up>

    <!-- Modal Gestión de Saldo -->
    @if (isSaldoModalOpen()) {
    <div class="fixed inset-0 z-[1000] overflow-y-auto">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" (click)="closeSaldoModal()"></div>
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative w-full max-w-lg bg-white/10 dark:bg-slate-800/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl flex flex-col">

          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-white/10 dark:border-slate-700/30">
            <h3 class="text-lg font-bold text-gray-700 dark:text-gray-200 flex items-center gap-3">
              <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Saldo del Cliente
            </h3>
            <button type="button" (click)="closeSaldoModal()" class="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/20 transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Cliente info -->
          <div class="px-6 pt-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">Cliente: <span class="font-semibold text-gray-700 dark:text-gray-200">{{ saldoModalRow()?.nombreCompleto }}</span></p>
          </div>

          <!-- Loading -->
          @if (isSaldoLoading()) {
          <div class="flex items-center justify-center py-12">
            <svg class="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
          } @else {

          <!-- Saldo existente badge -->
          @if (saldoExistente()) {
          <div class="mx-6 mt-4 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm text-emerald-700 dark:text-emerald-300 font-medium">El cliente ya tiene un saldo registrado. Puedes actualizarlo o eliminarlo.</span>
          </div>
          }

          <!-- Formulario -->
          <form [formGroup]="saldoForm" class="p-6 grid grid-cols-2 gap-4">

            <!-- Saldo -->
            <div class="col-span-2">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wider uppercase">Saldo</label>
              <input type="number" formControlName="saldoTotal" min="0" step="0.01" placeholder="0.00"
                class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-md transition-all"/>
              @if (saldoForm.get('saldoTotal')?.invalid && saldoForm.get('saldoTotal')?.touched) {
              <span class="text-xs text-red-400 mt-1 block">Ingrese un valor válido mayor o igual a 0</span>
              }
            </div>

            @if (saldoExistente()) {
            <div class="col-span-2">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wider uppercase">Saldo Disponible</label>
              <input type="number" formControlName="saldoDisponible" readonly
                class="w-full px-4 py-3 bg-white/5 dark:bg-slate-700/30 border border-white/10 dark:border-slate-400/20 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed backdrop-blur-md"/>
            </div>
            }

            <!-- Cuotas -->
            <div class="col-span-1">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 tracking-wider uppercase">Cuotas</label>
              <input type="number" formControlName="cuotas" min="1" step="1" placeholder="1"
                class="w-full px-4 py-3 bg-white/10 dark:bg-slate-700/50 border border-white/20 dark:border-slate-400/30 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-md transition-all"/>
              @if (saldoForm.get('cuotas')?.invalid && saldoForm.get('cuotas')?.touched) {
              <span class="text-xs text-red-400 mt-1 block">Ingrese una cantidad de cuotas válida (mínimo 1)</span>
              }
            </div>

            <!-- Estado
            <div class="col-span-1 flex items-end">
              <label class="inline-flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border border-white/20 dark:border-slate-400/30 bg-white/10 dark:bg-slate-700/50">
                <input type="checkbox" formControlName="activo" class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Saldo activo</span>
              </label>
            </div> -->
          </form>
          }

          <!-- Footer -->
          <div class="flex justify-between items-center gap-3 p-6 border-t border-white/10 dark:border-slate-700/30">
            <div>
              @if (saldoExistente() && !isSaldoLoading()) {
              <button type="button" (click)="confirmDeleteSaldo()"
                class="px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold hover:bg-red-500/20 transition-all flex items-center gap-2 text-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Eliminar Saldo
              </button>
              }
            </div>
            <div class="flex gap-3">
              <button type="button" (click)="closeSaldoModal()"
                class="px-5 py-2.5 rounded-xl border border-gray-400/30 bg-gray-500/10 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-500/20 transition-all">
                Cancelar
              </button>
              @if (!isSaldoLoading()) {
              <button type="button" (click)="saveSaldo()" [disabled]="isSaldoSaving()"
                class="px-5 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-2">
                @if (isSaldoSaving()) {
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                }
                {{ saldoExistente() ? 'Actualizar Saldo' : 'Guardar Saldo' }}
              </button>
              }
            </div>
          </div>

        </div>
      </div>
    </div>
    }

    <!-- Popup confirmación eliminar saldo -->
    <app-pop-up
      [open]="showDeleteSaldoConfirm"
      [isConfirmation]="true"
      [title]="'Eliminar Saldo'"
      [message]="'¿Está seguro que desea eliminar el saldo de este cliente? Esta acción no se puede deshacer.'"
      [confirmText]="'Eliminar'"
      [cancelText]="'Cancelar'"
      (confirmAction)="deleteSaldo()"
    >
    </app-pop-up>
  `,
})
export class Client {
  showDeleteConfirm = signal(false);
  itemToDelete: number | null = null;
  title = 'Gestion de clientes';

  // Signals para exportación completa
  exportDataForTable = signal<any[] | null>(null);
  isLoadingExportData = signal(false);

  // Signals para modal de saldo
  isSaldoModalOpen = signal(false);
  saldoModalRow = signal<any>(null);
  saldoExistente = signal<any>(null);
  isSaldoLoading = signal(false);
  isSaldoSaving = signal(false);
  showDeleteSaldoConfirm = signal(false);

  saldoForm!: FormGroup;

  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly enterpriseClientCounterService = inject(EnterpriseClientCounterService);
  private readonly saldoClienteService = inject(SaldoClienteService);
  private readonly fb = inject(FormBuilder);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly toastService = inject(ToastService);
  protected readonly tableState = inject(TableStateService);

  clienteColumns = signal([
    {
      field: 'numeroCedula',
      header: 'Número Identificación',
      type: 'text' as const,
    },
    { field: 'nombreCompleto', header: 'Nombre', type: 'text' as const },
    // { field: 'telefono', header: 'Teléfono', type: 'text' as const },
    {
      field: 'corregimientoNombre',
      header: 'Corregimiento',
      type: 'text' as const,
    },

    {
      field: 'direccionDescripcion',
      header: 'Dirección',
      type: 'text' as const,
    },
    // aqui se va a dejar al columna del NUID
    {
      field: 'nuid',
      header: 'Codigo',
      type: 'text' as const,
    },
    // { field: 'correo', header: 'Correo', type: 'text' as const },
    {
      field: 'activo',
      header: 'Estado',
      template: 'estadoTpl',
      type: 'text' as const,
    },
  ]);

  readonly exportFileName = computed(
    () => `clientes_${new Date().toISOString().split('T')[0]}`
  );

  // Usar paginationParams del servicio de estado genérico
  readonly paginationParams = this.tableState.paginationParams;

  constructor() {
    this.saldoForm = this.fb.group({
      saldoTotal: [0, [Validators.required, Validators.min(0)]],
      saldoDisponible: [0],
      cuotas: [1, [Validators.required, Validators.min(1)]],
      activo: [true],
    });

    effect(() => {
      const data = this.exportDataForTable();
      const isLoading = this.isLoadingExportData();
      if (data && data.length > 0 && !isLoading) {
        setTimeout(() => {
          this.exportDataForTable.set(null);
        }, 2000);
      }
    });
  }

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

  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });

  serverClientData = rxResource({
    params: () => ({
      enterpriseId: this.enterpriseId(),
      pagination: this.paginationParams(),
    }),
    stream: ({ params }) => {
      const { enterpriseId, pagination } = params;

      if (!enterpriseId) {
        console.warn('No enterprise ID available');
        return of(null);
      }

      return this.enterpriseClientCounterService
        .getAllClientsByIdEnterprisePaginated(enterpriseId, pagination)
        .pipe(
          catchError((error) => {
            console.error('Error fetching clients:', error);
            return of(null);
          })
        );
    },
  });

  transformedData = computed(() => this.serverClientData.value() ?? null);

  onToggle(row: any) {
    const nuevoEstado = !row.activo;

    this.enterpriseClientCounterService
      .updateEstado({
        id_persona: row.id,
        activo: nuevoEstado,
        usuario_cambio: this.nombreUsuario(),
      })
      .subscribe({
        next: (response) => {
          row.activo = nuevoEstado;
          this.toastService.success(
            'Éxito',
            'Estado actualizado correctamente'
          );
          // Recargar los datos para sincronizar
          this.serverClientData.reload?.();
        },
        error: (err) => {
          console.error('Error al cambiar estado del cliente:', err);
          this.toastService.error(
            'Error',
            'Ocurrió un error al actualizar el estado'
          );
        },
      });
  }

  onDelete(id: number): void {
    this.itemToDelete = id;
    this.showDeleteConfirm.set(true);
  }

  editar(row: any) {
    const id = row?.empresaClienteContadorId;
    if (id) {
      this.router.navigate(['update-client/', id], {
        relativeTo: this.route,
        state: { clienteData: row },
      });
    } else {
      this.toastService.error('Error', 'ID del cliente no válido.');
    }
  }

  confirmDelete(): void {
    if (this.itemToDelete !== null) {
      this.enterpriseClientCounterService
        .deleteClient(this.itemToDelete)
        .subscribe({
          next: () => {
            this.toastService.success(
              'Eliminado',
              'Cliente eliminado correctamente.'
            );
            this.serverClientData.reload?.();
          },
          error: () => {
            this.toastService.error('Error', 'No se pudo eliminar el cliente.');
          },
          complete: () => {
            this.showDeleteConfirm.set(false);
            this.itemToDelete = null;
          },
        });
    }
  }

  // ==================== GESTIÓN DE SALDO ====================

  openSaldoModal(row: any): void {
    this.saldoModalRow.set(row);
    this.saldoExistente.set(null);
    this.saldoForm.reset({ saldoTotal: 0, saldoDisponible: 0, cuotas: 1, activo: true });
    this.isSaldoModalOpen.set(true);
    this.isSaldoLoading.set(true);

    const id = row?.empresaClienteContadorId;
    if (!id) {
      this.isSaldoLoading.set(false);
      return;
    }

    this.saldoClienteService.getSaldoByEmpresaClienteContador(id).subscribe({
      next: (saldo) => {
        if (!saldo) {
          this.saldoExistente.set(null);
          this.isSaldoLoading.set(false);
          return;
        }
        this.saldoExistente.set(saldo);
        this.saldoForm.patchValue({
          saldoTotal: saldo.saldoTotal,
          saldoDisponible: saldo.saldoDisponible,
          cuotas: saldo.cuotas ?? 1,
          activo: saldo.saldoActivo,
        });
        this.isSaldoLoading.set(false);
      },
      error: () => {
        // No existe saldo — formulario en blanco para crear
        this.saldoExistente.set(null);
        this.isSaldoLoading.set(false);
      },
    });
  }

  closeSaldoModal(): void {
    this.isSaldoModalOpen.set(false);
    this.saldoModalRow.set(null);
    this.saldoExistente.set(null);
  }

  saveSaldo(): void {
    if (this.saldoForm.invalid) {
      this.saldoForm.markAllAsTouched();
      return;
    }

    const row = this.saldoModalRow();
    if (!row?.empresaClienteContadorId) return;

    this.isSaldoSaving.set(true);
    const { saldoTotal, activo, cuotas } = this.saldoForm.value;
    const existente = this.saldoExistente();

    const request$ = existente?.saldoClienteId
      ? this.saldoClienteService.updateSaldo({
          id: existente.saldoClienteId,
          saldoTotal,
          usuarioModificacion: this.nombreUsuario() ?? 'sistema',
          fechaModificacion: new Date().toISOString(),
        })
      : this.saldoClienteService.createSaldo({
          empresaClienteContador: { id: row.empresaClienteContadorId },
          saldoTotal,
          saldoDisponible: saldoTotal,
          activo,
          cuotas,
          usuarioCreacion: this.nombreUsuario() ?? 'sistema',
        });

    request$.subscribe({
      next: (res) => {
        this.toastService.success('Éxito', existente ? 'Saldo actualizado correctamente' : 'Saldo guardado correctamente');
        this.saldoExistente.set(res);
        this.isSaldoSaving.set(false);
      },
      error: () => {
        this.toastService.error('Error', existente ? 'No se pudo actualizar el saldo' : 'No se pudo guardar el saldo');
        this.isSaldoSaving.set(false);
      },
    });
  }

  confirmDeleteSaldo(): void {
    this.showDeleteSaldoConfirm.set(true);
  }

  deleteSaldo(): void {
    const saldo = this.saldoExistente();
    if (!saldo?.saldoClienteId) return;

    this.saldoClienteService.deleteSaldo(saldo.saldoClienteId).subscribe({
      next: () => {
        this.toastService.success('Eliminado', 'Saldo eliminado correctamente');
        this.showDeleteSaldoConfirm.set(false);
        this.closeSaldoModal();
      },
      error: () => {
        this.toastService.error('Error', 'No se pudo eliminar el saldo');
        this.showDeleteSaldoConfirm.set(false);
      },
    });
  }

  onTableAction(event: Action) {
    if (event.action === 'add') {
      this.router.navigate(['create-client'], { relativeTo: this.route });
    } else if (event.action === 'edit' && event.row) {
      this.editar(event.row);
    }
  }

  onPaginationChange(params: IPaginationParams): void {
    this.tableState.updatePagination(params);
  }

  onFiltersChange(filters: Record<string, string>): void {
    this.tableState.updateFilters(filters);
  }

  onFiltersVisibilityChange(visible: boolean): void {
    this.tableState.updateFiltersVisibility(visible);
  }

  async handleExportRequest(event: { totalCount: number; currentParams: IPaginationParams }): Promise<void> {
    const enterpriseId = this.enterpriseId();
    if (!enterpriseId) {
      this.toastService.error('Error', 'No se pudo obtener el ID de la empresa');
      return;
    }

    this.isLoadingExportData.set(true);
    this.toastService.info('Preparando exportación', `Cargando ${event.totalCount} registros...`);

    try {
      const exportParams: IPaginationParams = {
        ...event.currentParams,
        page: 0,
        size: event.totalCount
      };

      const response = await firstValueFrom(
        this.enterpriseClientCounterService.getAllClientsByIdEnterprisePaginated(
          enterpriseId,
          exportParams
        )
      );

      if (response?.response && Array.isArray(response.response)) {
        this.exportDataForTable.set(response.response);
        this.toastService.success('Datos cargados', `${response.response.length} registros listos para exportar`);
      } else {
        throw new Error('No se recibieron datos del servidor');
      }
    } catch (error) {
      console.error('Error al cargar datos para exportación:', error);
      this.toastService.error('Error', 'No se pudieron cargar los datos para exportar');
      this.exportDataForTable.set(null);
    } finally {
      this.isLoadingExportData.set(false);
    }
  }
}
