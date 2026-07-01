export interface Action<T = any> {
  action: string;
  row?: T;
}

export interface SelectFilterOption {
  label: string;
  value: string;
  badgeClass?: string;
}

export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'date' | 'number' | 'currency';
  defaultValue?: string;
  sortable?: boolean;
  filterOptions?: SelectFilterOption[];
  filterPlaceholder?: string;
  filterVariant?: 'select' | 'badge';
}

export type SortDirection = 'asc' | 'desc';

export interface EnterpriseHeaderData {
  nombre: string;
  nit: string;
  version: string;
  fecha: string;
  logoBase64: string | null;
  logoExtension: 'png' | 'jpeg' | 'gif';
}