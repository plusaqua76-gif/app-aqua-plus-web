import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, signal, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReadingService } from '../../service/reading.service';
import { TableComponent } from '@components/table';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map, of } from 'rxjs';
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
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private readingService = inject(ReadingService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  title = signal('Gestión de Lecturas');

  // Enterprise ID desde sessionStorage con manejo SSR
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

  readingColumns = signal([
    { field: 'serial', header: 'Contador' },
    { field: 'lectura', header: 'Lectura(m³)' },
    { field: 'fechaLectura', header: 'Fecha Lectura' },
    { field: 'consumoAnormal', header: 'Consumo Anormal' },
    { field: 'observacion', header: 'Observación' },
  ]);

  private dataResource = rxResource({
    params: () => ({ enterpriseId: this.enterpriseId() }),
    stream: ({ params }) => {
      const { enterpriseId } = params;

      if (!enterpriseId) {
        console.warn('No enterprise ID available for readings');
        return of([]);
      }

      console.log('Loading readings for enterprise ID:', enterpriseId);
      return this.readingService.getAllReadingById(enterpriseId).pipe(
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
