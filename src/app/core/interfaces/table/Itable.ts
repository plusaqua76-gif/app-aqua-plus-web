export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'date' | 'number' | 'currency';
  defaultValue?: string;
}
