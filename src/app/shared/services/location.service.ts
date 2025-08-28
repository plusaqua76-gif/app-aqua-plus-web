import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IDepartament } from '@interfaces/Idepartament';
import { ICity } from '@interfaces/Icity';
import { ICorregimiento } from '@interfaces/icorregimiento';



@Injectable({ providedIn: 'root' })
export class LocationService {

  //cambiar esto que es solo para una prueba pequeñita
  private readonly base = 'https://app-aqua-plus-api.azurewebsites.net/api/v1';

  constructor(private http: HttpClient) {}

  getDepartamentos(): Observable<IDepartament[]> {
    return this.http.get<IDepartament[]>(`${this.base}/departamento/all`);
  }

  getCiudades(depId: number): Observable<ICity[]> {
    return this.http.get<ICity[]>(`${this.base}/ciudad/departamento/${depId}`);
  }

  getCorregimientos(cityId: number): Observable<ICorregimiento[]> {
    return this.http.get<ICorregimiento[]>(`${this.base}/corregimiento/ciudad/${cityId}`);
  }
}
