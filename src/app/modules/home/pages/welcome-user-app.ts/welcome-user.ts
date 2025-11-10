import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { EnterpriseIdService } from '@services/enterpriceId.service';

@Component({
  selector: 'app-welcome-user-app',
  imports: [],
  template: `
    <section
      class="relative isolate overflow-hidden bg-gray-900 px-6 py-6 sm:py-8 lg:px-8 min-h-screen flex items-center justify-center"
    >
      <div
        class="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,var(--color-indigo-500),transparent)] opacity-10"
      ></div>
      <div
        class="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-gray-900 shadow-xl ring-1 shadow-indigo-500/5 ring-white/5 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center"
      ></div>

      <div class="mx-auto max-w-2xl lg:max-w-4xl w-full">
        <!-- Contenedor con efecto glass muy sutil -->
        <div
          class="relative  rounded-3xl border border-white/30 dark:border-gray-600/40 shadow-2xl p-8 sm:p-12"
        >
          <!-- Imagen ilustrativa -->
          <div class="flex justify-center mb-8">
            <img
              class="w-40 h-40 sm:w-48 sm:h-48 object-contain"
              src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/girl-shopping-list.svg"
              alt="Aqua Plus - Sistema de Acueducto"
            />
          </div>

          <figure class="text-center">
            <!-- Nombre de la empresa -->
            @if (enterpriseInfo.value()?.nombre) {
            <div class="mb-8">
              <h1 class="text-4xl sm:text-5xl font-bold text-white mb-3">
                Bienvenido a {{ enterpriseInfo.value()?.nombre }}
              </h1>
              <div
                class="w-32 h-1 bg-gradient-to-r from-blue-400 to-cyan-500 mx-auto rounded-full mb-4"
              ></div>
              <p class="text-lg text-blue-200 font-medium">
                Sistema de Gestión de Acueducto
              </p>
            </div>
            }

            <!-- Información de Aqua Plus -->
            <blockquote
              class="text-center text-xl/8 font-semibold text-white/90 sm:text-2xl/9 mb-8"
            >
              <p>
                "Gestiona de manera eficiente el suministro de agua,
                facturación, lecturas de contadores y servicios al cliente con
                nuestra plataforma integral de acueducto."
              </p>
            </blockquote>

            <!-- Características del sistema -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <div
                class="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              >
                <div class="text-blue-400 mb-2">
                  <svg
                    class="w-8 h-8 mx-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="text-white font-semibold text-sm">
                  Gestión de Clientes
                </h3>
                <p class="text-gray-300 text-xs mt-1">
                  Control completo de usuarios y servicios
                </p>
              </div>

              <div
                class="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              >
                <div class="text-cyan-400 mb-2">
                  <svg
                    class="w-8 h-8 mx-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0011.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <h3 class="text-white font-semibold text-sm">
                  Facturación Automática
                </h3>
                <p class="text-gray-300 text-xs mt-1">
                  Generación y control de facturas
                </p>
              </div>

              <div
                class="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              >
                <div class="text-green-400 mb-2">
                  <svg
                    class="w-8 h-8 mx-auto"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <h3 class="text-white font-semibold text-sm">
                  Reportes y Analytics
                </h3>
                <p class="text-gray-300 text-xs mt-1">
                  Análisis de consumo y reportes
                </p>
              </div>
            </div>
          </figure>
        </div>
      </div>
    </section>
  `,
})
export class WelcomeUserApp {
  private enterpriseIdService = inject(EnterpriseIdService);

  enterpriseInfo = rxResource({
    stream: () => this.enterpriseIdService.getEnterpriseInfo(),
  });
}
