import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.prod";
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError, Observable, throwError } from "rxjs";
import { ApiResponse } from "@interfaces/Iresponse";
import { IPaginationParams, IPaginatedResponse } from "@interfaces/IpaginatedResponse";
import { IAccount, IAccountFilters, ICreateAccount, IAccountDetail } from "@interfaces/Iaccount";

@Injectable({
  providedIn: 'root',
})
export class AccountsService {

  private readonly apiUrl = `${environment.apiUrl}`;
  private readonly http = inject(HttpClient);

  getAllTypeAccountingAccounts(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/tipo-cuenta-contable/all`);
  }

  getAccountsByEnterpriseId(enterpriseId: number): Observable<ApiResponse<IAccount[]>> {
    return this.http.get<ApiResponse<IAccount[]>>(`${this.apiUrl}/cuenta/empresa/${enterpriseId}`);
  }

  getAllAccountsByIdPaginated(
    enterpriseId: number,
    pagination: IPaginationParams,
    filters?: IAccountFilters
  ): Observable<IPaginatedResponse<IAccount>> {
    let params = new HttpParams()
      .set('page', pagination.page.toString())
      .set('size', pagination.size.toString());

    // Agregar filtros si existen
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== null && value !== undefined && value !== '') {
          params = params.set(key, value.toString());
        }
      }
    }

    return this.http.get<IPaginatedResponse<IAccount>>(
      `${this.apiUrl}/cuenta/empresa/${enterpriseId}`,
      { params }
    ).pipe(
      catchError((error) => {
        console.error('Error fetching accounts:', error);
        return throwError(() => error);
      })
    );
  }

  getAccountById(id: number): Observable<ApiResponse<IAccountDetail>> {
    const url = `${this.apiUrl}/cuenta/${id}`;
    return this.http.get<ApiResponse<IAccountDetail>>(url);
  }

  deleteAccountById(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/cuenta/${id}`)
  }

  createAccount(account: ICreateAccount): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/cuenta`, account)
  }

}
