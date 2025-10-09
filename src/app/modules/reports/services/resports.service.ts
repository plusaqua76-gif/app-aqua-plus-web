import { HttpClient } from '@angular/common/http';
import { inject, Injectable,  } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { Observable } from 'rxjs';
import { ApiResponse } from '@interfaces/Iresponse';
import { IReport } from '@interfaces/reports/IReports';
import { FiltroItem } from '@interfaces/reports/filtersReports';
import { IReportResult } from '@interfaces/reports/IReportResult';

@Injectable({
  providedIn: 'root'
})
export class ResportsService {

  private readonly http = inject(HttpClient);
  readonly apiUrl = `${environment.apiUrl}`;

  getReports(): Observable<ApiResponse<IReport[]>> {
    return this.http.get<ApiResponse<IReport[]>>(`${this.apiUrl}/reporte/reportes`);
  }

  getFilteredReports(idReport: number): Observable<ApiResponse<FiltroItem[]>> {
    return this.http.get<ApiResponse<FiltroItem[]>>(`${this.apiUrl}/reporte-filtro/reporte/${idReport}`);
  }


  getReport(schema: string, nombre: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reporte-filtro/fn-list/${schema}/${nombre}`);
  }

  generateReportWithFilters(schema: string, nombre: string, filters: any): Observable<ApiResponse<IReportResult>> {
    return this.http.post<ApiResponse<IReportResult>>(`${this.apiUrl}/reporte-filtro/fn-list/${schema}/${nombre}`, filters);
  }

}
