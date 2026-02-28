import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { IDepartament } from '@interfaces/Idepartament';
import { ICity } from '@interfaces/Icity';
import { ICorregimiento } from '@interfaces/icorregimiento';
import { environment } from '../../environments/environment.prod';
import { ApiResponse } from '@interfaces/Iresponse';



@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;

  getDepartamentos(): Observable<ApiResponse<IDepartament[]>> {
    return this.http.get<ApiResponse<IDepartament[]>>(`${this.apiUrl}/departamento/all`).pipe(map((response) => response));
  }

  getCiudades(depId: number): Observable<ApiResponse<ICity[]>> {
    return this.http.get<ApiResponse<ICity[]>>(`${this.apiUrl}/ciudad/departamento/${depId}`).pipe(map((response) => response));
  }

  getCorregimientos(cityId: number): Observable<ApiResponse<ICorregimiento[]>> {
    return this.http.get<ApiResponse<ICorregimiento[]>>(`${this.apiUrl}/corregimiento/ciudad/${cityId}`).pipe(map((response) => response));
  }
}
