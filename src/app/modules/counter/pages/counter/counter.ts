// import { Action } from './../../../../core/components/table';
// import { CommonModule, isPlatformBrowser } from '@angular/common';
// import { Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
// import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import { TableComponent } from '@components/table';
// import { rxResource } from '@angular/core/rxjs-interop';
// import { catchError, EMPTY, of } from 'rxjs';
// import { ToastService } from '@services/toast.service';
// import { CounterService } from '../../service/counter.service';
// import { IPaginationParams } from '@interfaces/IpaginatedResponse';

// @Component({
//   selector: 'app-counter',
//   imports: [CommonModule, RouterModule, TableComponent],
//   template: `
//       <ng-template #toggleTpl let-row>
//         <button
//           type="button"
//           (click)="edit(row)"
//           class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-blue-600/50 text-blue-400 hover:bg-blue-600/10 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors duration-200"
//           title="Editar contador">
//           <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
//               d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//           </svg>
//         </button>
//       </ng-template>

//       <app-table-dynamic
//         [title]="title()"
//         [columns]="counterColumns()"
//         [serverMode]="true"
//         [serverData]="serverCounterData.value() ?? null"
//         [loading]="serverCounterData.isLoading()"
//         [actionTemplate]="toggleTpl"
//         [showAddButton]="true"
//         [addButtonText]="'Agregar Cliente'"
//         [showExportButton]="true"
//         [exportFileName]="exportFileName()"
//         [showColumnFilters]="true"
//         (action)="onTableAction($event)"
//         (serverPaginationChange)="onPaginationChange($event)"
//       />
//   `,
// })
// export class Counter {

//   title = signal('Gestión de Contadores');
//   showDeleteConfirm = signal(false);
//   itemToDelete: number | null = null;
//   readonly platformId = inject(PLATFORM_ID);
//   readonly isBrowser = isPlatformBrowser(this.platformId);

//   protected readonly counterService = inject(CounterService);
//   protected readonly toastService = inject(ToastService);
//   protected readonly router = inject(Router);
//   protected readonly route = inject(ActivatedRoute);

//   counterColumns = signal([
//     { field: 'serial', header: 'Serial', type: 'text' as const },
//     { field: 'tipoContadorNombre', header: 'Tipo Contador', type: 'text' as const },
//     { field: 'direccionDescripcion', header: 'Dirección', type: 'text' as const },
//   ]);

//   readonly enterpriseId = computed(() => {
//     if (!this.isBrowser) return null;
//     try {
//       return Number(JSON.parse(sessionStorage.getItem('userData')!)?.empresaId) || null;
//     } catch (e) {
//       console.error('Error parsing userData from sessionStorage:', e);
//       return null;
//     }
//   });

//   constructor() {
//     effect(() => {
//       console.log("este es el contador mi pez", this.serverCounterData.value())
//     })
//   }

//   // Signal para parámetros de paginación
//   readonly paginationParams = signal<IPaginationParams>({
//     page: 0,
//     size: 5,
//   });

//   // Resource para datos paginados del servidor
//   serverCounterData = rxResource({
//     params: () => ({
//       enterpriseId: this.enterpriseId(),
//       pagination: this.paginationParams(),
//     }),
//     stream: ({ params }) => {
//       const { enterpriseId, pagination } = params;
//       if (!enterpriseId) {
//         return EMPTY;
//       }
//       return this.counterService.getAllCounterByIdEnterprisePaginated(
//         enterpriseId,
//         pagination
//       ).pipe(
//               catchError((error) => {
//                 return of(null);
//               })
//             );
//     },
//   });

//   // Computed para el nombre del archivo de exportación
//   readonly exportFileName = computed(
//     () => `contadores_${new Date().toISOString().split('T')[0]}`
//   );


//   onPaginationChange(params: IPaginationParams): void {
//     this.paginationParams.set(params);
//   }

//   edit(row: any) {
//     this.router.navigate(['actualizar-contador', row.id], {
//       relativeTo: this.route,
//     });
//   }

//   onTableAction(event: Action) {
//     if (event.action === 'add') {
//       this.router.navigate(['/shell/client/create-client'], { relativeTo: this.route });
//     }
//   }
// }
