import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { rxResource } from "@angular/core/rxjs-interop";
import { ApiResponse } from "@interfaces/Iresponse";
import { catchError, map, Observable, of } from "rxjs";

export interface CategoryCount {
    id: number;
    nombre: string;
    codigo: string;
    activo?: boolean;
    usuarioCreacion?: string;
}



@Injectable({
  providedIn: 'root'
})
export class CategoryCountEagerInitializationService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;

  createCategoryCount(categoryCount: CategoryCount):Observable<any> {
    return this.http.post<CategoryCount>(
      `${this.apiUrl}/categoria-cuenta`,
      categoryCount
    );
  }

  deleteCategoryCount(id: number):Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/categoria-cuenta/${id}`
    );
  }

  private categoryResource = rxResource({
    stream: () => {
      return this.http.get<ApiResponse<CategoryCount[]>>(
        `${this.apiUrl}/categoria-cuenta/all`
      ).pipe(
        map(response => response.response),
        catchError(() => of(null))
      );
    }
  });

  readonly categoryCount = this.categoryResource.value;
  readonly isLoading = this.categoryResource.isLoading;
  readonly error = this.categoryResource.error;

}
