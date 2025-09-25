import { Component, ChangeDetectionStrategy, AfterViewInit, ElementRef, OnDestroy, Inject, PLATFORM_ID, input, output, viewChild } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'

declare global {
  interface Window {
    Datepicker: any;
  }
}

@Component({
  selector: 'app-datepicker',
  standalone: true,
  template: `
  <div [class]="compact() ? 'relative w-full' : 'relative max-w-sm'">
    <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
      <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
      </svg>
    </div>
    <input
      #datepickerInput
      type="text"
      [class]="compact()
        ? 'w-full px-3 py-2 pl-10 text-sm bg-slate-700 border border-slate-400 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-slate-600'
        : 'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'"
      [placeholder]="placeholder()"
      [value]="value()"
      readonly>
  </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Datepicker implements AfterViewInit, OnDestroy {

  datepickerInput = viewChild.required<ElementRef<HTMLInputElement>>('datepickerInput');
  placeholder = input<string>('Select date');
  value = input<string>('');
  format = input<string>('dd/mm/yyyy');
  autohide = input<boolean>(true);
  compact = input<boolean>(false);  // Nueva propiedad para modo compacto
  dateChange = output<string>();

  private datepicker: any = null;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {}

  ngAfterViewInit(): void {
    // Solo ejecutar en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.initializeDatepicker();
    }
  }

  private async initializeDatepicker(): Promise<void> {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.warn('Datepicker: DOM not available, skipping initialization');
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const { Datepicker } = await import('flowbite-datepicker');
      const inputElement = this.datepickerInput()?.nativeElement;
      if (!inputElement) {
        console.error('Datepicker: Input element not found');
        return;
      }

      this.datepicker = new Datepicker(inputElement, {
        format: this.format(),
        autohide: this.autohide(),
        todayBtn: true,
        clearBtn: true,
        todayBtnText: 'Today',
        clearBtnText: 'Clear'
      });
      inputElement.addEventListener('changeDate', (event: any) => {
        this.dateChange.emit(event.target.value);
      });

    } catch (error) {
      console.error('Error loading Datepicker:', error);
    }
  }

  ngOnDestroy(): void {
    // Solo ejecutar en el navegador
    if (isPlatformBrowser(this.platformId) && this.datepicker) {
      this.datepicker.destroy();
    }
  }
}
