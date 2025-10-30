export interface IReportResult {
  headers: string[];
  rows: Record<string, any>[];
  total: number;
  page: number;
  size: number;
  pages: number;
  out_tip_res: string;
  out_cod_error: string | null;
  out_desc_error: string | null;
}

export interface IReportRow {
  [key: string]: string | number | boolean | null;
}
