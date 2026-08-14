import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Legends } from '@components/charts/legends';
import { WebsiteTraffic } from '@components/charts/website-traffic';
import { KpiCardComponent } from '@components/charts/kpi-card';
import { ColumnChartCardComponent } from '@components/charts/column-chart';
import { EmpresaContadorChartComponent } from '@components/charts/empresa-contador-chart';
import { BarChartComponent } from '@components/charts/bar-chart';
import { PassCustomersComponent } from '@components/charts/pass-customers';
import { InvoiceDiffComponent } from '@components/charts/invoice-diff';

@Component({
  selector: 'app-start',
  imports: [
    RouterModule,
    Legends,
    WebsiteTraffic,
    ColumnChartCardComponent,
    EmpresaContadorChartComponent,
    BarChartComponent,
    PassCustomersComponent,
    InvoiceDiffComponent,
  ],
  styles: [`
    .dashboard-grid {
      display: grid;
      gap: 0.5rem;
      align-items: stretch;
    }

    .dashboard-slot {
      min-width: 0;
      min-height: 0;
    }

    .dashboard-slot > * {
      display: block;
      height: 100%;
    }

    /* Mobile: stack vertical */
    .dashboard-grid {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas:
        'legends'
        'column-chart'
        'pass-customers'
        'bar-chart'
        'website-traffic'
        'invoice-diff';
    }

    /* Tablet: two columns */
    @media (min-width: 768px) and (max-width: 1199px) {
      .dashboard-grid {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 1rem 1.25rem;
        grid-template-areas:
          'legends column-chart'
          'pass-customers website-traffic'
          'bar-chart bar-chart'
          'invoice-diff invoice-diff';
      }
    }

    /* Desktop: three-column mosaic */
    @media (min-width: 1200px) {
      .dashboard-grid {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.85fr);
        grid-template-rows: auto minmax(0, 1fr) minmax(300px, auto);
        gap: 1.25rem 1.5rem;
        grid-template-areas:
          'legends column-chart website-traffic'
          'pass-customers bar-chart website-traffic'
          'pass-customers invoice-diff invoice-diff';
      }

      .slot-legends {
        min-height: 100%;
      }

      .slot-column-chart {
        min-height: 100%;
      }

      .slot-website-traffic {
        min-height: 100%;
      }

      .slot-pass-customers {
        align-self: start;
      }

      .slot-invoice-diff {
        min-height: 380px;
      }
    }

    .slot-legends { grid-area: legends; }
    .slot-column-chart { grid-area: column-chart; }
    .slot-pass-customers { grid-area: pass-customers; }
    .slot-bar-chart { grid-area: bar-chart; }
    .slot-website-traffic { grid-area: website-traffic; }
    .slot-invoice-diff { grid-area: invoice-diff; }

    /* Normalize nested chart wrappers inside the grid */
    :host ::ng-deep .dashboard-slot app-legends > div,
    :host ::ng-deep .dashboard-slot app-column-chart-card > div,
    :host ::ng-deep .dashboard-slot app-invoice-diff > div {
      max-width: none;
      margin-inline: 0;
      height: 100%;
    }

    :host ::ng-deep .dashboard-slot app-pass-customers > div {
      max-width: none;
      margin-inline: 0;
    }

    :host ::ng-deep .dashboard-slot app-bar-chart > div {
      max-width: none;
      margin-inline: 0;
    }

    :host ::ng-deep .dashboard-slot:not(.slot-bar-chart):not(.slot-pass-customers) > * > div:first-child {
      height: 100%;
    }

    :host ::ng-deep .slot-website-traffic app-website-traffic > div {
      max-width: none;
      width: 100%;
      height: 100%;
    }
  `],
  template: `
    <div class="min-h-screen w-full p-4 md:p-6 grid gap-4 md:gap-6">
      <!-- KPI Cards superiores -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      </div>

      <!-- Dashboard principal -->
      <div class="dashboard-grid">
        <div class="dashboard-slot slot-legends">
          <app-legends></app-legends>
        </div>

        <div class="dashboard-slot slot-column-chart">
          <app-column-chart-card></app-column-chart-card>
        </div>

        <div class="dashboard-slot slot-pass-customers self-start">
          <app-pass-customers></app-pass-customers>
        </div>

        <div class="dashboard-slot slot-bar-chart self-start">
          <app-bar-chart></app-bar-chart>
        </div>

        <div class="dashboard-slot slot-website-traffic">
          <app-website-traffic></app-website-traffic>
        </div>

        <div class="dashboard-slot slot-invoice-diff">
          <app-invoice-diff></app-invoice-diff>
        </div>
      </div>

      <!-- Componente adicional (funcionalidad existente) -->
      <app-empresa-contador-chart></app-empresa-contador-chart>
    </div>
  `,
})
export class Start {}
