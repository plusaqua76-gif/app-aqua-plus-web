import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.local";
import { rxResource } from "@angular/core/rxjs-interop";
import { ApiResponse } from "@interfaces/Iresponse";
import { catchError, map, of } from "rxjs";

export interface CategoryCount {
    id: number;
    nombre: string;
    codigo: string;
}


@Injectable({
  providedIn: 'root'
})
export class CategoryCountEagerInitializationService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;

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
