import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  TemplateRef,
  signal,
  computed,
} from '@angular/core';

export interface Action<T = any> {
  action: string;
  row?: T;
}

@Component({
  selector: 'app-table-dynamic',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-6 pb-0">
      <div class="mb-6">
        <h1
          class="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-200 mb-4"
        >
          {{ title() }}
        </h1>

        <div
          class="flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
        >
          <div class="w-full max-w-sm">
            <input
              type="text"
              placeholder="Buscar..."
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              (input)="onSearchInput($event)"
            />
          </div>

          <div class="flex items-center gap-4">
            <select
              class="px-7 py-3 pl-4 rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
              [value]="pageSize()"
              (change)="onPageSizeChange($event)"
            >
              @for (opt of pageSizeOptions; track opt) {
                <option [value]="opt">{{ opt }}</option>
              }
            </select>
          </div>

          @if (showAddButton()) {
            <button
              class="bg-blue-200 hover:bg-blue-400 text-gray-700 font-bold py-3 px-6 rounded-lg shadow-lg shadow-neutral-400 hover:text-white transform transition-all duration-500 ease-in-out hover:scale-110 hover:brightness-110 hover:animate-pulse active:animate-bounce flex items-center gap-4 whitespace-nowrap cursor-pointer"
              (click)="onAction('add', null)"
            >
              <svg
                class="w-6 h-6"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H7Zm8-1a1 1 0 0 1 1-1h1v-1a1 1 0 1 1 2 0v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 0 1-1-1Z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ addButtonText() }}
            </button>
          }
        </div>
      </div>
    </div>

    <div
      class="relative overflow-x-auto shadow-md sm:rounded-t-lg mx-4 sm:mx-6 lg:mx-8 bg-white dark:bg-gray-900"
    >
      <table
        class="w-full text-sm text-left rtl:text-right text-gray-700 dark:text-gray-500"
      >
        <thead
          class="text-xs uppercase bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            @for (column of columns(); track column) {
              <th
                scope="col"
                class="px-6 py-3 font-medium text-gray-700 dark:text-gray-300"
              >
                {{ column.header }}
              </th>
            }
            <th scope="col" class="px-6 py-3">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody>
          @if (pagedRows().length) {
            @for (row of pagedRows(); track trackById($index, row)) {
              <tr
                class="bg-white border-b border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
              >
                @for (col of columns(); track col) {
                  <td
                    class="px-6 py-4 text-gray-900 dark:text-gray-300 font-medium"
                  >
                    {{ row[col.field] }}
                  </td>
                }
                <td class="px-6 py-4 text-right">
                  @if (actionTemplate()) {
                    <ng-container
                      [ngTemplateOutlet]="actionTemplate()"
                      [ngTemplateOutletContext]="{ $implicit: row, row }"
                    />
                  } @else {
                    <button
                      class="font-medium text-blue-600 hover:underline dark:text-blue-400"
                      (click)="onAction('edit', row)"
                    >
                      Edit
                    </button>
                  }
                </td>
              </tr>
            }
          } @else {
            <tr>
              <td
                [attr.colspan]="columns().length + 1"
                class="text-center py-6 text-gray-500 dark:text-gray-500"
              >
                Sin registros
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Footer de paginación separado del scroll -->
    <div
      class="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 text-sm shadow-md sm:rounded-b-lg mx-4 sm:mx-6 lg:mx-8"
    >
      <span>
        Showing {{ startEntry() }} to {{ endEntry() }} of
        {{ filtered().length }} entries
      </span>

      <nav class="mt-3 sm:mt-0 inline-flex items-center gap-1">
        <button
          class="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
          [disabled]="pageIndex() === 0"
          (click)="prevPage()"
        >
          ‹
        </button>

        @for (i of createRange(totalPages()); track i) {
          <button
            class="w-8 py-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
            [class.bg-blue-600]="i === pageIndex()"
            [class.text-white]="i === pageIndex()"
            (click)="goToPage(i)"
          >
            {{ i + 1 }}
          </button>
        }

        <button
          class="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
          [disabled]="pageIndex() >= totalPages() - 1"
          (click)="nextPage()"
        >
          ›
        </button>
      </nav>
    </div>
  `,
})
export class TableComponent {
  columns = input<{ field: string; header: string }[]>([]);
  title = input<string>('');
  datasource = input<any[]>([]);
  actionTemplate = input<TemplateRef<any> | null>(null);
  showAddButton = input<boolean>(false);
  addButtonText = input<string>('Agregar');
  columnTemplates = input<Record<string, TemplateRef<any>>>({});
  showSecondaryButton = input<boolean>(false);
  secondaryButtonText = input<string>('Crear');
  action = output<Action>();
  secondaryButtonAction = output<void>();


  private readonly search = signal<string>('');
  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.search.set(value);
    this.pageIndex.set(0);
  }

  readonly pageSizeOptions = [5, 10, 25, 50];
  readonly pageSize = signal<number>(this.pageSizeOptions[0]);
  readonly pageIndex = signal<number>(0);

  onPageSizeChange(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    this.pageSize.set(value);
    this.pageIndex.set(0);
  }

  prevPage() {
    this.pageIndex.update((i) => Math.max(i - 1, 0));
  }
  nextPage() {
    this.pageIndex.update((i) =>
      Math.min(i + 1, this.totalPages() - 1),
    );
  }
  goToPage(i: number) {
    this.pageIndex.set(i);
  }

  readonly filtered = computed(() => {
    const term = this.search().toLowerCase().trim();
    if (!term) return this.datasource() ?? [];
    return (this.datasource() ?? []).filter((row) =>
      this.columns().some((col) =>
        String(row[col.field] ?? '')
          .toLowerCase()
          .includes(term),
      ),
    );
  });

  readonly totalPages = computed(() =>
    Math.max(
      1,
      Math.ceil(this.filtered().length / this.pageSize()),
    ),
  );

  readonly pagedRows = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  createRange = (n: number) =>
    Array.from({ length: n }, (_, i) => i);

  readonly startEntry = computed(() =>
    this.filtered().length ? this.pageIndex() * this.pageSize() + 1 : 0,
  );
  readonly endEntry = computed(() =>
    Math.min(
      this.filtered().length,
      (this.pageIndex() + 1) * this.pageSize(),
    ),
  );

  onAction(type: string, row: any) {
    this.action.emit({ action: type, row });
  }

  trackById = (_: number, row: any) => row.id ?? _;
}
