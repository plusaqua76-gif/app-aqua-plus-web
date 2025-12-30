import { HttpClient } from "@angular/common/http";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { Observable } from "rxjs";
import { Department, Municipality } from "@interfaces/invoice/invoice.interface";
import { ApiResponse } from "@interfaces/Iresponse";


@Injectable({
  providedIn: 'root'
})
export class LocationDianService {

  readonly http = inject(HttpClient);
  readonly platformId = inject(PLATFORM_ID);
  readonly apiUrl = `${environment.apiUrl}`;

  // GetDepartmentsDian(): Observable<Department[]> {
  //   return this.http.get<Department[]>(`${this.apiUrl}/lista-dian/departments`);
  // }

  // GetMunicipalitiesByDepartment(departmentCode: string): Observable<Municipality[]> {
  //   return this.http.get<Municipality[]>(`${this.apiUrl}/lista-dian/municipalities?departamento=${departmentCode}`);
  // }

    // getPaymentMethodsDian(): Observable<ApiResponse<UnitCodes[]>> {
    //   return this.http.get<ApiResponse<UnitCodes[]>>(`${this.apiUrl}/lista-dian`, {
    //     params: {
    //       endPoint: '/dian/payment-methods',
    //     },
    //   });
    // }

    GetDepartmentsDian(): Observable<ApiResponse<Department[]>> {
      return this.http.get<ApiResponse<Department[]>>(`${this.apiUrl}/lista-dian`, {
        params: {
          endPoint: '/dian/departments',
        }
      });
    }

    GetMunicipalitiesByDepartment(departmentCode: string): Observable<ApiResponse<Municipality[]>> {
      return this.http.get<ApiResponse<Municipality[]>>(`${this.apiUrl}/lista-dian`, {
        params: {
          endPoint: 'dian/municipalities',
          departamento: departmentCode
        }
      })
    }



}
