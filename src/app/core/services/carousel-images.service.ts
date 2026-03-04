import { inject, Injectable, PLATFORM_ID, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { environment } from '../../environments/environment';
import { CarouselApiResponse, CarouselEmpresa } from '../interfaces/Icarousel';
import { catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CarouselImagesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Signal para controlar la carga
  private readonly shouldLoad = signal<boolean>(true);

  // rxResource - carga automáticamente al inicializar
  private carouselResource = rxResource({
    params: () => this.shouldLoad(),
    stream: ({ params: shouldLoad }) => {
      if (!shouldLoad) return of(null);

      // Cargar todas las páginas de empresas
      return this.http
        .get<CarouselApiResponse>(`${this.apiUrl}/documento/carrucel`, {
          params: {
            page: 0,
            size: 100,
          },
          headers: {
            'X-Skip-Loader': 'true',
          },
        })
        .pipe(
          map((response) => {
            if (response.success && response.response?.items) {
              return response.response.items.map((item) => ({
                empresaId: item.empresaId,
                nombreEmpresa: item.nombreEmpresa,
              }));
            }
            return [];
          }),
          catchError((error) => {
            console.error('Error loading carousel data:', error);
            return of([]);
          })
        );
    },
  });

  // Signals públicos
  readonly empresas = this.carouselResource.value;
  readonly isLoading = this.carouselResource.isLoading;
  readonly error = this.carouselResource.error;

  // Computed signal para duplicar la lista (para efecto infinito del carrusel)
  readonly empresasCarousel = computed(() => {
    const empresas = this.empresas();
    if (!empresas || empresas.length === 0) return [];
    // Duplicar la lista para crear el efecto de loop infinito
    return [...empresas, ...empresas];
  });

  constructor() {
    // EAGER INITIALIZATION: Cargar inmediatamente al crear el servicio
    if (this.isBrowser) {
      // La carga se dispara automáticamente porque shouldLoad está en true
    }
  }

  // Método para refrescar manualmente si es necesario
  refresh(): void {
    this.carouselResource.reload();
  }
}

