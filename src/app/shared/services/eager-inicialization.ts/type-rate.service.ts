import { isPlatformBrowser } from "@angular/common";
import { computed, inject, Injectable, PLATFORM_ID, signal } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { catchError, of } from "rxjs";
import { UseService } from "../../../modules/fee/services/use.service";


@Injectable({
  providedIn: 'root'
})
export class TypeUseEagerInitializationService {

  private readonly useService = inject(UseService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private empresaId = signal<number | null>(null);
  private typeUseResource = rxResource({
    params: () => ({
      enterpriseId: this.empresaId(),
    }),

    stream: ({ params }) => {

      if (!params.enterpriseId) {
        return of(null);
      }

      return this.useService.getTypeUse(params.enterpriseId).pipe(
        catchError(() => of(null))
      );
    },
  });

  readonly typeUseList = computed(
    () => this.typeUseResource.value() || []
  );

  readonly isLoading = this.typeUseResource.isLoading;
  readonly error = this.typeUseResource.error;
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
        console.error('Error loading type use:', error);
      }
    }
  }

  refresh() {
    this.empresaId.update(v => v);
  }

}
