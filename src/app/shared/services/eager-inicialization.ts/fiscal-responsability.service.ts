import { isPlatformBrowser } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { computed, inject, Injectable, PLATFORM_ID, signal } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { rxResource } from "@angular/core/rxjs-interop";
import { catchError, map, of } from "rxjs";

import { ApiResponse } from "@interfaces/Iresponse";
import { UnitCodes } from "@interfaces/invoice/dian-invoice";

@Injectable({
  providedIn: 'root'
})
export class FiscalResponsabilityDianEagerService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private trigger = signal(true);

  private fiscalResponsabilityResource = rxResource({
    params: () => ({
      trigger: this.trigger()
    }),

    stream: () => {

      return this.http.get<ApiResponse<UnitCodes[]>>(
        `${this.apiUrl}/lista-dian`,
        {
          params: {
            endPoint: '/dian/fiscal-Responsability-types',
          },
        }
      ).pipe(
        map(res => res.response),
        catchError(() => of([]))
      );
    }
  });

  readonly fiscalResponsabilityList = computed(
    () => this.fiscalResponsabilityResource.value() || []
  );

  readonly isLoading = this.fiscalResponsabilityResource.isLoading;
  readonly error = this.fiscalResponsabilityResource.error;

  constructor() {
  }

  refresh() {
    this.trigger.update(v => !v);
  }

}
