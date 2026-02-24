import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.local';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICounter } from '@interfaces/Icounter';
import { ApiResponse } from '@interfaces/Iresponse';
import { AforoInterface, AforoResponse } from '@interfaces/Aforo/AforoInterface';
import { IParametroGeneral } from '@interfaces/INovelty/IClienteNovedad';


@Injectable({
  providedIn: 'root'
})
export class CounterService {

  private readonly apiUrl = `${environment.apiUrl}`;
  protected readonly router= inject(Router)
  protected readonly http= inject(HttpClient)

  saveCounter(counter: ICounter): Observable<ICounter> {
    return this.http.post<ICounter>(`${this.apiUrl}/contador`, counter);
  }

  aforosEnterprice(idEnterprice: number): Observable<ApiResponse<AforoResponse>> {
    return this.http.get<ApiResponse<AforoResponse>>(`${this.apiUrl}/aforo/empresa/${idEnterprice}`);
  }

  saveAforo(aforo: AforoInterface): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/aforo`, aforo);
  }

  typeAforo(code: string): Observable<ApiResponse<IParametroGeneral[]>> {
    return this.http.get<ApiResponse<IParametroGeneral[]>>(`${this.apiUrl}/parametros-generales/codigo/${code}`);
  }

  updateAforo(id: number, aforo: Partial<AforoInterface>): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/aforo/${id}`, aforo);
  }

  deleteAforo(idAforo: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/aforo/${idAforo}`);
  }

}
