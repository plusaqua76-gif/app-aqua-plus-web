import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '@interfaces/Iresponse';
import { IParametroGeneral } from '@interfaces/INovelty/IClienteNovedad';

@Injectable({
  providedIn: 'root'
})
export class GeneralsParamsService {

  private readonly apiUrl = `${environment.apiUrl}`;
  protected readonly http = inject(HttpClient);

   getGeneralsParams(): Observable<ApiResponse<IParametroGeneral[]>>{
    return this.http.get<ApiResponse<IParametroGeneral[]>>(`${this.apiUrl}/parametros-generales/all`);
  }


}
