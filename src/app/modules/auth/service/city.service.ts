import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { ICity } from '@interfaces/Icity';
import { ApiResponse } from '@interfaces/Iresponse';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  private apiUrl = `${environment.apiUrl}`;
  protected readonly http = inject(HttpClient);

  // esto se debe eliminar

  getAllCitys(): Observable<ApiResponse<ICity[]>> {
    return this.http.get<ApiResponse<ICity[]>>(`${this.apiUrl}/ciudad/all`)
  }

}
