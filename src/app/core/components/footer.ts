import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IImage } from '@interfaces/image/image';
import { ILink }  from '@interfaces/link/link';
import { Image }  from '@shared/components/image';
import { Link }   from '@shared/components/link';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [Image, Link],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-gray-900 text-white pt-12 pb-8">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div class="space-y-4">
            <div class="flex items-center">
              <svg class="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
              <span class="ml-2 text-xl font-bold">{{ companyName }}</span>
            </div>
            <p class="text-gray-400">{{ companySlogan }}</p>
            <div class="flex space-x-4">
              @for (item of socialMediaList; track $index) {
                <app-link [link]="item.link"
                          class="text-gray-400 hover:text-white transition flex items-center group">
                  <span class="sr-only">{{ item.name }}</span>
                  <app-image [images]="item"
                             class="h-6 w-6 object-contain group-hover:scale-110 transition-transform">
                  </app-image>
                </app-link>
              }
            </div>
          </div>
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Enlaces rápidos</h3>
            <ul class="space-y-2">
              @for (item of linkList; track $index) {
                <li>
                  <app-link [link]="item.link"
                            class="text-gray-400 hover:text-white transition">
                    {{ item.name }}
                  </app-link>
                </li>
              }
            </ul>
          </div>
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Servicios</h3>
            <ul class="space-y-2">
              @for (service of servicesList; track $index) {
                <li>
                  <app-link [link]="service.link"
                            class="text-gray-400 hover:text-white transition">
                    {{ service.name }}
                  </app-link>
                </li>
              }
            </ul>
          </div>
          <div class="space-y-4">
            <h3 class="text-lg font-semibold">Contáctanos</h3>
            <address class="not-italic text-gray-400">
              @for (line of contactAddressLines; track $index) {
                <p>{{ line }}</p>
              }
              <p class="mt-2">
                Email:
                <a [href]="'mailto:' + contactEmail"
                   class="hover:text-white transition">
                  {{ contactEmail }}
                </a>
              </p>
              <p>
                Tel:
                <a [href]="'tel:' + contactPhone"
                   class="hover:text-white transition">
                  {{ contactPhone }}
                </a>
              </p>
            </address>
          </div>
        </div>
        <div class="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p class="text-gray-500 text-sm mb-4 md:mb-0">
            © {{ currentYear }} {{ companyName }}. Todos los derechos reservados.
          </p>

          <div class="flex space-x-6">
            @for (policy of policyLinks; track $index) {
              <app-link [link]="policy.link"
                        class="text-gray-500 hover:text-white text-sm transition">
                {{ policy.name }}
              </app-link>
            }
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class Footer {

  companyName   = 'Aqua Plus';
  companySlogan = 'Servicios que simplifican tu vida';
  currentYear   = new Date().getFullYear();

  linkList: ILink[] = [
    { name: 'Inicio',     link: '/home',     target: '_self' },
    { name: 'Servicios',  link: '/services', target: '_self' },
    { name: 'Contacto',   link: '/contact',  target: '_self' },
    { name: 'Acerca de',  link: '/about',    target: '_self' },
  ];

  servicesList: ILink[] = [
    { name: 'Lectura de medidores',      link: '/services/meters',    target: '_self' },
    { name: 'Reporte de novedades',      link: '/services/issues',    target: '_self' },
    { name: 'Pago en línea',             link: '/services/payments',  target: '_self' },
    { name: 'Soporte al usuario',        link: '/services/support',   target: '_self' },
    { name: 'Análisis de consumos',      link: '/services/analytics', target: '_self' },
  ];

  socialMediaList: IImage[] = [
    { name: 'instagram', link: '', imgPath: 'images/IconI.png',  width: 24, height: 24 },
    { name: 'facebook',  link: 'https://facebook.com', imgPath: 'images/IconF.png', width: 24, height: 24 },
    { name: 'whatsapp',  link: '', imgPath: 'images/IconW.png',  width: 24, height: 24 },
    { name: 'email',     link: '', imgPath: 'images/Subtract.png', width: 24, height: 24 },
  ];

  contactAddressLines: string[] = [
    'Calle 123 #45‑67',
    'Medellín – Colombia',
  ];
  contactEmail = 'info@multiacueductos.com';
  contactPhone = '+57 300 123 4567';

  policyLinks: ILink[] = [
    { name: 'Política de privacidad', link: '/legal/privacy', target: '_self' },
    { name: 'Términos de servicio',   link: '/legal/terms',   target: '_self' },
    { name: 'Cookies',                link: '/legal/cookies', target: '_self' },
  ];
}
