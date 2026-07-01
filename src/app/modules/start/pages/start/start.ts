import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Legends } from '@components/charts/legends';
import { WebsiteTraffic } from '@components/charts/website-traffic';
import { KpiCardComponent } from '@components/charts/kpi-card';
import { ColumnChartCardComponent } from '@components/charts/column-chart';
import { ChartCounter } from "@components/charts/metric-counter";
import { EmpresaContadorChartComponent } from "@components/charts/empresa-contador-chart";

@Component({
  selector: 'app-start',
  imports: [
    RouterModule,
    Legends,
    WebsiteTraffic,
    KpiCardComponent,
    ColumnChartCardComponent,
    EmpresaContadorChartComponent
],
  template: `
    <section class="mx-auto w-full max-w-7xl p-4 md:p-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="rounded-2xl">
          <app-kpi-card kpiId="clientes-nuevos"></app-kpi-card>
        </div>
        <div class="rounded-2xl">
          <app-kpi-card kpiId="clientes-al-dia"></app-kpi-card>
        </div>
        <div class="rounded-2xl">
          <app-kpi-card kpiId="clientes-mora"></app-kpi-card>
        </div>
        <div class="rounded-2xl">
          <app-kpi-card kpiId="clientes-activos"></app-kpi-card>
        </div>
      </div>
      <div class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 rounded-2xl">
          <app-legends></app-legends>
          <div class="mt-4">
            <app-column-chart-card></app-column-chart-card>
          </div>
        </div>
        <div class="rounded-2xl">
          <app-website-traffic></app-website-traffic>
          <div class="mt-4">
            <app-empresa-contador-chart></app-empresa-contador-chart>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Start {}