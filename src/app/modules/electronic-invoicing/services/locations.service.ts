import { HttpClient } from "@angular/common/http";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { ResponseValueCode, Municipality } from "@interfaces/invoice/invoice.interface";
import { ApiResponse } from "@interfaces/Iresponse";


@Injectable({
  providedIn: 'root'
})
export class LocationDianService {

  readonly http = inject(HttpClient);
  readonly platformId = inject(PLATFORM_ID);
  readonly apiUrl = `${environment.apiUrl}`;

    GetDepartmentsDian(): Observable<ApiResponse<ResponseValueCode[]>> {
      return this.http.get<ApiResponse<ResponseValueCode[]>>(`${this.apiUrl}/lista-dian`, {
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

    getTypeDocumentsDian(): Observable<ApiResponse<ResponseValueCode[]>> {
      return this.http.get<ApiResponse<ResponseValueCode[]>>(`${this.apiUrl}/lista-dian`, {
        params: {
          endPoint: '/dian/identification-types',
        }
      });
    }



}
