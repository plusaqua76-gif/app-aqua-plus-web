import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { ApiResponse } from '@interfaces/Iresponse';
import { ICorregimiento } from '@interfaces/icorregimiento';

@Injectable({
  providedIn: 'root'
})
export class CorregimientoService {

  private apiUrl = `${environment.apiUrl}`;
  protected readonly http = inject(HttpClient);

    // esto se debe eliminar

  getAllCorregimientos(): Observable<ApiResponse<ICorregimiento[]>> {
    return this.http.get<ApiResponse<ICorregimiento[]>>(`${this.apiUrl}/corregimiento/all`)
  }

}
