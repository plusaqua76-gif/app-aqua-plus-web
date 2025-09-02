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
import { toUserAccessRow, type UserAccessRow } from '@shared/index';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-user-access',
  imports: [TableComponent],
  template: `
    <ng-template #toggleTpl let-row>
      <label class="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          [checked]="row.estado === 'activo'"
          class="sr-only peer"
          (change)="toggleUserState(row, $event)"
        />
        <div
          class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"
        ></div>
        <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          {{ row.estado === 'activo' ? 'Activo' : 'Inactivo' }}
        </span>
      </label>
    </ng-template>

    <app-table-dynamic
      [title]="title()"
      [columns]="readingColumns()"
      [datasource]="userAccess()"
      [actionTemplate]="toggleTpl"
    />
  `,
})
export class UserAccess {
  title = signal('Gestión Accesos');

  private userAccessService = inject(UserAccessService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

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
    { field: 'nombre', header: 'Nombre de Usuario' },
    { field: 'estado', header: 'Estado' },
  ]);

  constructor() {
    effect(() => {
      const data = this.usersInactives.value();
      console.log('Data de usuarios:', data);
      console.log('ID de empresa:', this.enterpriseId)
    });
  }

  usersInactives = rxResource({
    stream: () => this.userAccessService.getAllUsersAccess(),
  });

  userAccess = computed(() => {
    const users = this.usersInactives.value() || [];
    return users.map(toUserAccessRow);
  });

  toggleUserState(row: UserAccessRow, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const activo = checkbox.checked;

    console.log(
      `Cambiando estado del usuario ${row.nombre} a: ${
        activo ? 'activo' : 'inactivo'
      }`
    );
    console.log('Usuario ID:', row.id);

    const users = this.usersInactives.value() || [];
    const userCompleto = users.find((user) => user.id === row.id);

    if (!userCompleto) {
      console.error('No se encontró el usuario completo');
      checkbox.checked = !checkbox.checked;
      return;
    }

    // const nombreEmpresa = userCompleto.nombreEmpresa || '';

    // this.userAccessService.updateUserState(userCompleto, activo, row.nombre, nombreEmpresa).subscribe({
    //   next: (response) => {
    //     console.log('Estado actualizado exitosamente:', response);
    //     this.usersInactives.reload();
    //   },
    //   error: (error) => {
    //     console.error('Error al actualizar el estado:', error);
    //     checkbox.checked = !checkbox.checked;
    //   },
    // });
  }
}
