import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngClass]="{
      'flex-col gap-4 w-full flex items-center justify-center': true,
      'fixed inset-0 backdrop-blur-sm z-50': overlay(),
      'bg-white/80': overlay() && !darkMode(),
      'dark:bg-black/80': overlay() && darkMode()
    }">
      <div class="w-28 h-28 border-8 text-blue-400 text-4xl animate-spin border-gray-300 flex items-center justify-center border-t-blue-400 rounded-full">
        <img
          src="/images/logoAquaplus.png"
          alt="AquaPlus Logo"
          class="w-16 h-16 object-contain animate-pulse"
        />
      </div>
      @if (message()) {
        <p class="text-gray-600 dark:text-gray-300 text-sm font-medium animate-pulse">
          {{ message() }}
        </p>
      }
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class Loader {
  overlay = input<boolean>(false);
  message = input<string>('');
  darkMode = input<boolean>(false);
}
