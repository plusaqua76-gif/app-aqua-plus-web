import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('overlayFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('spinnerScale', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.7)' }),
        animate('350ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.7)' }))
      ])
    ]),
    trigger('messageFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('300ms 150ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(8px)' }))
      ])
    ])
  ],
  template: `
    @if (visible()) {
      <div 
        @overlayFade
        [ngClass]="{
          'flex-col gap-4 w-full flex items-center justify-center': true,
          'fixed inset-0 backdrop-blur-sm z-50 transition-[backdrop-filter] duration-300': overlay(),
          'bg-white/80': overlay() && !darkMode(),
          'dark:bg-black/80': overlay() && darkMode()
        }"
      >
        <div 
          @spinnerScale
          class="w-28 h-28 border-8 text-blue-400 text-4xl animate-spin border-gray-300 flex items-center justify-center border-t-blue-400 rounded-full"
        >
          <img
            src="/images/logoAquaplus.webp"
            alt="AquaPlus Logo"
            class="w-16 h-16 object-contain animate-pulse"
          />
        </div>
        @if (message()) {
          <p 
            @messageFade
            class="text-gray-600 dark:text-gray-300 text-sm font-medium animate-pulse"
          >
            {{ message() }}
          </p>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class Loader {
  visible = input<boolean>(true);
  overlay = input<boolean>(false);
  message = input<string>('');
  darkMode = input<boolean>(false);
}
