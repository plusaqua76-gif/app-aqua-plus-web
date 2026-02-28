import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';
import { Observable } from 'rxjs';
import { ApiResponse } from '@interfaces/Iresponse';
import { IEnterpriseResponse } from '@interfaces/Ienterprise';

export interface IImageEnterprise {
  ruta: string;
  imagen: string;
}


@Injectable({ providedIn: 'root' })
export class EnterpriseInformationService {

  readonly platformId = inject(PLATFORM_ID);
  readonly http = inject(HttpClient);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly apiUrl = environment.apiUrl;

  getEnterpriseInformation(id: number): Observable<ApiResponse<IEnterpriseResponse>> {
    return this.http.get<ApiResponse<IEnterpriseResponse>>(`${this.apiUrl}/empresa/${id}`);
  }

  updateEnterprice(empresa: IEnterpriseResponse): Observable<ApiResponse<IEnterpriseResponse>> {
    return this.http.put<ApiResponse<IEnterpriseResponse>>(`${this.apiUrl}/empresa`, empresa);
  }

  updateImageEnterprice(imagen: IImageEnterprise): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/documento/actualizar`, imagen);
  }
}
