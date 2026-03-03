import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPerson } from '@interfaces/Iperson';
import { ApiResponse } from '@interfaces/Iresponse';
import { IAddressRequest } from '@interfaces/Iaddress';


@Injectable({
  providedIn: 'root'
})
export class PersonService {

  private readonly apiUrl = `${environment.apiUrl}`;
  protected readonly router= inject(Router)
  protected readonly http= inject(HttpClient)


  savaOrUpdatePerson(person: IPerson): Observable<ApiResponse<IPerson>> {
    return this.http.post<ApiResponse<IPerson>>(`${this.apiUrl}/persona`, person);
  }

  getPersonById(id: number): Observable<ApiResponse<IPerson>> {
    return this.http.get<ApiResponse<IPerson>>(`${this.apiUrl}/persona/${id}`);
  }

  saveDirection(location: IAddressRequest): Observable<ApiResponse<IAddressRequest>> {
    return this.http.post<ApiResponse<IAddressRequest>>(`${this.apiUrl}/direccion`, location);
  }

  createDireccionLocation(location: IAddressRequest): Observable<ApiResponse<IAddressRequest>> {
    return this.http.post<ApiResponse<IAddressRequest>>(`${this.apiUrl}/direccion`, location);
  }

}
