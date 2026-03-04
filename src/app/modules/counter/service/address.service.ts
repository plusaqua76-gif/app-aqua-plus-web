import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ADDRESS, TYPE_COUNTER } from '../../../environments/environment.variables';
import { Observable } from 'rxjs';
import { ApiResponse } from '@interfaces/Iresponse';
import { ITypeCounter } from '@interfaces/ItypeCounter';
import { Router } from '@angular/router';
import { ICounter } from '@interfaces/Icounter';
import { IAddress } from '@interfaces/Iaddress';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private apiUrl = `${environment.apiUrl}/${ADDRESS.ADDRESS}`;
  protected readonly router = inject(Router);
  protected readonly http = inject(HttpClient);

  updateAddress(address: IAddress): Observable<ApiResponse<IAddress>> {
    const url = `${this.apiUrl}`;
    return this.http.post<ApiResponse<IAddress>>(url, address);
  }
}
