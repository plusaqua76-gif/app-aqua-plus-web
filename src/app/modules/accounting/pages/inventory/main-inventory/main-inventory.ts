import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Legends } from '@components/charts/legends';

@Component({
  selector: 'app-main-inventory',
  imports: [CommonModule],
  template: `
<!-- CONTENEDOR GENERAL -->
<div class="min-h-screen w-full p-6 grid gap-6">

  <!-- GRID: TARJETAS SUPERIORES -->
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
    <div class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl"></div>
    <div class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl"></div>
    <div class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl"></div>
    <div class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl"></div>
  </div>

  <!-- GRID PRINCIPAL -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    <!-- COLUMNA IZQUIERDA (grande) -->
    <div class="space-y-6">
      <div class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl h-64"></div>
      <div class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl h-40"></div>
      <div class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl h-40"></div>
      <div class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl h-40"></div>
    </div>

    <!-- COLUMNA CENTRAL (tabla / listas) -->
    <div class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl h-[520px]"></div>

    <!-- COLUMNA DERECHA -->
    <div class="space-y-6">
      <div class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl h-24"></div>
      <div class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl h-24"></div>
      <div class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl h-24"></div>
      <div class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl h-64"></div>
      <div class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl h-64"></div>
    </div>

  </div>

  <!-- GRID INFERIOR -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl h-64"></div>
    <div class="rounded-xl border border-gray-700/10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl h-64"></div>
  </div>

</div>

  `,
})
export class MainInventory {}
