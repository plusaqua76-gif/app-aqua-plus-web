import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { TYPE_COUNTER } from '../../../environments/environment.variables';
import { Observable } from 'rxjs';
import { ApiResponse } from '@interfaces/Iresponse';
import { ITypeCounter } from '@interfaces/ItypeCounter';
import { Router } from '@angular/router';
import { ICounter } from '@interfaces/Icounter';

@Injectable({
  providedIn: 'root',
})
export class TypeCounterService {
  private apiUrl = `${environment.apiUrl}/${TYPE_COUNTER.TYPE_COUNTER}`;
  protected readonly router = inject(Router);
  protected readonly http = inject(HttpClient);

  getAllTypeCounters(): Observable<ApiResponse<ITypeCounter[]>> {
    const url = `${this.apiUrl}/${TYPE_COUNTER.GET_ALL}`;
    return this.http.get<ApiResponse<ITypeCounter[]>>(url);
  }
}
