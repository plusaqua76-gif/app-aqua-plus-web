import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReadingService } from '../../service/reading.service';
import { TableComponent } from '@components/table';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map, of } from 'rxjs';
import { EnterpriseIdService } from '@services/enterpriceId.service';
import { toReadingRow, type ReadingRow } from '@shared/index';

@Component({
  selector: 'app-reading',
  imports: [CommonModule, TableComponent, RouterModule],
  template: `
    <ng-template #toggleTpl let-row>
      <a (click)="edit(row)" class="text-green-600 hover:text-green-900 text-sm cursor-pointer">
        <i class="fas fa-edit"></i>
      </a>
    </ng-template>

    <app-table-dynamic
      [title]="title()"
      [columns]="readingColumns()"
      [datasource]="readingData()"
      [actionTemplate]="toggleTpl"
    />
  `
})
export class Reading {
  private enterpriseIdService = inject(EnterpriseIdService);
  private readingService = inject(ReadingService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  title = signal('Gestión de Lecturas');

  readingColumns = signal([
    { field: 'serial', header: 'Contador' },
    { field: 'lectura', header: 'Lectura(m³)' },
    { field: 'fechaLectura', header: 'Fecha Lectura' },
    { field: 'consumoAnormal', header: 'Consumo Anormal' },
    { field: 'observacion', header: 'Observación' },
  ]);

  private enterpriseId = toSignal(this.enterpriseIdService.getEnterpriseId(), { initialValue: null });

  private dataResource = rxResource({
    params: () => this.enterpriseId(),
    stream: ({ params: id }) => {
      if (!id) return of([]);
      return this.readingService.getAllReadingById(id).pipe(
        map(response => response.response || []),
        map(readings => readings.map(toReadingRow))
      );
    }
  });

  readingData = computed(() => this.dataResource.value() || []);

  edit(row: any) {
    this.router.navigate(['/reading/update-reading/', row.id], {
      relativeTo: this.route,
    });
  }
}
