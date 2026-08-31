import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '@interfaces/Iresponse';
import { IEmpresaWompi, IEmpresaWompiRequest } from '@interfaces/pyment/empresa-wompi';

@Injectable({ providedIn: 'root' })
export class WompiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  guardarConfigWompi(config: IEmpresaWompiRequest): Observable<ApiResponse<IEmpresaWompi>> {
    return this.http.post<ApiResponse<IEmpresaWompi>>(`${this.apiUrl}/empresa-wompi`, config);
  }

  obtenerConfigWompi(idEmpresa: number): Observable<ApiResponse<IEmpresaWompi>> {
    return this.http.get<ApiResponse<IEmpresaWompi>>(`${this.apiUrl}/empresa-wompi/${idEmpresa}`);
  }
}
