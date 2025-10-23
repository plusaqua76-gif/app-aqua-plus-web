import { Component, computed, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ToastService } from '@services/toast.service';
import { CounterEnterpriceService } from '../../services/counter-enterprice.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-counter-enterprice',
  imports: [CommonModule],
  template: ``,
})
export class CounterEnterpriceFather {
  protected readonly toast = inject(ToastService);
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly counterEnterpriceService = inject(
    CounterEnterpriceService
  );

  readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (e) {
      console.error('Error parsing userData from sessionStorage:', e);
      return null;
    }
  });

  readonly usuarioCreacion = computed(() => {
    const data = this.userData();
    return data?.nombre || 'admin';
  });

  readonly enterpriceId = computed(() => {
    const data = this.userData();
    const id = data?.empresaId || 0;
    return id;
  });

  dataCounterEnterprice = rxResource({
    params: () => ({
      idEmpresa: this.enterpriceId(),
    }),
    stream: ({ params }) => {
      if (!params.idEmpresa) {
        return of(null);
      }
      return this.counterEnterpriceService
        .getCounterEnterprice(params.idEmpresa)
        .pipe(
          catchError((error) => {
            return of(null);
          })
        );
    },
  });
}
