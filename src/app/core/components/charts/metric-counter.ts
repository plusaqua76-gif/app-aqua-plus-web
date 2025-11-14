import { NgClass, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-chart-counter',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center p-4">
      <div class="text-4xl font-bold text-gray-900 dark:text-white">
        {{ value | number:'1.0-0':'es-CO' }}
      </div>
      <div class="text-sm text-gray-500 dark:text-gray-400 mt-2">
        {{ label }}
      </div>
    </div>
  `
})
export class ChartCounter {
  @Input() value: number = 0;
  @Input() label: string = '';
}
