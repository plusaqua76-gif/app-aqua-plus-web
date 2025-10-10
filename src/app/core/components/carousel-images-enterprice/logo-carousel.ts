import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-logo-carousel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .carousel-container {
        overflow: hidden;
        white-space: nowrap;
        width: 100%;
        max-width: 800px;
      }

      .carousel {
        display: inline-block;
        animation: scroll 10s linear infinite;
      }

      .carousel-img {
        display: inline-block;
        margin: 0 20px;
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

      <div class="reveal-up carousel-container">
        <div
          class="carousel lg:w-place-content-center mt-10 flex w-full gap-5 max-md:gap-2"
        >
          <div class="carousel-img h-[80px] w-[150px]">
            <img
              src="/images/salto.png"
              alt="Bornodes SAS"
              class="h-16 w-full object-contain grayscale transition-colors hover:grayscale-0"
            />
          </div>
          <div class="carousel-img h-[80px] w-[150px]">
            <img
              src="/images/salto.png"
              alt="Microsoft"
              class="h-full w-full object-contain grayscale transition-colors hover:grayscale-0"
              srcset=""
            />
          </div>
          <div class="carousel-img h-[80px] w-[150px]">
            <img
              src="/images/salto.png"
              alt="Adobe"
              class="h-full w-full object-contain grayscale transition-colors hover:grayscale-0"
              srcset=""
            />
          </div>
          <div class="carousel-img h-[80px] w-[150px]">
            <img
              src="/images/salto.png"
              alt="Airbnb"
              class="h-full w-full object-contain grayscale transition-colors hover:grayscale-0"
              srcset=""
            />
          </div>
          <div class="carousel-img h-[80px] w-[150px]">
            <img
              src="/images/salto.png"
              alt="Stripe"
              class="h-full w-full object-contain grayscale transition-colors hover:grayscale-0"
              srcset=""
            />
          </div>
          <div class="carousel-img h-[80px] w-[150px]">
            <img
              src="/images/salto.png"
              alt="Reddit"
              class="h-full w-full object-contain grayscale transition-colors hover:grayscale-0"
              srcset=""
            />
          </div>
        </div>
      </div>
    </section>
  `,
})
export class LogoCarouselComponent {}
