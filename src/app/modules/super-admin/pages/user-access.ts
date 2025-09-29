import {
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { UserAccessService } from '../services/users-access.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { TableComponent } from '@components/table';
import { type UserAccessRow } from '@shared/index';
import { isPlatformBrowser } from '@angular/common';
import { EMPTY } from 'rxjs';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';
import { EnterpriseIdService } from '../../../core/services/enterpriceId.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-user-access',
  imports: [TableComponent],
  template: `
    <ng-template #toggleTpl let-row>
      <label class="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          [checked]="row.estado?.nombre?.toLowerCase() === 'activo'"
          class="sr-only peer"
          (change)="toggleUserState(row, $event)"
        />
        <div
          class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"
        ></div>
      </label>
    </ng-template>
        <app-table-dynamic
      [title]="title()"
      [columns]="readingColumns()"
      [serverMode]="true"
      [serverData]="userAccess() ?? null"
      [loading]="usersInactives.isLoading()"
      [actionTemplate]="toggleTpl"
      [showExportButton]="true"
      [exportFileName]="exportFileName()"
      [showColumnFilters]="true"
      (action)="($event)"
      (serverPaginationChange)="onPaginationChange($event)"
    >
    </app-table-dynamic>
  `,
})
export class UserAccess {
  title = signal('Gestión Accesos');

  readonly userAccessService = inject(UserAccessService);
  readonly enterpriseIdService = inject(EnterpriseIdService);
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly idUserSelected = signal<number | null>(null);
  readonly toastService = inject(ToastService);


  readonly enterpriseId = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userData = sessionStorage.getItem('userData');
      if (!userData) return null;

      const parsedUserData = JSON.parse(userData);
      return parsedUserData.empresaId ? Number(parsedUserData.empresaId) : null;
    } catch (error) {
      console.error('Error parsing userData from sessionStorage:', error);
      return null;
    }
  });

  readonly enterpriseName = computed(() => {
    if (!this.isBrowser) return '';
    try {
      const userData = sessionStorage.getItem('userData');
      if (!userData) return '';

      const parsedUserData = JSON.parse(userData);
      return parsedUserData.nombre || '';
    } catch (error) {
      console.error('Error parsing userData from sessionStorage:', error);
      return '';
    }
  });

  readingColumns = signal([
    { field: 'nombre', header: 'Nombre de Usuario', type: 'text' as const },
    { field: 'estadoNombre', header: 'Estado', type: 'text' as const },
  ]);

    readonly paginationParams = signal<IPaginationParams>({
      page: 0,
      size: 5,
    });



    usersInactives = rxResource({
      params: () => ({
        enterpriseId: this.enterpriseId(),
        pagination: this.paginationParams(),
      }),
      stream: ({ params }) => {
        const { enterpriseId, pagination } = params;
        if (!enterpriseId) {
          return EMPTY;
        }
        return this.userAccessService.getAllUsersAccess(
          enterpriseId,
          pagination
        );
      },
    });

    readonly exportFileName = computed(
      () => `accesos_usuarios_${new Date().toISOString().split('T')[0]}`
    );

    readonly transformedServerData = computed(() => {
      const rawData = this.usersInactives.value();
      if (!rawData) return null;

      const transformedResponse = rawData.response.map((user: any) => ({
        ...user,
        estadoNombre: user.estado?.nombre || 'Sin estado',
      }));

      return {
        ...rawData,
        response: transformedResponse
      };
    });

    userAccess = computed(() => this.transformedServerData());

      onPaginationChange(params: IPaginationParams): void {
    this.paginationParams.set(params);
  }


  private getCurrentUserFromSession(): string | null {
    if (!this.isBrowser) return null;
    try {
      const userData = sessionStorage.getItem('userData');
      if (!userData) return null;

      const parsedUserData = JSON.parse(userData);
      return parsedUserData.nombre || null;
    } catch (error) {
      console.error('Error parsing userData from sessionStorage:', error);
      return null;
    }
  }

  toggleUserState(row: UserAccessRow, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const activo = checkbox.checked;
    this.idUserSelected.set(row.id);

    const usersResponse = this.usersInactives.value();
    if (!usersResponse?.response) {
      console.error('No se encontró la respuesta de usuarios');
      checkbox.checked = !checkbox.checked;
      return;
    }

    const userCompleto = usersResponse.response.find((user: any) => user.id === row.id);

    if (!userCompleto) {
      console.error('No se encontró el usuario completo');
      checkbox.checked = !checkbox.checked;
      return;
    }

    const currentUser = this.getCurrentUserFromSession();

    this.enterpriseIdService.getByIdEnterprice(row.id).subscribe({
      next: (enterpriseId: number | null) => {
        if (!enterpriseId) {
          console.error('No se pudo obtener el ID de empresa para el usuario:', row.id);
          checkbox.checked = !checkbox.checked;
          return;
        }

        const payload = {
          idEmpresa: enterpriseId,
          activo: activo,
          usuarioCambio: currentUser || "AquaPlus",
          nombreEmpresa: userCompleto.nombreEmpresa || '',
          usuario: row.nombre
        };

        this.userAccessService.updateUserStateWithPayload(payload).subscribe({
          next: (response) => {
                          this.toastService.success(
                'Éxito',
                'Tipo de concepto eliminado exitosamente'
              );
            this.usersInactives.reload?.();
          },
          error: (error) => {
            this.toastService.error(
              'Error',
              'No se pudo actualizar el estado del usuario'
            );

            checkbox.checked = !checkbox.checked;
          },
        });
      },
      error: (error: any) => {
        this.toastService.error(
          'Error',
          'No se pudo obtener el ID de empresa para el usuario'
        );
        checkbox.checked = !checkbox.checked;
      }
    });
  }
}
