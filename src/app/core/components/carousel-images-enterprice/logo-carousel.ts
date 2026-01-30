import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CarouselImagesService } from '../../services/carousel-images.service';

@Component({
  selector: 'app-logo-carousel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .carousel-animate {
        animation: scroll 130s linear infinite;
      }

      .carousel-item::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: url('/images/logoAquaplus.webp');
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        opacity: 0.2;
        filter: grayscale(100%);
        transition: filter 1s ease, opacity 1.5s ease;
        border-radius: 8px;
      }

      .carousel-item:hover::before {
        filter: grayscale(0%);
        opacity: 0.8;
      }

      @keyframes scroll {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-50%);
        }
      }
    `,
  ],
  template: `
    <section
      class="relative flex w-full max-w-[100vw] flex-col place-content-center place-items-center overflow-hidden p-8"
    >
      <h2 class="reveal-up text-3xl max-md:text-xl">
        Elegido por acueductos que cuidan el agua y su gente
      </h2>

      @if (carouselService.isLoading()) {
        <div class="flex justify-center items-center min-h-[50vh]">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      } @else if (carouselService.error()) {
        <div class="mt-10 text-red-500">Error cargando empresas</div>
      } @else if (carouselService.empresasCarousel() && carouselService.empresasCarousel()!.length > 0) {
        <div class="reveal-up w-full max-w-[800px] overflow-hidden whitespace-nowrap">
          <div class="carousel-animate mt-10 inline-flex gap-5">
            @for (empresa of carouselService.empresasCarousel()!; track empresa.empresaId + $index) {
              <div
                class="carousel-item relative inline-flex items-center justify-center mx-5 min-w-[150px] h-20 p-4 rounded-lg"
              >
                <span class="relative z-10 text-sm font-semibold text-white text-center whitespace-normal break-words max-w-[150px]">
                  {{ empresa.nombreEmpresa }}
                </span>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="mt-10 text-gray-500">No hay empresas disponibles</div>
      }
    </section>
  `,
})
export class LogoCarouselComponent {
  readonly carouselService = inject(CarouselImagesService);
}
