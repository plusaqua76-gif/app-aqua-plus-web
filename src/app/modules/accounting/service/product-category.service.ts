import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { ICategoria } from "@interfaces/Iaccounting";
import { PRODUCT_CATEGORY } from '../../../../environments/environment.variables';

@Injectable({
  providedIn: 'root',
})
export class ProductCategoryService {

  private readonly apiUrl = `${environment.apiUrl}/${PRODUCT_CATEGORY.PRODUCT_CATEGORY}`;
  private readonly http = inject(HttpClient);

  getAllProductCategories(): Observable<ApiResponse<ICategoria[]>> {
    return this.http.get<ApiResponse<ICategoria[]>>(`${this.apiUrl}/all`);
  }

  createCategory(category: ICategoria): Observable<ApiResponse<ICategoria>> {
    return this.http.post<ApiResponse<ICategoria>>(`${this.apiUrl}`, category);
  }

}
