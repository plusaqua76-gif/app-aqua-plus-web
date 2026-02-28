import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.prod';
import { catchError, Observable, throwError } from 'rxjs';
import { IDepartament } from '@interfaces/Idepartament';
import { ApiResponse } from '@interfaces/Iresponse';

@Injectable({
  providedIn: 'root'
})
export class DepartamentService {

  private apiUrl = `${environment.apiUrl}`;

  protected readonly router= inject(Router)
  protected readonly http= inject(HttpClient)

  // esto se debe eliminar

  getAllDepartaments(): Observable<ApiResponse<IDepartament[]>> {
    return this.http.get<ApiResponse<IDepartament[]>>(`${this.apiUrl}/departamento/all`)
  }

}
