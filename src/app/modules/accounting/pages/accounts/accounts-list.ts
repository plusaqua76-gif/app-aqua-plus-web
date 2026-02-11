import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { TableComponent } from '@components/table';
import { CuentasTotalesEagerInitializationService } from '../../service/cuentas-totales-eager-initialization.service';

@Component({
  selector: 'app-accounts-list',
  standalone: true,
  imports: [CommonModule, TableComponent],
  template: `
    <div class="min-h-screen w-full p-6">
      <div class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-gray-400 text-lg font-medium">
            Cuentas Contables
          </h3>
        </div>
        <app-table-dynamic
          [columns]="accountColumns()"
          [serverMode]="false"
          [datasource]="transformedAccountData()"
          [loading]="cuentasTotalesService.isLoading()"
          [pagination]="true"
        >
        </app-table-dynamic>
      </div>
    </div>
  `,
})
export class AccountsList {
  protected readonly cuentasTotalesService = inject(CuentasTotalesEagerInitializationService);

  readonly accountColumns = signal([
    { field: 'categoriaNombre', header: 'Categoría', type: 'text' as const },
    { field: 'total', header: 'Total', type: 'currency' as const },
    { field: 'fechaCreacion', header: 'Fecha', type: 'date' as const },
  ]);

  readonly transformedAccountData = computed(() => {
    const rawData = this.cuentasTotalesService.transformedData();
    if (!rawData?.response) return [];

    return rawData.response.map((cuenta) => ({
      ...cuenta,
      categoriaNombre: cuenta.categoria?.nombre || '',
      fechaCreacion: this.formatDate(cuenta.fechaCreacion),
    }));
  });

  private formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
}
