import { Injectable, signal } from '@angular/core';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';


@Injectable()
export class TableStateService {
  private readonly _paginationParams = signal<IPaginationParams>({
    page: 0,
    size: 5,
  });

  private readonly _columnFilters = signal<Record<string, string>>({});
  private readonly _filtersVisible = signal<boolean>(false);
  private readonly _searchTerm = signal<string>('');

  get paginationParams() {
    return this._paginationParams.asReadonly();
  }


  get columnFilters() {
    return this._columnFilters.asReadonly();
  }


  get filtersVisible() {
    return this._filtersVisible.asReadonly();
  }


  get searchTerm() {
    return this._searchTerm.asReadonly();
  }


  updatePagination(params: IPaginationParams): void {
    this._paginationParams.set(params);
  }


  updateFilters(filters: Record<string, string>): void {
    this._columnFilters.set(filters);
  }

  updateFiltersVisibility(visible: boolean): void {
    this._filtersVisible.set(visible);
  }

  updateSearchTerm(term: string): void {
    this._searchTerm.set(term);
  }


  clearFilters(): void {
    this._columnFilters.set({});
  }


  clearAll(): void {
    this._columnFilters.set({});
    this._searchTerm.set('');
  }

  reset(): void {
    this._paginationParams.set({ page: 0, size: 5 });
    this._columnFilters.set({});
    this._filtersVisible.set(false);
    this._searchTerm.set('');
  }


  hasActiveFilters(): boolean {
    const filters = this._columnFilters();
    return Object.values(filters).some(value => value.trim() !== '');
  }


  hasActiveSearch(): boolean {
    return this._searchTerm().trim() !== '';
  }


  hasAnyActiveFilter(): boolean {
    return this.hasActiveFilters() || this.hasActiveSearch();
  }


  getStateSnapshot() {
    return {
      pagination: this._paginationParams(),
      filters: this._columnFilters(),
      filtersVisible: this._filtersVisible(),
      searchTerm: this._searchTerm(),
      hasActiveFilters: this.hasActiveFilters(),
      hasActiveSearch: this.hasActiveSearch()
    };
  }
}
