import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { EnterpriseIdService } from '@services/enterpriceId.service';

@Component({
  selector: 'app-welcome-user-app',
  standalone: true,
  imports: [],
  template: `
    <div class="min-h-screen w-full flex flex-col">
      <!-- Primera Vista: Bienvenida -->
      <div
        class="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 p-6 md:p-12 items-center max-w-7xl mx-auto"
      >
        <div class="flex items-center justify-center md:justify-start">
          <div class="space-y-5">
            <h1
              class="text-3xl md:text-5xl lg:text-6xl font-semibold text-gray-800 animate-slide-in-left"
            >
              Bienvenido a
            </h1>
            @if (enterpriseInfo.value()?.nombre) {
              <p
                class="text-4xl md:text-6xl lg:text-7xl font-bold text-primary animate-text-reveal"
              >
                {{ enterpriseInfo.value()?.nombre }}
              </p>
            }
            <p
              class="text-lg md:text-xl lg:text-2xl text-gray-600 mt-5 animate-fade-in-up"
            >
              Tu plataforma de gestión integral
            </p>
          </div>
        </div>

        <div class="flex items-center justify-center md:justify-end">
          <img
            src="/images/Framedef.svg"
            alt="Frame"
            class="max-w-sm md:max-w-md lg:max-w-lg w-full animate-float-scale"
          />
        </div>
      </div>

      <!-- Segunda Vista: Animación con Instrucciones -->
      <div
        class="min-h-screen w-full flex items-center justify-center p-4 md:p-6 lg:p-8"
      >
        <div class="max-w-7xl w-full">
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-16 items-center"
          >
            <!-- Columna Izquierda: Animación -->
            <div class="flex flex-col items-center justify-center">
              <div class="text-center mb-6 md:mb-8">
                <h3 class="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                  Explora las funcionalidades
                </h3>
                <p class="text-sm md:text-base text-gray-600">
                  Navega por las diferentes secciones
                </p>
              </div>

              <div
                class="profileCard_container relative p-8 md:p-10 border-2 border-dashed rounded-full border-primary/30"
              >
                <!-- Dashboard Button -->
                <button
                  class="profile_item orbit-btn-1 left-[45px] -top-[4px] absolute rounded-full bg-white/30 dark:bg-slate-800/30 backdrop-blur-md cursor-pointer border border-white/20 shadow-lg active:scale-95 hover:scale-110 hover:bg-white/40 hover:shadow-2xl hover:z-20 transition-all duration-500 group"
                  title="Dashboard"
                >
                  <div
                    class="w-[50px] h-[50px] flex items-center justify-center"
                  >
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="text-white w-7 h-7"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                      />
                    </svg>
                  </div>
                </button>

                <!-- Contabilidad Button -->
                <button
                  class="profile_item orbit-btn-2 right-[45px] -top-[4px] absolute rounded-full bg-white/30 dark:bg-slate-800/30 backdrop-blur-md cursor-pointer border border-white/20 shadow-lg active:scale-95 hover:scale-110 hover:bg-white/40 hover:shadow-2xl hover:z-20 transition-all duration-500 group"
                  title="Contabilidad"
                >
                  <div
                    class="w-[50px] h-[50px] flex items-center justify-center"
                  >
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="text-white w-7 h-7"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z"
                      />
                    </svg>
                  </div>
                </button>

                <!-- Facturación Button -->
                <button
                  class="profile_item orbit-btn-3 -left-4 top-20 absolute rounded-full bg-white/30 dark:bg-slate-800/30 backdrop-blur-md cursor-pointer border border-white/20 shadow-lg active:scale-95 hover:scale-110 hover:bg-white/40 hover:shadow-2xl hover:z-20 transition-all duration-500 group"
                  title="Facturación"
                >
                  <div
                    class="w-[50px] h-[50px] flex items-center justify-center"
                  >
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="text-white w-7 h-7"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                      />
                    </svg>
                  </div>
                </button>

                <!-- Usuarios Button -->
                <button
                  class="profile_item orbit-btn-4 -right-4 top-20 absolute rounded-full bg-white/30 dark:bg-slate-800/30 backdrop-blur-md cursor-pointer border border-white/20 shadow-lg active:scale-95 hover:scale-110 hover:bg-white/40 hover:shadow-2xl hover:z-20 transition-all duration-500 group"
                  title="Usuarios"
                >
                  <div
                    class="w-[50px] h-[50px] flex items-center justify-center"
                  >
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="text-white w-7 h-7"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                      />
                    </svg>
                  </div>
                </button>

                <!-- Reportes Button -->
                <button
                  class="profile_item orbit-btn-5 bottom-8 -left-0 absolute rounded-full bg-white/30 dark:bg-slate-800/30 backdrop-blur-md cursor-pointer border border-white/20 shadow-lg active:scale-95 hover:scale-110 hover:bg-white/40 hover:shadow-2xl hover:z-20 transition-all duration-500 group"
                  title="Reportes"
                >
                  <div
                    class="w-[50px] h-[50px] flex items-center justify-center"
                  >
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="text-white w-7 h-7"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                      />
                    </svg>
                  </div>
                </button>

                <!-- Clientes Button -->
                <button
                  class="profile_item orbit-btn-6 bottom-8 -right-0 absolute rounded-full bg-white/30 dark:bg-slate-800/30 backdrop-blur-md cursor-pointer border border-white/20 shadow-lg active:scale-95 hover:scale-110 hover:bg-white/40 hover:shadow-2xl hover:z-20 transition-all duration-500 group"
                  title="Clientes"
                >
                  <div
                    class="w-[50px] h-[50px] flex items-center justify-center"
                  >
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="text-white w-7 h-7"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                      />
                    </svg>
                  </div>
                </button>

                <!-- Empresa Button -->
                <button
                  class="profile_item orbit-btn-7 right-[40%] -bottom-4 absolute rounded-full bg-white/30 dark:bg-slate-800/30 backdrop-blur-md cursor-pointer border border-white/20 shadow-lg active:scale-95 hover:scale-110 hover:bg-white/40 hover:shadow-2xl hover:z-20 transition-all duration-500 group"
                  title="Empresa"
                >
                  <div
                    class="w-[50px] h-[50px] flex items-center justify-center"
                  >
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="text-white w-7 h-7"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3.75 21h16.5M4.5 3h15l-.75 18h-13.5L4.5 3ZM9 9h1.5M9 12h1.5M9 15h1.5M13.5 9H15M13.5 12H15M13.5 15H15"
                      />
                    </svg>
                  </div>
                </button>

                <!-- Configuración Button -->
                <button
                  class="profile_item orbit-btn-8 left-[40%] -bottom-4 absolute rounded-full bg-white/30 dark:bg-slate-800/30 backdrop-blur-md cursor-pointer border border-white/20 shadow-lg active:scale-95 hover:scale-110 hover:bg-white/40 hover:shadow-2xl hover:z-20 transition-all duration-500 group"
                  title="Configuración"
                >
                  <div
                    class="w-[50px] h-[50px] flex items-center justify-center"
                  >
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="text-white w-7 h-7"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  </div>
                </button>

                <!-- Central Profile Button -->
                <div
                  class="profile_item w-[200px] h-[200px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <div
                    class="relative w-full h-full flex items-center justify-center"
                  >
                    <!-- Fondo animado que gira lento en sentido contrario -->
                    <div
                      class="background-spin absolute inset-0 flex items-center justify-center "
                    >
                      <img
                        src="/images/bganimation.svg"
                        class="w-full h-full"
                        alt="Background Animation"
                      />
                    </div>
                    <!-- Logo estático encima con fondo glassmorphism -->
                    <div
                      class="logo-static relative z-10 flex items-center justify-center"
                    >
                      <div class="absolute inset-0 rounded-full bg-gradient-radial from-white/40 via-white/20 to-transparent dark:from-slate-800/40 dark:via-slate-800/20 dark:to-transparent backdrop-blur-xs"></div>
                      <img
                        src="/images/aquabg.svg"
                        class="w-32 h-32 relative z-10"
                        alt="Aqua Logo"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Columna Derecha: Instrucciones -->
            <div class="flex flex-col gap-4 md:gap-3">
              <div class="mb-2">
                <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  Guía de Inicio Rápido
                </h2>
                <p class="text-sm md:text-base text-gray-600">
                  Configura tu sistema en simples pasos
                </p>
              </div>

              <!-- Card de Facturación -->
                <div
                  class="p-3 rounded-lg bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-600/30 hover:bg-white/10 dark:hover:bg-slate-700/40 transition-all duration-200"
                >
                  <div class="flex items-start gap-3">
                    <div
                      class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center flex-shrink-0"
                    >
                      <svg
                        class="w-7 h-7 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                        />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4
                        class="font-semibold text-sm md:text-base text-white mb-1 md:mb-2"
                      >
                        Configuración de Facturación
                      </h4>
                      <p
                        class="text-xs md:text-sm text-gray-300 leading-relaxed"
                      >
                        Para poder facturar debes configurar las tarifas y
                        establecer el fondo de la factura según tus necesidades.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Card de Regulación -->
                <div
                  class="p-3 rounded-lg bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-600/30 hover:bg-white/10 dark:hover:bg-slate-700/40 transition-all duration-200"
                >
                  <div class="flex items-start gap-3">
                    <div
                      class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center flex-shrink-0"
                    >
                      <svg
                        class="w-7 h-7 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4
                        class="font-semibold text-sm md:text-base text-white mb-1 md:mb-2"
                      >
                        Regulación y Tipos de Uso
                      </h4>
                      <p
                        class="text-xs md:text-sm text-gray-300 leading-relaxed"
                      >
                        Si manejas la regulación, debes implementar los tipos de
                        uso para clasificar correctamente tus servicios.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Card de Contadores -->
                <div
                  class="p-3 rounded-lg bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-600/30 hover:bg-white/10 dark:hover:bg-slate-700/40 transition-all duration-200"
                >
                  <div class="flex items-start gap-3">
                    <div
                      class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center flex-shrink-0"
                    >
                      <svg
                        class="w-7 h-7 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
                        />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4
                        class="font-semibold text-sm md:text-base text-white mb-1 md:mb-2"
                      >
                        Gestión de Contadores
                      </h4>
                      <p
                        class="text-xs md:text-sm text-gray-300 leading-relaxed"
                      >
                        Registra y vincula los contadores a tus clientes para
                        realizar un seguimiento preciso del consumo.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Card de Clientes -->
                <div
                  class="p-3 rounded-lg bg-white/5 dark:bg-slate-800/30 border border-white/10 dark:border-slate-600/30 hover:bg-white/10 dark:hover:bg-slate-700/40 transition-all duration-200"
                >
                  <div class="flex items-start gap-3">
                    <div
                      class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#312f62a3] to-[#004fbb00] flex items-center justify-center flex-shrink-0"
                    >
                      <svg
                        class="w-7 h-7 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                        />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4
                        class="font-semibold text-sm md:text-base text-white mb-1 md:mb-2"
                      >
                        Administración de Clientes
                      </h4>
                      <p
                        class="text-xs md:text-sm text-gray-300 leading-relaxed"
                      >
                        Gestiona la información de tus clientes y mantén
                        actualizada su base de datos para una mejor atención.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

  `,
  styles: `
    .bg-gradient-radial {
      background-image: radial-gradient(circle, var(--tw-gradient-stops));
    }

    @keyframes orbit {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes counterOrbit {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(-360deg);
      }
    }

    @keyframes slowSpin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes float {
      0%,
      100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-20px);
      }
    }

    @keyframes floatScale {
      0%,
      100% {
        transform: translateY(0px) scale(1);
      }
      50% {
        transform: translateY(-20px) scale(1.05);
      }
    }

    @keyframes slideInLeft {
      0% {
        opacity: 0;
        transform: translateX(-50px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes textReveal {
      0% {
        opacity: 0;
        transform: translateY(30px);
        letter-spacing: 0.5em;
      }
      100% {
        opacity: 1;
        transform: translateY(0);
        letter-spacing: normal;
      }
    }

    @keyframes fadeInUp {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse-glow {
      0%,
      100% {
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
      }
      50% {
        box-shadow:
          0 0 40px rgba(59, 130, 246, 0.6),
          0 0 60px rgba(59, 130, 246, 0.3);
      }
    }

    .animate-float {
      animation: float 3s ease-in-out infinite;
    }

    .animate-float-scale {
      animation: floatScale 4s ease-in-out infinite;
      animation-delay: 0.5s;
    }

    .animate-slide-in-left {
      animation: slideInLeft 0.8s ease-out forwards;
      opacity: 0;
    }

    .animate-text-reveal {
      animation: textReveal 1.2s ease-out forwards;
      animation-delay: 0.3s;
      opacity: 0;
    }

    .animate-fade-in-up {
      animation: fadeInUp 1s ease-out forwards;
      animation-delay: 0.8s;
      opacity: 0;
    }

    .profileCard_container {
      animation:
        orbit 20s linear infinite,
        pulse-glow 3s ease-in-out infinite;
      width: 240px;
      height: 240px;
    }

    @media (min-width: 768px) {
      .profileCard_container {
        width: 280px;
        height: 280px;
      }
    }

    @media (min-width: 1024px) {
      .profileCard_container {
        width: 300px;
        height: 300px;
      }
    }

    .profile_item {
      animation: counterOrbit 20s linear infinite;
    }

    /* Delays diferentes para cada botón para efecto desorganizado */
    .orbit-btn-1 {
      animation-delay: 0s;
    }

    .orbit-btn-2 {
      animation-delay: -2.5s;
    }

    .orbit-btn-3 {
      animation-delay: -5s;
    }

    .orbit-btn-4 {
      animation-delay: -7.5s;
    }

    .orbit-btn-5 {
      animation-delay: -10s;
    }

    .orbit-btn-6 {
      animation-delay: -12.5s;
    }

    .orbit-btn-7 {
      animation-delay: -15s;
    }

    .orbit-btn-8 {
      animation-delay: -17.5s;
    }

    .profile_item button:hover {
      z-index: 20;
    }

    .background-spin {
      animation: slowSpin 40s linear infinite;
    }

    .logo-static {
      /* Sin animación para mantener el logo completamente estático */
    }

    /* Estilos adicionales para scroll suave */
    html {
      scroll-behavior: smooth;
    }
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
