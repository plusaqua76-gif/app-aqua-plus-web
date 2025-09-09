import {
  Component,
  ChangeDetectionStrategy,
  input,
  WritableSignal,
  output,
  computed,
  effect,
} from '@angular/core';

@Component({
  selector: 'app-pop-up',
  standalone: true,
  template: `
    @if (isOpen()) {
    <div
      id="overlay"
      class="fixed inset-0 z-[900] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      (click)="close()"
    >
      <div
        class="relative w-full max-w-md p-4 pt-16"
        (click)="$event.stopPropagation()"
      >
        <div class="relative bg-black/10 backdrop-blur-xl border-2 border-white/10 rounded-3xl shadow-xl">
          <button
            (click)="close()"
            aria-label="Close"
            class="absolute top-3 end-2.5 h-8 w-8 grid place-content-center
                          text-gray-400 hover:bg-white/10 rounded-lg backdrop-blur-sm"
          >
            <svg class="h-3 w-3" viewBox="0 0 14 14" fill="none">
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>

          @if (isConfirmation()) {
            <!-- Modal de confirmación -->
            <div class="p-6 text-center">
              <svg class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
                   aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                      stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
              </svg>
              <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                {{ title() }}
              </h3>
              <p class="mb-5 text-sm text-gray-500 dark:text-gray-400">
                {{ message() }}
              </p>
              <div class="flex justify-center gap-4">
                <button
                  (click)="onConfirm()"
                  class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none
                         focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm
                         inline-flex items-center px-5 py-2.5 text-center"
                >
                  {{ confirmText() }}
                </button>
                <button
                  (click)="onCancel()"
                  class="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white
                         rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700
                         focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700
                         dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600
                         dark:hover:text-white dark:hover:bg-gray-700"
                >
                  {{ cancelText() }}
                </button>
              </div>
            </div>
          } @else {
            <!-- Modal genérico -->
            <div class="p-8 text-left">
              <h3 class="text-xl font-semibold text-white mb-6 text-center">{{ title() }}</h3>
              <ng-content></ng-content>
            </div>
          }
        </div>
      </div>
    </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupComponent {
  readonly open = input.required<WritableSignal<boolean>>();
  readonly openChange = output<WritableSignal<boolean>>();
  readonly isOpen = computed(() => this.open()());
  readonly title = input<string>('Confirmación');
  readonly message = input<string>('¿Está seguro de realizar esta acción?');
  readonly confirmText = input<string>('Confirmar');
  readonly cancelText = input<string>('Cancelar');
  readonly isConfirmation = input<boolean>(false);
  readonly confirmAction = output<void>();
  readonly cancelAction = output<void>();

  constructor() {
    effect(() => this.openChange.emit(this.open()));
  }

  close = () => this.open().set(false);

  onConfirm = () => {
    this.confirmAction.emit();
    this.close();
  };

  onCancel = () => {
    this.cancelAction.emit();
    this.close();
  };
}
