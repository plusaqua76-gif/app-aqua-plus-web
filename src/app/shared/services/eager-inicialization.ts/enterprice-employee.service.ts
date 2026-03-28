import { isPlatformBrowser } from "@angular/common";
import { HttpClient, HttpParams } from "@angular/common/http";
import { computed, inject, Injectable, PLATFORM_ID, signal } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { catchError, of } from "rxjs";
import { environment } from "../../../../environments/environment";
import { IPaginatedResponse } from "@interfaces/IpaginatedResponse";
import { IEmpleadoEmpresaResponse } from "@interfaces/Iemployee";


@Injectable({
  providedIn: 'root'
})
export class EmployeeSelectEagerInitializationService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private empresaId = signal<number | null>(null);
  private page = signal<number>(0);
  private size = signal<number>(100);

  private dataEmployee = rxResource({
    params: () => ({
      empresaId: this.empresaId(),
      page: this.page(),
      size: this.size()
    }),
    stream: ({ params }) => {
      const { empresaId, page, size } = params;
      if (!empresaId) return of(null);
      const url = `${this.apiUrl}/empleado-empresa/empresa/${empresaId}`;
      const httpParams = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString());
      return this.http
        .get<IPaginatedResponse<IEmpleadoEmpresaResponse>>(url, { params: httpParams })
        .pipe(
          catchError(() => of(null))
        );
    }
  });

  readonly employeeData = computed(
    () => this.dataEmployee.value()?.response || []
  );

  readonly isLoading = this.dataEmployee.isLoading;
  readonly error = this.dataEmployee.error;

  constructor() {
    if (this.isBrowser) {
      try {

        const userDataString = sessionStorage.getItem('userData');

        if (userDataString) {
          const userData = JSON.parse(userDataString);

          if (userData?.empresaId) {
            this.empresaId.set(userData.empresaId);
          }
        }

      } catch (error) {
        console.error('Error loading empresa employees:', error);
      }
    }
  }

}
