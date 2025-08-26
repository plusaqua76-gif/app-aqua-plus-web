import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-404',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    section.custom-404-bg {
      background: #0f1115 !important;
    }
    @keyframes ball-move-1 {
      0% { transform: translate(0, 0); }
      25% { transform: translate(40px, 20px); }
      50% { transform: translate(80px, -10px); }
      75% { transform: translate(40px, -30px); }
      100% { transform: translate(0, 0); }
    }
    @keyframes ball-move-2 {
      0% { transform: translate(0, 0); }
      20% { transform: translate(-30px, 30px); }
      40% { transform: translate(-60px, -10px); }
      60% { transform: translate(-30px, -40px); }
      100% { transform: translate(0, 0); }
    }
    @keyframes ball-move-3 {
      0% { transform: translate(0, 0); }
      30% { transform: translate(20px, 40px); }
      60% { transform: translate(-20px, 60px); }
      90% { transform: translate(0, 20px); }
      100% { transform: translate(0, 0); }
    }
    .ball-1 {
      animation: ball-move-1 4s linear infinite;
    }
    .ball-2 {
      animation: ball-move-2 5s linear infinite;
    }
    .ball-3 {
      animation: ball-move-3 6s linear infinite;
    }
  `,
  template: `
    <section
      class="custom-404-bg relative min-h-screen overflow-hidden flex items-center justify-center p-6"
    >
      <div class="absolute inset-0 opacity-20">
        <div
          class="absolute top-20 left-10 w-40 h-40 rounded-full bg-purple-600 blur-3xl"
        ></div>
        <div
          class="absolute bottom-20 right-10 w-60 h-60 bg-cyan-600 blur-3xl"
        ></div>
      </div>

      <div class="relative z-10 text-center max-w-2xl mx-auto">
        <div class="relative mb-12">
          <h1
            class="text-[120px] md:text-[180px] font-bold text-white tracking-tighter"
          >
            404
          </h1>
        </div>

        <h2 class="text-3xl md:text-5xl font-bold text-white mb-6">
          Página no encontrada
        </h2>

        <p class="text-gray-400 text-lg mb-10">
          ¡Uy! La página que buscabas desapareció en una tubería de agua.
        </p>

        <div class="flex justify-center">
          <button
            routerLink="/"
            class="btn !w-[170px] max-lg:!w-[160px] !rounded-xl !py-4 max-lg:!py-2 !bg-[#22242a] !text-white transition-colors duration-[0.3s] border-2 border-[#5ee6e6] flex items-center justify-center cursor-pointer"
          >
            Ir a Home
          </button>
        </div>
      </div>

      <div
        class="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-4"
      >
        <div
          class="w-3 h-3 bg-purple-400 rounded-full ball-1"
        ></div>
        <div
          class="w-2 h-2 bg-cyan-400 rounded-full ball-2"
        ></div>
        <div
          class="w-4 h-4 bg-white rounded-full ball-3"
        ></div>
      </div>
    </section>
  `,
})
export class NotFound404 {}
