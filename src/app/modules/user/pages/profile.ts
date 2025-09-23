import { isPlatformBrowser } from '@angular/common';
import { Component, effect, inject, PLATFORM_ID } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { EnterpriseIdService } from '@services/enterpriceId.service';

@Component({
  selector: 'app-profile',
  imports: [ ],
  template: `





  `,
})
export class Profile{
  readonly enterpriseService = inject(EnterpriseIdService);
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    effect(() => {
      console.log('empresaInfo changed:', this.dataProfile.value());
    })
  }

  dataProfile = rxResource({
    stream: () => this.enterpriseService.getEnterpriseInfo()
  })





}
