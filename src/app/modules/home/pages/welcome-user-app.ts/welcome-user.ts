import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
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
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
              <!-- Card 1: Gestión de Clientes -->
              <div
                (click)="navigateTo('/shell/client')"
                class="group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-rotate-1"
              >
                <div
                  class="text-white rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl duration-700 z-10 relative hover:border-white/25 overflow-hidden hover:shadow-white/5 hover:shadow-2xl hover:bg-white/10"
                >
                  <div class="absolute inset-0 z-0 overflow-hidden">
                    <div
                      class="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                    ></div>
                    <div
                      class="absolute -bottom-10 -left-10 w-20 h-20 rounded-full bg-gradient-to-tr from-blue-400/20 to-transparent blur-2xl opacity-30 group-hover:opacity-50 transform group-hover:scale-110 transition-all duration-700 animate-bounce"
                      style="animation-delay: 0.5s;"
                    ></div>
                    <div
                      class="absolute top-4 left-4 w-6 h-6 rounded-full bg-white/10 blur-sm animate-ping"
                    ></div>
                    <div
                      class="absolute bottom-6 right-6 w-4 h-4 rounded-full bg-white/5 blur-lg animate-ping"
                      style="animation-delay: 1s;"
                    ></div>
                    <div
                      class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"
                    ></div>
                  </div>

                  <div class="p-6 relative z-10">
                    <div class="flex flex-col items-center text-center">
                      <div class="relative mb-4">
                        <div
                          class="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"
                        ></div>
                        <div
                          class="absolute inset-0 rounded-full border border-white/10 animate-pulse"
                          style="animation-delay: 0.5s;"
                        ></div>
                        <div
                          class="p-4 rounded-full backdrop-blur-lg border border-white/20 bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 hover:shadow-blue-400/30"
                        >
                          <i class="fas fa-users text-blue-400 text-2xl transform group-hover:rotate-180 transition-transform duration-700 filter drop-shadow-lg"></i>
                        </div>
                      </div>

                      <div class="mb-2 transform group-hover:scale-105 transition-transform duration-300">
                        <h3 class="text-lg font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent animate-pulse">
                          Gestión de Clientes
                        </h3>
                      </div>

                      <div class="space-y-1 max-w-sm">
                        <p class="text-gray-300 text-sm leading-relaxed transform group-hover:text-gray-200 transition-colors duration-300">
                          Control completo de usuarios y servicios
                        </p>
                      </div>

                      <div class="mt-4 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full transform group-hover:w-1/2 group-hover:h-1 transition-all duration-500 animate-pulse"></div>

                      <div
                        class="flex space-x-2 mt-4 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div
                          style="animation-delay: 0.1s;"
                          class="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        ></div>
                        <div
                          style="animation-delay: 0.2s;"
                          class="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div
                    class="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  ></div>
                  <div
                    class="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  ></div>
                </div>
              </div>

              <!-- Card 2: Facturación Automática -->
              <div
                (click)="navigateTo('/shell/bill')"
                class="group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-rotate-1"
              >
                <div
                  class="text-white rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl duration-700 z-10 relative hover:border-white/25 overflow-hidden hover:shadow-white/5 hover:shadow-2xl hover:bg-white/10"
                >
                  <div class="absolute inset-0 z-0 overflow-hidden">
                    <div
                      class="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                    ></div>
                    <div
                      class="absolute -bottom-10 -left-10 w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-400/20 to-transparent blur-2xl opacity-30 group-hover:opacity-50 transform group-hover:scale-110 transition-all duration-700 animate-bounce"
                      style="animation-delay: 0.5s;"
                    ></div>
                    <div
                      class="absolute top-4 left-4 w-6 h-6 rounded-full bg-white/10 blur-sm animate-ping"
                    ></div>
                    <div
                      class="absolute bottom-6 right-6 w-4 h-4 rounded-full bg-white/5 blur-lg animate-ping"
                      style="animation-delay: 1s;"
                    ></div>
                    <div
                      class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"
                    ></div>
                  </div>

                  <div class="p-6 relative z-10">
                    <div class="flex flex-col items-center text-center">
                      <div class="relative mb-4">
                        <div
                          class="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"
                        ></div>
                        <div
                          class="absolute inset-0 rounded-full border border-white/10 animate-pulse"
                          style="animation-delay: 0.5s;"
                        ></div>
                        <div
                          class="p-4 rounded-full backdrop-blur-lg border border-white/20 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 shadow-xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 hover:shadow-cyan-400/30"
                        >
                          <i class="fas fa-file-invoice-dollar text-cyan-400 text-2xl transform group-hover:rotate-180 transition-transform duration-700 filter drop-shadow-lg"></i>
                        </div>
                      </div>

                      <div class="mb-2 transform group-hover:scale-105 transition-transform duration-300">
                        <h3 class="text-lg font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent animate-pulse">
                          Facturación Automática
                        </h3>
                      </div>

                      <div class="space-y-1 max-w-sm">
                        <p class="text-gray-300 text-sm leading-relaxed transform group-hover:text-gray-200 transition-colors duration-300">
                          Generación y control de facturas
                        </p>
                      </div>

                      <div class="mt-4 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full transform group-hover:w-1/2 group-hover:h-1 transition-all duration-500 animate-pulse"></div>

                      <div
                        class="flex space-x-2 mt-4 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <div class="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div
                          style="animation-delay: 0.1s;"
                          class="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                        ></div>
                        <div
                          style="animation-delay: 0.2s;"
                          class="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div
                    class="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  ></div>
                  <div
                    class="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  ></div>
                </div>
              </div>

              <!-- Card 3: Reportes y Analytics -->
              <div
                (click)="navigateTo('/shell/reports')"
                class="group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-rotate-1"
              >
                <div
                  class="text-white rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl duration-700 z-10 relative hover:border-white/25 overflow-hidden hover:shadow-white/5 hover:shadow-2xl hover:bg-white/10"
                >
                  <div class="absolute inset-0 z-0 overflow-hidden">
                    <div
                      class="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                    ></div>
                    <div
                      class="absolute -bottom-10 -left-10 w-20 h-20 rounded-full bg-gradient-to-tr from-green-400/20 to-transparent blur-2xl opacity-30 group-hover:opacity-50 transform group-hover:scale-110 transition-all duration-700 animate-bounce"
                      style="animation-delay: 0.5s;"
                    ></div>
                    <div
                      class="absolute top-4 left-4 w-6 h-6 rounded-full bg-white/10 blur-sm animate-ping"
                    ></div>
                    <div
                      class="absolute bottom-6 right-6 w-4 h-4 rounded-full bg-white/5 blur-lg animate-ping"
                      style="animation-delay: 1s;"
                    ></div>
                    <div
                      class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"
                    ></div>
                  </div>

                  <div class="p-6 relative z-10">
                    <div class="flex flex-col items-center text-center">
                      <div class="relative mb-4">
                        <div
                          class="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"
                        ></div>
                        <div
                          class="absolute inset-0 rounded-full border border-white/10 animate-pulse"
                          style="animation-delay: 0.5s;"
                        ></div>
                        <div
                          class="p-4 rounded-full backdrop-blur-lg border border-white/20 bg-gradient-to-br from-green-500/20 to-green-600/10 shadow-xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 hover:shadow-green-400/30"
                        >
                          <i class="fas fa-chart-line text-green-400 text-2xl transform group-hover:rotate-180 transition-transform duration-700 filter drop-shadow-lg"></i>
                        </div>
                      </div>

                      <div class="mb-2 transform group-hover:scale-105 transition-transform duration-300">
                        <h3 class="text-lg font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent animate-pulse">
                          Reportes y Analytics
                        </h3>
                      </div>

                      <div class="space-y-1 max-w-sm">
                        <p class="text-gray-300 text-sm leading-relaxed transform group-hover:text-gray-200 transition-colors duration-300">
                          Análisis de consumo y reportes
                        </p>
                      </div>

                      <div class="mt-4 w-1/3 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent rounded-full transform group-hover:w-1/2 group-hover:h-1 transition-all duration-500 animate-pulse"></div>

                      <div
                        class="flex space-x-2 mt-4 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <div class="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                        <div
                          style="animation-delay: 0.1s;"
                          class="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                        ></div>
                        <div
                          style="animation-delay: 0.2s;"
                          class="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div
                    class="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  ></div>
                  <div
                    class="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  ></div>
                </div>
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
  private router = inject(Router);

  enterpriseInfo = rxResource({
    stream: () => this.enterpriseIdService.getEnterpriseInfo(),
  });

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
