import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService } from '@services/toast.service';
// implementacion de mejora en e componente de toast https://uiverse.io/hoshikawamaki/weak-cheetah-93
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[1000] w-80 space-y-3">
      @for (toast of service.toasts$ | async; track $index) {
      <ng-container>
        <div
          class="toast flex items-start p-4 rounded-lg border shadow-lg"
          [ngClass]="colorMap[toast.type]"

        >
          <div class="flex-shrink-0">
            @switch (toast.type) {
              @case ('success') {
                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                   d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9
                   10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1
                   1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              }
              @case ('error') {
                <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              }
              @case ('warning') {
                <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              }
              @case ('info') {
                <svg class="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                </svg>
              }
            }
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium" [ngClass]="titleColor[toast.type]">
              {{ toast.title }}
            </h3>
            <p class="mt-1 text-sm" [ngClass]="textColor[toast.type]">
              {{ toast.message }}
            </p>
          </div>
          <button
            class="ml-auto opacity-70 hover:opacity-100"
            (click)="service.dismiss(toast.id)"
          >
            ✕
          </button>
        </div>
      </ng-container>
      }
    </div>
  `,
  styles: [
    `
      .toast {
        animation: slideIn 0.5s forwards, fadeOut 0.5s forwards 3.8s;
      }
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes fadeOut {
        to {
          opacity: 0;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toast {

  service = inject(ToastService);

  colorMap = {
    success: 'bg-green-50 border-green-100',
    error: 'bg-red-50   border-red-100',
    warning: 'bg-yellow-50 border-yellow-100',
    info: 'bg-indigo-50 border-indigo-100',
  };
  titleColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-indigo-800',
  };
  textColor = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-indigo-600',
  };
}
