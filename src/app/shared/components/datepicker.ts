import { Component, signal, computed, input, output, Renderer2, ViewContainerRef, TemplateRef, viewChild, effect } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div [class]="compact() ? 'relative w-full' : 'relative max-w-sm'">
    <!-- Input Field -->
    <div class="relative">
      <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
        <svg class="w-4 h-4 text-blue-500 dark:text-blue-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
          <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
        </svg>
      </div>
      <input
        type="text"
        [class]="compact()
          ? 'w-full ps-9 pe-3 py-2.5 text-sm bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/30 dark:border-slate-600/30 rounded-lg text-gray-800 dark:text-white placeholder-gray-600 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white/30 dark:hover:bg-slate-700/30 cursor-pointer shadow-xs'
          : 'block w-full ps-9 pe-3 py-2.5 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/30 dark:border-slate-600/30 text-gray-800 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 dark:placeholder-gray-300 transition-all duration-200 hover:bg-white/30 dark:hover:bg-slate-700/30 cursor-pointer shadow-xs'"
        [placeholder]="placeholder()"
        [value]="selectedDateFormatted()"
        (click)="toggleCalendar()"
        readonly>
    </div>
  </div>

  <!-- Calendar Modal Template (rendered in body) -->
  <ng-template #calendarModal>
    @if (isOpen()) {
      <div class="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
           style="z-index: 999999; position: fixed; top: 0; left: 0; right: 0; bottom: 0;"
           (click)="closeCalendar()">
        <div class="relative p-6 bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/30 dark:border-slate-600/30 rounded-2xl shadow-2xl w-[340px]"
             style="z-index: 1000000;"
             (click)="$event.stopPropagation()">

        <!-- Header: Month and Year Display -->
        <div class="flex items-center justify-center mb-6 gap-3">
          <button (click)="previousMonth()"
                  class="p-2.5 hover:bg-white/20 dark:hover:bg-slate-700/30 rounded-xl transition-all duration-200 text-gray-800 dark:text-white hover:scale-110">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <div class="flex gap-2 items-center">
            <!-- Month Selector -->
            <select [(ngModel)]="currentMonth"
                    (change)="updateCalendar()"
                    (click)="$event.stopPropagation()"
                    (mousedown)="$event.stopPropagation()"
                    class="px-3 py-2 text-base font-semibold bg-white/30 dark:bg-slate-700/30 backdrop-blur-sm border border-white/40 dark:border-slate-600/40 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 cursor-pointer">
              @for (month of months; track $index) {
                <option [value]="$index" class="bg-slate-800 text-white">{{ month }}</option>
              }
            </select>

            <!-- Year Selector -->
            <select [(ngModel)]="currentYear"
                    (change)="updateCalendar()"
                    (click)="$event.stopPropagation()"
                    (mousedown)="$event.stopPropagation()"
                    class="px-3 py-2 text-base font-semibold bg-white/30 dark:bg-slate-700/30 backdrop-blur-sm border border-white/40 dark:border-slate-600/40 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 cursor-pointer">
              @for (year of years(); track year) {
                <option [value]="year" class="bg-slate-800 text-white">{{ year }}</option>
              }
            </select>
          </div>

          <button (click)="nextMonth()"
                  class="p-2.5 hover:bg-white/20 dark:hover:bg-slate-700/30 rounded-xl transition-all duration-200 text-gray-800 dark:text-white hover:scale-110">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- Days of Week -->
        <div class="grid grid-cols-7 gap-2 mb-3">
          @for (day of daysOfWeek; track day) {
            <div class="text-center text-xs font-bold text-blue-600 dark:text-blue-400 py-2 uppercase">
              {{ day }}
            </div>
          }
        </div>

        <!-- Calendar Days Grid -->
        <div class="grid grid-cols-7 gap-2 mb-4">
          @for (day of calendarDays(); track day.date) {
            <button
              (click)="selectDate(day)"
              [disabled]="!day.isCurrentMonth"
              [class]="getDayClasses(day)"
              class="aspect-square flex items-center justify-center text-sm rounded-xl transition-all duration-200 hover:scale-110">
              {{ day.day }}
            </button>
          }
        </div>

        <!-- Footer Actions -->
        <div class="flex gap-3 mt-5 pt-4 border-t border-white/20 dark:border-slate-600/20">
          <button (click)="selectToday()"
                  class="relative flex-1 bg-gradient-to-br from-blue-500/10 to-blue-600/20 hover:bg-blue-500/30 border border-blue-500/30 backdrop-blur-md text-blue-700 dark:text-blue-300 font-semibold py-2.5 px-4 rounded-xl hover:border-blue-500/50 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 flex items-center gap-2 justify-center overflow-hidden group">
            <span class="relative z-20">Hoy</span>
            <span class="absolute left-[-75%] top-0 h-full w-[50%] bg-blue-400/30 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"></span>
          </button>
          <button (click)="clearDate()"
                  class="relative flex-1 bg-gradient-to-br from-red-500/10 to-red-600/20 hover:bg-red-500/30 border border-red-500/30 backdrop-blur-md text-red-700 dark:text-red-300 font-semibold py-2.5 px-4 rounded-xl hover:border-red-500/50 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 active:scale-95 flex items-center gap-2 justify-center overflow-hidden group">
            <span class="relative z-20">Limpiar</span>
            <span class="absolute left-[-75%] top-0 h-full w-[50%] bg-red-400/30 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out"></span>
          </button>
        </div>
        </div>
      </div>
    }
  </ng-template>
  `,
  styles: [`
    :host {
      display: contents;
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
    select option {
      @apply bg-slate-800 text-white;
    }
  `]
})
export class Datepicker {
  // Template reference
  calendarModal = viewChild<TemplateRef<any>>('calendarModal');

  // Inputs
  placeholder = input<string>('Selecciona una fecha');
  value = input<string>('');
  format = input<string>('dd/mm/yyyy');
  compact = input<boolean>(false);

  // Output
  dateChange = output<string>();

  // State
  isOpen = signal(false);
  selectedDate = signal<Date | null>(null);
  currentMonth = signal(new Date().getMonth());
  currentYear = signal(new Date().getFullYear());

  private modalContainer?: HTMLElement;
  private embeddedView?: any;

  constructor(
    private renderer: Renderer2,
    private viewContainerRef: ViewContainerRef
  ) {
    // Effect to handle modal rendering
    effect(() => {
      if (this.isOpen()) {
        this.renderModalInBody();
      } else {
        this.removeModalFromBody();
      }
    });
  }

  private renderModalInBody(): void {
    if (typeof document === 'undefined') return;

    // Clean up previous view if exists
    this.removeModalFromBody();

    // Create container if it doesn't exist
    if (!this.modalContainer) {
      this.modalContainer = this.renderer.createElement('div');
      this.renderer.addClass(this.modalContainer, 'datepicker-modal-container');
      this.renderer.setStyle(this.modalContainer, 'position', 'fixed');
      this.renderer.setStyle(this.modalContainer, 'z-index', '999999');
      this.renderer.setStyle(this.modalContainer, 'pointer-events', 'auto');
      this.renderer.appendChild(document.body, this.modalContainer);
    }

    // Render template
    const template = this.calendarModal();
    if (template) {
      this.embeddedView = this.viewContainerRef.createEmbeddedView(template);
      this.embeddedView.detectChanges();

      this.embeddedView.rootNodes.forEach((node: any) => {
        if (node) {
          this.renderer.appendChild(this.modalContainer, node);
        }
      });
    }
  }

  private removeModalFromBody(): void {
    if (this.embeddedView) {
      this.embeddedView.destroy();
      this.embeddedView = undefined;
    }
    this.viewContainerRef.clear();
    if (this.modalContainer && typeof document !== 'undefined') {
      this.renderer.removeChild(document.body, this.modalContainer);
      this.modalContainer = undefined;
    }
  }

  ngOnDestroy(): void {
    this.removeModalFromBody();
  }

  // Data
  months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  daysOfWeek = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

  // Computed
  years = computed(() => {
    const currentYear = new Date().getFullYear();
    const yearsList: number[] = [];
    for (let i = currentYear - 50; i <= currentYear + 10; i++) {
      yearsList.push(i);
    }
    return yearsList;
  });

  calendarDays = computed(() => {
    const days: Array<{
      date: Date;
      day: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    const month = this.currentMonth();
    const year = this.currentYear();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        isSelected: this.isSelectedDate(date)
      });
    }

    // Current month days
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        day,
        isCurrentMonth: true,
        isToday: this.isToday(date),
        isSelected: this.isSelectedDate(date)
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        isSelected: this.isSelectedDate(date)
      });
    }

    return days;
  });

  selectedDateFormatted = computed(() => {
    const date = this.selectedDate();
    if (!date) return this.value();

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  });

  toggleCalendar(): void {
    this.isOpen.update(v => !v);
  }

  closeCalendar(): void {
    this.isOpen.set(false);
  }

  selectDate(day: any): void {
    if (!day.isCurrentMonth) return;

    this.selectedDate.set(day.date);
    this.dateChange.emit(this.selectedDateFormatted());
    this.isOpen.set(false);
  }

  selectToday(): void {
    const today = new Date();
    this.selectedDate.set(today);
    this.currentMonth.set(today.getMonth());
    this.currentYear.set(today.getFullYear());
    this.dateChange.emit(this.selectedDateFormatted());
    this.isOpen.set(false);
  }

  clearDate(): void {
    this.selectedDate.set(null);
    this.dateChange.emit('');
    this.isOpen.set(false);
  }

  previousMonth(): void {
    const month = this.currentMonth();
    if (month === 0) {
      this.currentMonth.set(11);
      this.currentYear.update(year => year - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
  }

  nextMonth(): void {
    const month = this.currentMonth();
    if (month === 11) {
      this.currentMonth.set(0);
      this.currentYear.update(year => year + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
  }

  updateCalendar(): void {
    // Los signals se actualizan automáticamente con ngModel
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  private isSelectedDate(date: Date): boolean {
    const selected = this.selectedDate();
    if (!selected) return false;
    return date.getDate() === selected.getDate() &&
           date.getMonth() === selected.getMonth() &&
           date.getFullYear() === selected.getFullYear();
  }

  getDayClasses(day: any): string {
    const baseClasses = 'font-semibold';

    if (!day.isCurrentMonth) {
      return `${baseClasses} text-gray-400/50 dark:text-gray-600/50 cursor-not-allowed hover:scale-100 opacity-50`;
    }

    if (day.isSelected) {
      return `${baseClasses} bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50 border-2 border-blue-400`;
    }

    if (day.isToday) {
      return `${baseClasses} bg-blue-500/40 text-gray-800 dark:text-white border-2 border-blue-500 hover:bg-blue-500/50`;
    }

    return `${baseClasses} text-gray-800 dark:text-white hover:bg-white/30 dark:hover:bg-slate-700/40 hover:shadow-md`;
  }
}
