import {
  Component,
  ChangeDetectionStrategy,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-Welcome',
  standalone: true,
  styles: [
    `
      :root {
        --primary-text-color: #000;
        --bg-color: #ffffff;
        --btn-color: #fdfdfd;
        --btn-bg: #000;
        --header-link-hover: #000000;
        --header-link-hover-bg: #bababa36;

        --input-hover-bd-color: #232323;

        --dropdown-bg: #f3f4f6;
        --dropdown-hover-bg: #dddddd84;

        --faq-h-text: #0e0e0e;
        --faq-content-text: #1e1e1e;

        --hr-color: #e5e7eb;

        --footer-link: #282828;
        --footer-link-hover: #000;

        --header-bg: #edececa5;
        --hero-gradient: #fcfcfc;
        --hero-bg-img: url('/images/background/dots.svg');
      }

      .tw-dark {
        --primary-text-color: #fff;
        --bg-color: #000000;

        --btn-color: #000000;
        --btn-bg: #ffffff;

        --header-link-hover: #ffffff;
        --header-link-hover-bg: #8a8a8a5e;

        --input-hover-bd-color: #f8f8f8;

        --dropdown-bg: #171717;
        --dropdown-hover-bg: #2d2d2ddb;

        --faq-h-text: #efefef;
        --faq-content-text: #d4d4d4;

        --hr-color: #e1e1e195;

        --footer-link: #cfcfcf;
        --footer-link-hover: #ffffff;

        --header-bg: #232323a5;

        --hero-gradient: #000;
        --hero-bg-img: url('/images/background/dots-dark.svg');
      }

      html {
        scroll-behavior: smooth;
      }

      body.modal-open {
        overflow: hidden;
      }

      header > .collapsible-header {
        align-items: anchor-center;
        display: flex;
        gap: 1rem;
        width: 100%;
        place-content: center;
        transition: opacity 0.3s ease, height 0.3s ease, transform 0.3s ease;
      }

      hr {
        border-color: var(--hr-color);
        border-style: solid;
      }

      .animated-collapse {
        transition: width 0.3s ease;
      }

      .header-links {
        position: relative;
        display: flex;
        align-items: center;
        min-width: fit-content;
        padding: 8px 15px;
        z-index: 2;
        cursor: pointer;
        transition: background-color 0.5s, color 0.3s;
      }

      .header-links::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
        width: 100%;
        height: 100%;
        background-color: var(--header-link-hover-bg);
        transform: scale(40%);
        opacity: 0;
        border-radius: 8px;
        transition: all 300ms;
      }

      .header-links:hover {
        color: var(--header-link-hover);
      }

      .header-links:hover::after {
        transform: scale(100%);
        opacity: 1;
      }

      .hero-section {
        background-image: var(--hero-bg-img);
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
      }

      .hero-bg-gradient {
        background: linear-gradient(
          180deg,
          var(--hero-gradient) 23%,
          rgba(0, 0, 0, 0) 87%,
          var(--hero-gradient) 97%
        );
      }

      .gradient-text {
        background: rgb(215, 215, 215);
        background: linear-gradient(
          90deg,
          rgba(215, 215, 215, 1) 18%,
          rgba(136, 136, 136, 1) 71%
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .purple-bg-grad {
        background: rgb(126, 34, 206);
        background: linear-gradient(
          90deg,
          #7e22ce91 8%,
          #625aafae 31%,
          #7badbbbc 76%,
          #54d2d0ca 89%
        );
        filter: blur(50px);
        opacity: 0.5;
      }

      #dashboard {
        transform: perspective(1200px) translateX(0px) translateY(12px)
          scale(0.8) rotate(0deg) rotateX(70deg);
        transition: transform 0.5;
      }

      .opacity-0 {
        opacity: 0 !important;
      }

      .opacity-100 {
        opacity: 100 !important;
      }

      .btn {
        padding: 10px 15px;
        width: max-content;
        border-radius: 10px;
        color: var(--btn-color);
        background-color: var(--btn-bg);
        justify-content: center;
        align-items: center;
        display: flex;
        cursor: pointer;
      }

      .btn:hover {
      }

      .btn:disabled {
        cursor: default;
      }

      .input {
        padding: 10px;
        background-color: transparent;
        border-radius: 5px;
        outline: none;
        min-width: 100px;
        border: 1px solid #979797;
        transition: border 0.3s;
      }

      .input:active,
      .input:focus,
      .input:focus-within {
        border: 1px solid var(--input-hover-bd-color) !important;
      }

      .scrollbar::-webkit-scrollbar {
        width: 5px;
        height: 20px;
      }

      .scrollbar::-webkit-scrollbar-track {
        border-radius: 25px;
      }

      .scrollbar::-webkit-scrollbar-thumb {
        background: #d7d7d7;
        border-radius: 25px;
      }

      .dropdown {
        position: relative;
        display: inline-block;
        width: 100%;
      }

      .dropdown-toggle {
        width: 100%;
        outline: none;
      }

      .dropdown-menu {
        display: none;
        position: absolute;
        z-index: 1;
        background-color: var(--dropdown-bg);
        list-style-type: none;
        padding: 0;
        width: 100%;
        left: 0px;
        border-radius: 10px;
        overflow: hidden;
      }

      .dropdown-menu li {
        padding: 8px 12px;
        cursor: pointer;
      }

      .dropdown-menu li:hover {
        background-color: var(--dropdown-hover-bg);
      }
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

      .animated-border {
        position: relative;
        overflow: visible;
      }

      .animated-border::after {
        content: '';
        position: absolute;
        top: 0px;
        left: -100%;
        width: 30%;
        height: 100%;
        border-radius: inherit;
        background-color: #6366f1;
        background-repeat: no-repeat;
        background-position: 0% 0%;
        filter: blur(1.5rem);
        opacity: 0.8;
        box-shadow: inset 0px 0px 20px 5px #6366f1;
        z-index: -2;
        pointer-events: none;
        animation: slide 10s ease-in-out infinite;
      }

      .animated-border::before {
        filter: blur(1.5rem);
        opacity: 0.3;
        will-change: transform;
      }

      @keyframes slide {
        0% {
          left: -100%;
          right: 100%;
        }

        100% {
          left: 100%;
          right: -100%;
        }
      }

      .footer-link {
        width: -moz-fit-content;
        width: fit-content;
        color: var(--footer-link);
        transition: color 0.3s;
      }

      .footer-link:hover {
        color: var(--footer-link-hover);
      }

      .faq-accordion {
        background-color: inherit;
        color: var(--faq-h-text);
        cursor: pointer;
        padding: 15px 18px;
        width: 100%;
        border: none;
        text-align: left;
        outline: none;
        transition: height 0.4s;
      }

      .faq .content {
        padding: 0px 18px;
        color: var(--faq-content-text);
        height: max-content;
        overflow: hidden;
        background-color: transparent;
        text-align: justify;
        max-height: 0px;
        transition: max-height 0.4s, padding 0.4s;
      }

      @keyframes slideUp {
        0% {
          transform: translateY(100%);
          opacity: 0;
        }
        100% {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes wave {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-20px);
        }
      }

      .letter {
        display: inline-block;
        animation: wave 2s ease-in-out;
        animation-fill-mode: both;
      }

      /* Animación con delay de 6 segundos entre ciclos */
      @keyframes wave-sequence {
        0%,
        33.33%,
        100% {
          transform: translateY(0);
        }
        16.66% {
          transform: translateY(-20px);
        }
      }

      .letter {
        display: inline-block;
        animation: wave-sequence 6s ease-in-out infinite;
      }

      /* Responsive font sizes */
      @media (max-width: 1024px) {
        @keyframes wave-sequence {
          0%,
          33.33%,
          100% {
            transform: translateY(0);
          }
          16.66% {
            transform: translateY(-15px);
          }
        }
      }

      @media (max-width: 768px) {
        @keyframes wave-sequence {
          0%,
          33.33%,
          100% {
            transform: translateY(0);
          }
          16.66% {
            transform: translateY(-10px);
          }
        }
      }

      .letter:nth-child(1) {
        animation-delay: 0s;
      }
      .letter:nth-child(2) {
        animation-delay: 0.05s;
      }
      .letter:nth-child(3) {
        animation-delay: 0.1s;
      }
      .letter:nth-child(4) {
        animation-delay: 0.15s;
      }
      .letter:nth-child(5) {
        animation-delay: 0.2s;
      }
      .letter:nth-child(6) {
        animation-delay: 0.25s;
      }
      .letter:nth-child(7) {
        animation-delay: 0.3s;
      }
      .letter:nth-child(8) {
        animation-delay: 0.35s;
      }
      .letter:nth-child(9) {
        animation-delay: 0.4s;
      }
      .letter:nth-child(10) {
        animation-delay: 0.45s;
      }
      .letter:nth-child(11) {
        animation-delay: 0.5s;
      }
      .letter:nth-child(12) {
        animation-delay: 0.55s;
      }
      .letter:nth-child(13) {
        animation-delay: 0.6s;
      }
      .letter:nth-child(14) {
        animation-delay: 0.65s;
      }
      .letter:nth-child(15) {
        animation-delay: 0.7s;
      }
      .letter:nth-child(16) {
        animation-delay: 0.75s;
      }
      .letter:nth-child(17) {
        animation-delay: 0.8s;
      }
      .letter:nth-child(18) {
        animation-delay: 0.85s;
      }
      .letter:nth-child(19) {
        animation-delay: 0.9s;
      }
      .letter:nth-child(20) {
        animation-delay: 0.95s;
      }
      .letter:nth-child(21) {
        animation-delay: 1s;
      }
      .letter:nth-child(22) {
        animation-delay: 1.05s;
      }
      .letter:nth-child(23) {
        animation-delay: 1.1s;
      }
      .letter:nth-child(24) {
        animation-delay: 1.15s;
      }
      .letter:nth-child(25) {
        animation-delay: 1.2s;
      }
      .letter:nth-child(26) {
        animation-delay: 1.25s;
      }
      .letter:nth-child(27) {
        animation-delay: 1.3s;
      }
      .letter:nth-child(28) {
        animation-delay: 1.35s;
      }
      .letter:nth-child(29) {
        animation-delay: 1.4s;
      }
      .letter:nth-child(30) {
        animation-delay: 1.45s;
      }
      .letter:nth-child(31) {
        animation-delay: 1.5s;
      }

      .font-serif .letter:nth-child(1) {
        animation-delay: 1.55s;
      }
      .font-serif .letter:nth-child(2) {
        animation-delay: 1.6s;
      }
      .font-serif .letter:nth-child(3) {
        animation-delay: 1.65s;
      }
      .font-serif .letter:nth-child(4) {
        animation-delay: 1.7s;
      }
      .font-serif .letter:nth-child(5) {
        animation-delay: 1.75s;
      }
      .font-serif .letter:nth-child(6) {
        animation-delay: 1.8s;
      }
      .font-serif .letter:nth-child(7) {
        animation-delay: 1.85s;
      }
      .font-serif .letter:nth-child(8) {
        animation-delay: 1.9s;
      }
      .font-serif .letter:nth-child(9) {
        animation-delay: 1.95s;
      }
      .font-serif .letter:nth-child(10) {
        animation-delay: 2s;
      }
      .font-serif .letter:nth-child(11) {
        animation-delay: 2.05s;
      }
      .font-serif .letter:nth-child(12) {
        animation-delay: 2.1s;
      }
      .font-serif .letter:nth-child(13) {
        animation-delay: 2.15s;
      }
      .font-serif .letter:nth-child(14) {
        animation-delay: 2.2s;
      }
      .font-serif .letter:nth-child(15) {
        animation-delay: 2.25s;
      }
      .font-serif .letter:nth-child(16) {
        animation-delay: 2.3s;
      }

      #dashboard-container {
        transform-style: preserve-3d;
        perspective: 1000px;
      }

      #dashboard {
        transform: translateZ(-100px) scale(1.1);
        transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        animation: slideInUp 1.5s ease-out;
      }

      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateZ(-200px) translateY(100px) scale(0.8);
        }
        to {
          opacity: 1;
          transform: translateZ(-100px) translateY(0) scale(1.1);
        }
      }

      #dashboard:hover {
        transform: translateZ(-50px) scale(1.15) rotateY(5deg);
      }
    `,
  ],
  template: `
    <div
      class="dark flex min-h-[100vh] flex-col bg-[#fcfcfc]
            text-black dark:bg-black  dark:text-white"
    >
      <div
        class="pointer-events-none absolute inset-0"
        style="
          --img: var(--white-stripes), var(--aurora);
        "
      >
        <div
          class="
            absolute inset-0
            after:content-[''] after:absolute after:inset-0
            after:[background-image:var(--img)]
            after:[background-size:280%_260%,_200%_200%]
            after:[background-position:150%_12%,_150%_12%]
            after:animate-aurora
            after:opacity-50 after:blur-[16px]
            after:[mask-image:radial-gradient(ellipse_50%_40%_at_84%_10%,black_35%,transparent_64%)]
            dark:after:[background-image:var(--dark-stripes),var(--aurora)]
          "
        ></div>
      </div>

      <div class="pointer-events-none absolute inset-0">
        <div
          class="absolute bottom-0 left-0 h-0 w-[100vw] shadow-[0_0_50vh_40vh_rgba(255,255,255,0.18)]"
        ></div>
        <div
          class="absolute bottom-0 left-0 h-[100vh] w-0 shadow-[0_0_35vw_25vw_rgba(255,255,255,0.14)]"
        ></div>
      </div>
      <header
        class="fixed top-4 lg:left-1/2 lg:-translate-x-1/2 z-20
         flex h-[60px] w-full lg:max-w-5xl max-w-[100vw]
         items-center justify-between
         px-[3%] lg:px-4
         text-gray-700 dark:text-gray-300
         bg-white/70 dark:bg-gray-900/60 backdrop-blur-md
         border border-gray-300 dark:border-gray-800
         rounded-2xl shadow-lg"
      >
        <!-- Logo + marca -->
        <a href="#" class="flex gap-2 items-center p-1">
          <div
            class="w-10 h-10 lg:w-16 lg:h-16 transition-transform duration-300 hover:scale-110"
          >
            <img
              src="/images/logoAquaplus.png"
              alt="AquaPlus logo"
              class="object-contain h-full w-full"
            />
          </div>
          <span class="uppercase text-base font-medium text-amber-100"
            >AquaPlus</span
          >
        </a>

        <!-- Toggle (peer) -->
        <input type="checkbox" id="menu-toggle" class="hidden peer" />

        <!-- Contenedor colapsable -->
        <div
          class="collapsible-header
           lg:static lg:flex lg:w-auto lg:opacity-100 lg:visible lg:pointer-events-auto lg:translate-y-0 lg:shadow-none lg:bg-transparent
           max-lg:fixed max-lg:top-[60px] max-lg:left-0 max-lg:right-0
           max-lg:w-screen max-lg:max-h-[calc(100vh-60px)]
           max-lg:flex max-lg:flex-col max-lg:items-center max-lg:justify-between
           max-lg:bg-white/95 max-lg:dark:bg-gray-900/90
           max-lg:opacity-0 max-lg:invisible max-lg:pointer-events-none max-lg:translate-y-2
           max-lg:overflow-y-auto max-lg:shadow-md
           z-40
           transition-[opacity,transform,visibility] duration-300 ease-out
           peer-checked:max-lg:opacity-100 peer-checked:max-lg:visible
           peer-checked:max-lg:pointer-events-auto peer-checked:max-lg:translate-y-0"
        >
          <!-- Links -->
          <nav
            class="relative flex h-full items-center
             gap-6 text-base lg:mx-auto
             max-lg:flex-col max-lg:h-max max-lg:gap-5 max-lg:mt-6"
          >
            <a class="text-amber-100 hover:opacity-80 transition" href="#"
              >Nosotros</a
            >
            <a class="text-amber-100 hover:opacity-80 transition" href="#"
              >Galería</a
            >
            <a class="text-amber-100 hover:opacity-80 transition" href="#"
              >Soluciones</a
            >
            <a class="text-amber-100 hover:opacity-80 transition" href="#"
              >Contáctanos</a
            >
          </nav>

          <!-- Botones de acción (sin bordes) -->
          <div
            class="flex items-center gap-3 text-base p-1
             lg:ml-6
             max-md:w-full max-md:flex-col max-md:justify-center"
          >
            <a
              routerLink="/auth/login"
              class="px-3 py-2 rounded-md hover:translate-x-1 hover:bg-white/10 dark:hover:bg-white/10 transition
               flex items-center gap-2"
            >
              <span class="text-amber-100">Iniciar Sesión</span>
            </a>

            <a
              routerLink="/auth/register"
              class="px-3 py-2 rounded-md hover:translate-x-1 hover:bg-white/10 dark:hover:bg-white/10 transition
               flex items-center gap-2"
            >
              <span class="text-amber-100">Regístrate</span>
            </a>
          </div>
        </div>

        <label
          for="menu-toggle"
          class="lg:hidden absolute right-3 top-2 z-50 block cursor-pointer p-2 rounded-md
           focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Abrir menú"
        >
          <svg
            class="w-7 h-7 text-gray-200"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </label>
      </header>

      <section
        class="hero-section relative mt-20 flex min-h-[100vh] w-full max-w-[100vw] flex-col overflow-hidden max-lg:mt-[100px]"
        id="hero-section"
      >
        <div
          class="hero-bg-gradient relative flex h-full min-h-[100vh] w-full flex-col place-content-center gap-6 p-[5%] max-xl:place-items-center max-lg:p-4"
        >
          <div
            class="purple-bg-grad  reveal-up absolute left-1/2 -translate-1/2 top-[10%] h-[120px] w-[120px]"
          ></div>

          <div
            class="flex flex-col min-h-[60vh] place-content-center items-center"
          >
            <h2
              class="reveal-up text-center text-5xl font-semibold uppercase leading-[90px] max-lg:text-4xl max-md:leading-snug"
            >
              <span class="">
                <span class="letter">T</span>
                <span class="letter">o</span>
                <span class="letter">d</span>
                <span class="letter">a</span>
                <span class="letter">&nbsp;</span>
                <span class="letter">l</span>
                <span class="letter">a</span>
                <span class="letter">&nbsp;</span>
                <span class="letter">g</span>
                <span class="letter">e</span>
                <span class="letter">s</span>
                <span class="letter">t</span>
                <span class="letter">i</span>
                <span class="letter">ó</span>
                <span class="letter">n</span>
                <span class="letter">&nbsp;</span>
                <span class="letter">d</span>
                <span class="letter">e</span>
                <span class="letter">&nbsp;</span>
                <span class="letter">t</span>
                <span class="letter">u</span>
                <span class="letter">&nbsp;</span>
                <span class="letter">a</span>
                <span class="letter">c</span>
                <span class="letter">u</span>
                <span class="letter">e</span>
                <span class="letter">d</span>
                <span class="letter">u</span>
                <span class="letter">c</span>
                <span class="letter">t</span>
                <span class="letter">o</span>
              </span>
              <br />
              <span class="font-thin font-serif">
                <span class="letter">e</span>
                <span class="letter">n</span>
                <span class="letter">&nbsp;</span>
                <span class="letter">u</span>
                <span class="letter">n</span>
                <span class="letter">&nbsp;</span>
                <span class="letter">s</span>
                <span class="letter">o</span>
                <span class="letter">l</span>
                <span class="letter">o</span>
                <span class="letter">&nbsp;</span>
                <span class="letter">l</span>
                <span class="letter">u</span>
                <span class="letter">g</span>
                <span class="letter">a</span>
                <span class="letter">r</span>
              </span>
            </h2>
            <div
              class="reveal-up mt-8 max-w-[450px] text-lg max-lg:text-base p-2 text-center
                         text-gray-800 dark:text-white max-lg:max-w-full"
            >
              <!-- Test, Develop and Deploy all your AI models in one place, with Pixa seamless playground interface -->
              Administra clientes, lecturas, facturas y pagos con nuestra
              plataforma en la nube. Simple, segura y diseñada para acueductos
              rurales y comunitarios.
            </div>

            <div
              class="reveal-up mt-10 max-md:flex-col flex place-items-center gap-4"
            >
              <button
                class="btn !w-[170px] max-lg:!w-[160px] !rounded-xl !py-4 max-lg:!py-2 flex gap-2 group !bg-transparent !text-black dark:!text-white transition-colors
                                        duration-[0.3s] border-[1px] border-black dark:border-white"
              >
                <div
                  class="relative flex place-items-center place-content-center w-6 h-6"
                >
                  <div
                    class="absolute inset-0 top-0 left-0 scale-0 duration-300 group-hover:scale-100 border-2
                                             border-gray-600 dark:border-gray-200 rounded-full w-full h-full"
                  ></div>
                  <svg
                    class="w-6 h-6 text-gray-800 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-6.616l-2.88 2.592C8.537 20.461 7 19.776 7 18.477V17H5a2 2 0 0 1-2-2V6Zm4 2a1 1 0 0 0 0 2h5a1 1 0 1 0 0-2H7Zm8 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2Zm-8 3a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H7Zm5 0a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2h-5Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <span>Mas info...</span>
              </button>

              <a
                class="btn btn-blur group max-lg:!w-[160px] flex gap-2 shadow-lg !w-[170px] !rounded-xl !py-4 max-lg:!py-2 transition-transform duration-[0.3s] hover:scale-x-[1.03]"
                href="#"
              >
                <span>Empezar</span>
                <i
                  class="bi bi-arrow-right group-hover:translate-x-1 duration-300"
                ></i>
              </a>
            </div>
          </div>

          <!-- prompt container -->
          <div
            class="reveal-up  relative mt-8 flex w-full place-content-center place-items-center"
            id="dashboard-container"
          >
            <div
              class="purple-bg-grad  reveal-up absolute left-1/2 -translate-x-1/2 top-[5%] h-[200px] w-[200px]"
            ></div>

            <img
              class="relative z-10 w-full max-w-4xl rounded-lg shadow-2xl"
              id="dashboard"
              src="/images/dashboard.png"
              alt="dashboard"
            />
          </div>
        </div>
      </section>

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

      <section
        class="relative flex  w-full min-h-[100vh] max-lg:min-h-[80vh] flex-col place-content-center place-items-center overflow-hidden"
      >
        <div
          class="w-full  place-content-center items-center
                        flex flex-col max-w-[900px] gap-4 p-4"
        >
          <div
            class="purple-bg-grad  reveal-up absolute right-[20%] top-[20%] h-[200px] w-[200px]"
          ></div>
          <h2
            class="reveal-up text-6xl max-lg:text-4xl text-center leading-normal uppercase"
          >
            <span class="font-semibold">Construye la gestión de </span>
            <br />
            <span class="font-serif"> tu acueducto en un solo sistema</span>
          </h2>
          <p
            class="reveal-up mt-8 max-w-[650px] text-gray-900 dark:text-gray-200 text-center max-md:text-sm"
          >
            AquaPlus centraliza clientes, lecturas, facturas y pagos en una
            plataforma en la nube. Automatiza tus procesos y gana tiempo en cada
            ciclo de facturación.
          </p>
          <div class="reveal-up flex mt-8">
            <a
              href="#"
              target="_blank"
              rel="noopener"
              class="shadow-md hover:shadow-xl dark:shadow-gray-800 transition-all duration-300
                                        border-[1px] p-3 px-4 border-black dark:border-white rounded-md"
            >
              Explorar módulos
            </a>
          </div>
        </div>
      </section>

      <section
        class="relative flex max-w-[100vw] flex-col place-content-center place-items-center overflow-hidden"
      >
        <div class="mt-8 flex flex-col w-full h-full place-items-center gap-5">
          <div class="reveal-up mt-5 flex flex-col gap-3 text-center">
            <h2 class="text-6xl font-medium max-md:text-3xl p-2">
              Experimenta todos los beneficios de AquaPlus
            </h2>
          </div>
          <div
            class="mt-6 flex flex-col max-w-[1150px] max-lg:max-w-full h-full
                            p-4 max-lg:place-content-center gap-8 "
          >
            <div
              class="max-xl:flex max-xl:flex-col place-items-center grid grid-cols-3 gap-8
                                place-content-center auto-rows-auto"
            >
              <div class="reveal-up w-[350px] h-[540px] flex max-md:w-full">
                <a
                  href="#"
                  class="group cursor-pointer relative p-10 transition-all duration-500 overflow-hidden gap-5 flex
                                flex-col w-full h-full bg-[#f6f7fb] dark:bg-[#171717] rounded-3xl shadow-inner shadow-gray-50 dark:shadow-gray-900
                                hover:scale-[1.02]"
                >
                  <!-- Efectos de gradiente animados con opacidad inicial -->
                  <div
                    class="absolute inset-0 opacity-30 group-hover:opacity-100 transition-opacity duration-500"
                  >
                    <div
                      class="after:duration-500 before:duration-500 duration-500
                                group-hover:before:translate-x-11 group-hover:before:-translate-y-11
                                group-hover:after:translate-x-11 group-hover:after:translate-y-16
                                after:absolute after:w-24 after:h-24 after:bg-orange-400
                                after:rounded-full after:-z-10 after:blur-xl after:bottom-32 after:right-16
                                before:absolute before:w-32 before:h-32 before:bg-sky-400
                                before:rounded-full before:-z-10 before:blur-xl before:top-20 before:right-16"
                    ></div>
                  </div>

                  <!-- Contenido con z-index más alto -->
                  <div class="relative z-10 flex flex-col gap-5 h-full">
                    <div class="overflow-hidden w-full min-h-[180px] h-[180px]">
                      <img
                        src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        class="w-full object-cover h-full rounded-[8px]"
                        alt="unified interface"
                      />
                    </div>
                    <h2 class="text-3xl max-md:text-2xl font-medium">
                      Interfaz unificada
                    </h2>
                    <p
                      class="text-base leading-normal text-gray-800 dark:text-gray-200"
                    >
                      Gestiona clientes, facturas, lecturas y pagos desde un
                      solo lugar. Olvídate de manejar múltiples herramientas:
                      todo está integrado en una plataforma fácil de usar.
                    </p>
                    <div class="flex items-center gap-2 mt-auto">
                      <span>Mas información</span>
                      <i
                        class="bi bi-arrow-right transform transition-transform duration-300 group-hover:translate-x-2"
                      ></i>
                    </div>
                  </div>
                </a>
              </div>

              <div class="reveal-up w-[350px] h-[540px] flex max-md:w-full">
                <a
                  href="#"
                  class="group cursor-pointer relative p-10 transition-all duration-500 overflow-hidden gap-5 flex
                                flex-col w-full h-full bg-[#f6f7fb] dark:bg-[#171717] rounded-3xl shadow-inner shadow-gray-50 dark:shadow-gray-900
                                hover:scale-[1.02]"
                >
                  <!-- Efectos de gradiente animados con opacidad inicial -->
                  <div
                    class="absolute inset-0 opacity-30 group-hover:opacity-100 transition-opacity duration-500"
                  >
                    <div
                      class="after:duration-500 before:duration-500 duration-500
                                group-hover:before:translate-x-11 group-hover:before:-translate-y-11
                                group-hover:after:translate-x-11 group-hover:after:translate-y-16
                                after:absolute after:w-24 after:h-24 after:bg-orange-400
                                after:rounded-full after:-z-10 after:blur-xl after:bottom-32 after:right-16
                                before:absolute before:w-32 before:h-32 before:bg-sky-400
                                before:rounded-full before:-z-10 before:blur-xl before:top-20 before:right-16"
                    ></div>
                  </div>

                  <!-- Contenido con z-index más alto -->
                  <div class="relative z-10 flex flex-col gap-5 h-full">
                    <div class="overflow-hidden w-full min-h-[180px] h-[180px]">
                      <img
                        src="https://plus.unsplash.com/premium_photo-1683120968693-9af51578770e?q=80&w=663&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        class="w-full object-cover h-full rounded-[8px]"
                        alt="unified interface"
                      />
                    </div>
                    <h2 class="text-3xl max-md:text-2xl font-medium">
                      Plataforma en la nube
                    </h2>
                    <p
                      class="text-base leading-normal text-gray-800 dark:text-gray-200"
                    >
                      Accede a tu acueducto desde cualquier dispositivo con
                      internet. Sin instalaciones complicadas y con la seguridad
                      de tener tu información siempre protegida.
                    </p>
                    <div class="flex items-center gap-2 mt-auto">
                      <span>Mas información</span>
                      <i
                        class="bi bi-arrow-right transform transition-transform duration-300 group-hover:translate-x-2"
                      ></i>
                    </div>
                  </div>
                </a>
              </div>

              <div class="reveal-up w-[350px] h-[540px] flex max-md:w-full">
                <a
                  href="#"
                  class="group cursor-pointer relative p-10 transition-all duration-500 overflow-hidden gap-5 flex
                                flex-col w-full h-full bg-[#f6f7fb] dark:bg-[#171717] rounded-3xl shadow-inner shadow-gray-50 dark:shadow-gray-900
                                hover:scale-[1.02]"
                >
                  <div
                    class="absolute inset-0 opacity-30 group-hover:opacity-100 transition-opacity duration-500"
                  >
                    <div
                      class="after:duration-500 before:duration-500 duration-500
                                group-hover:before:translate-x-11 group-hover:before:-translate-y-11
                                group-hover:after:translate-x-11 group-hover:after:translate-y-16
                                after:absolute after:w-24 after:h-24 after:bg-orange-400
                                after:rounded-full after:-z-10 after:blur-xl after:bottom-32 after:right-16
                                before:absolute before:w-32 before:h-32 before:bg-sky-400
                                before:rounded-full before:-z-10 before:blur-xl before:top-20 before:right-16"
                    ></div>
                  </div>

                  <div class="relative z-10 flex flex-col gap-5 h-full">
                    <div class="overflow-hidden w-full min-h-[180px] h-[180px]">
                      <img
                        src="https://plus.unsplash.com/premium_photo-1683288662019-c92caea8276d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c29md2FyZSUyMEZ1bmNpb25hbGlkYWRlcyUyMGludGVncmFkYXN8ZW58MHx8MHx8fDA%3D"
                        class="w-full object-cover h-full rounded-[8px]"
                        alt="unified interface"
                      />
                    </div>
                    <h2 class="text-3xl max-md:text-2xl font-medium">
                      Funcionalidades integradas
                    </h2>
                    <p
                      class="text-base leading-normal text-gray-800 dark:text-gray-200"
                    >
                      Incluye módulos de clientes, contadores, empleados,
                      empresas y reportes. Todo lo que necesitas para
                      administrar tu acueducto ya está listo para que lo uses.
                    </p>
                    <div class="flex items-center gap-2 mt-auto">
                      <span>Mas información</span>
                      <i
                        class="bi bi-arrow-right transform transition-transform duration-300 group-hover:translate-x-2"
                      ></i>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <div
              class="reveal-up w-full md:h-[350px] max-md:min-h-[350px] flex"
            >
              <a
                href="#"
                class="group cursor-pointer relative p-10 transition-all duration-500 overflow-hidden gap-5 flex
                            max-md:flex-col w-full h-full bg-[#f6f7fb] dark:bg-[#171717] rounded-3xl shadow-inner shadow-gray-50 dark:shadow-gray-900
                            hover:scale-[1.02]"
              >
                <!-- Efectos de gradiente animados con opacidad inicial -->
                <div
                  class="absolute inset-0 opacity-30 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                >
                  <div
                    class="after:duration-500 before:duration-500 duration-500
                              group-hover:before:translate-x-11 group-hover:before:-translate-y-11
                              group-hover:after:translate-x-11 group-hover:after:translate-y-16
                              after:absolute after:w-24 after:h-24 after:bg-orange-400
                              after:rounded-full after:-z-10 after:blur-xl after:bottom-32 after:right-16
                              before:absolute before:w-32 before:h-32 before:bg-sky-400
                              before:rounded-full before:-z-10 before:blur-xl before:top-20 before:right-16"
                  ></div>
                </div>

                <!-- Contenido con z-index más alto -->
                <div
                  class="relative z-10 flex max-md:flex-col gap-5 h-full w-full"
                >
                  <div
                    class="text-6xl overflow-hidden rounded-xl w-full h-full max-md:h-[180px]"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGFzaGJvYXJkfGVufDB8fDB8fHww"
                      class="w-full object-cover h-full rounded-lg"
                      alt="AI models"
                    />
                  </div>
                  <div class="flex flex-col gap-4">
                    <h2 class="text-3xl max-md:text-2xl font-medium">
                      Información en tiempo real
                    </h2>
                    <p class="leading-normal text-gray-800 dark:text-gray-200">
                      Accede a reportes completos de consumo, pagos y cartera en
                      cuestión de segundos. Nuestra plataforma te ofrece
                      información clara, precisa y siempre actualizada para que
                      tengas una visión integral del estado de tu acueducto.
                    </p>
                    <div class="flex items-center gap-2 mt-auto">
                      <span>Mas información</span>
                      <i
                        class="bi bi-arrow-right transform transition-transform duration-300 group-hover:translate-x-2"
                      ></i>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        class="relative mt-10 flex min-h-[100vh] w-full max-w-[100vw] flex-col place-items-center lg:p-6"
      >
        <div
          class="reveal-up mt-[5%] flex h-full w-full place-content-center
                        gap-12 p-4 max-lg:max-w-full max-lg:flex-col"
        >
          <div
            class="relative flex max-w-[30%] max-lg:max-w-full flex-col
                                place-items-start gap-4 p-2 max-lg:place-items-center
                                max-lg:place-content-center max-lg:w-full"
          >
            <div
              class="top-40 flex flex-col lg:sticky place-items-center max-h-fit max-w-[850px] max-lg:max-h-fit max-lg:max-w-[320px] overflow-hidden"
            >
              <spline-viewer
                url="https://prod.spline.design/hUKk7zbTgPY1BhH0/scene.splinecode"
                class="w-[800px] h-[800px]"
              ></spline-viewer>
            </div>
          </div>

          <div
            class="flex flex-col gap-10 h-full max-w-1/2 max-lg:max-w-full px-[10%]
                             max-lg:px-4 max-lg:gap-3 max-lg:w-full lg:top-[20%]
                             place-items-center
                             "
          >
            <div class="reveal-up h-[240px] w-[450px] max-md:w-full">
              <a
                href="#"
                class="flex w-full h-full gap-8 rounded-xl
                                    hover:shadow-lg dark:shadow-[#171717] duration-300 transition-all
                                  p-8 group/card"
              >
                <div class="text-4xl max-md:text-2xl">
                  <i class="bi bi-code-square"></i>
                </div>

                <div class="flex flex-col gap-4">
                  <h3 class="text-2xl max-md:text-xl">Clientes</h3>
                  <p class="text-gray-800 dark:text-gray-100 max-md:text-sm">
                    Administra la información de cada suscriptor de manera
                    organizada. Registra datos, consulta historiales y mantén
                    actualizado el estado de tus usuarios.
                  </p>

                  <div class="mt-auto flex gap-2 underline underline-offset-4">
                    <span>Conocer más</span>
                    <i
                      class="bi bi-arrow-up-right group-hover/card:-translate-y-1
                                                group-hover/card:translate-x-1 duration-300 transition-transform"
                    ></i>
                  </div>
                </div>
              </a>
            </div>

            <div class="reveal-up h-[240px] w-[450px] max-md:w-full">
              <a
                href="#"
                class="flex w-full h-full gap-8 rounded-xl
                                 hover:shadow-lg dark:shadow-[#171717] duration-300 transition-all p-8 group/card"
              >
                <div class="text-4xl max-md:text-2xl">
                  <i class="bi bi-file-pdf-fill"></i>
                </div>

                <div class="flex flex-col gap-4">
                  <h3 class="text-2xl max-md:text-xl">Lecturas</h3>
                  <p class="text-gray-800 dark:text-gray-100 max-md:text-sm">
                    Registra y controla las mediciones de consumo de agua. Obtén
                    un historial detallado que garantiza transparencia y
                    precisión en la facturación.
                  </p>

                  <div class="mt-auto flex gap-2 underline underline-offset-4">
                    <span>Conocer más</span>
                    <i
                      class="bi bi-arrow-up-right group-hover/card:-translate-y-1
                                                group-hover/card:translate-x-1 duration-300 transition-transform"
                    ></i>
                  </div>
                </div>
              </a>
            </div>

            <div class="reveal-up h-[240px] w-[450px] max-md:w-full">
              <a
                href="#"
                class="flex w-full h-full gap-8 rounded-xl hover:shadow-lg duration-300
                                transition-all dark:shadow-[#171717] p-8 group/card"
              >
                <div class="text-4xl max-md:text-2xl">
                  <i class="bi bi-image-fill"></i>
                </div>

                <div class="flex flex-col gap-4">
                  <h3 class="text-2xl max-md:text-xl">Facturas</h3>
                  <p class="text-gray-800 dark:text-gray-100 max-md:text-sm">
                    Genera y personaliza facturas en segundos. Programa la
                    facturación automática, descarga documentos en PDF y
                    envíalos digitalmente a tus clientes.
                  </p>

                  <div class="mt-auto flex gap-2 underline underline-offset-4">
                    <span>Conocer más</span>
                    <i
                      class="bi bi-arrow-up-right group-hover/card:-translate-y-1
                                                group-hover/card:translate-x-1 duration-300 transition-transform"
                    ></i>
                  </div>
                </div>
              </a>
            </div>

            <div class="reveal-up h-[240px] w-[450px] max-md:w-full">
              <a
                href="#"
                class="flex w-full dark:shadow-[#171717] h-full gap-8 rounded-xl  hover:shadow-lg duration-300
                            transition-all p-8 group/card"
              >
                <div class="text-4xl max-md:text-2xl">
                  <i class="bi bi-bar-chart-line-fill"></i>
                </div>

                <div class="flex flex-col gap-4">
                  <h3 class="text-2xl max-md:text-xl">Pagos</h3>
                  <p class="text-gray-800 dark:text-gray-100 max-md:text-sm">
                    Lleva un control completo de abonos, acuerdos y estados de
                    cuenta. Visualiza la cartera al instante y mejora la gestión
                    financiera de tu acueducto.
                  </p>

                  <div class="mt-auto flex gap-2 underline underline-offset-4">
                    <span>Conocer más</span>
                    <i
                      class="bi bi-arrow-up-right group-hover/card:-translate-y-1
                                                group-hover/card:translate-x-1 duration-300 transition-transform"
                    ></i>
                  </div>
                </div>
              </a>
            </div>

            <div class="reveal-up h-[240px] w-[450px] max-md:w-full">
              <a
                href="#"
                class="flex w-full h-full gap-8 rounded-xl dark:shadow-[#171717] hover:shadow-lg duration-300
                                transition-all p-8 group/card"
              >
                <div class="text-4xl max-md:text-2xl">
                  <i class="bi bi-music-note-beamed"></i>
                </div>

                <div class="flex flex-col gap-4">
                  <h3 class="text-2xl max-md:text-xl">Contadores</h3>
                  <p class="text-gray-800 dark:text-gray-100 max-md:text-sm">
                    Registra, actualiza y gestiona la información de cada
                    medidor. Controla ubicación, estado y lecturas para asegurar
                    facturación confiable.
                  </p>

                  <div class="mt-auto flex gap-2 underline underline-offset-4">
                    <span>Conocer más</span>
                    <i
                      class="bi bi-arrow-up-right group-hover/card:-translate-y-1
                                                group-hover/card:translate-x-1 duration-300 transition-transform"
                    ></i>
                  </div>
                </div>
              </a>
            </div>

            <div class="reveal-up h-[240px] w-[450px] max-md:w-full">
              <a
                href="#"
                class="flex w-full h-full gap-8 rounded-xl
                                    hover:shadow-lg dark:shadow-[#171717] duration-300 transition-all p-8 group/card"
              >
                <div class="text-4xl max-md:text-2xl">
                  <i class="bi bi-people-fill"></i>
                </div>

                <div class="flex flex-col gap-4">
                  <h3 class="text-2xl max-md:text-xl">Empleados</h3>
                  <p class="text-gray-800 dark:text-gray-100 max-md:text-sm">
                    Organiza tu equipo de trabajo asignando roles, permisos y
                    actividades. Ten siempre a mano la información del personal
                    de tu acueducto.
                  </p>

                  <div class="mt-auto flex gap-2 underline underline-offset-4">
                    <span>Conocer más</span>
                    <i
                      class="bi bi-arrow-up-right group-hover/card:-translate-y-1
                                                group-hover/card:translate-x-1 duration-300 transition-transform"
                    ></i>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        class="relative flex  w-full min-h-[110vh] max-md:min-h-[80vh] flex-col place-content-center place-items-center overflow-hidden"
      >
        <div
          class="w-full max-lg:max-w-full place-content-center items-center
                        flex flex-col max-w-[80%] gap-4 p-4"
        >
          <h3
            class="reveal-up text-5xl font-medium max-md:text-3xl text-center leading-normal"
          >
            Inventario y Contabilidad
          </h3>
          <div
            class="mt-8 relative gap-10 p-4 grid place-items-center grid-cols-3 max-lg:flex max-lg:flex-col"
          >
            <div
              class="reveal-up  w-[350px] border-[1px] h-[400px] rounded-md place-items-center p-4
                                 bg-[#f2f3f4] max-md:w-[320px] dark:bg-[#141414] dark:border-[#1f2123] flex flex-col gap-3"
            >
              <div
                class="w-full h-[250px]
                                    p-4
                                    rounded-xl
                                     backdrop-blur-2xl
                                     overflow-hidden flex place-content-center"
              >
                <img
                  src="https://images.unsplash.com/photo-1707157284454-553ef0a4ed0d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Prompt library"
                  class="w-auto h-full object-contain rounded-[20px]"
                />
              </div>
              <h3 class="text-2xl">Inventario</h3>
              <p
                class="text-gray-700 dark:text-gray-300 px-4 text-center text-sm"
              >
                Monitorea en tiempo real la cantidad de materiales, equipos y
                suministros disponibles, evitando pérdidas y faltantes
                inesperados.
              </p>
            </div>

            <div
              class="reveal-up w-[350px] max-md:w-[320px] border-[1px] h-[400px] rounded-md place-items-center p-4
                                 bg-[#f2f3f4] dark:bg-[#141414] dark:border-[#1f2123] flex flex-col gap-3"
            >
              <div
                class="w-full h-[250px]
                                    p-4
                                    rounded-xl
                                     backdrop-blur-2xl
                                     overflow-hidden flex place-content-center"
              >
                <img
                  src="https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Web search"
                  class="w-auto h-full object-contain rounded-[20px]"
                />
              </div>
              <h3 class="text-2xl">Registro de movimientos</h3>
              <p
                class="text-gray-700 dark:text-gray-300 px-4 text-center text-sm"
              >
                Lleva un historial claro de entradas y salidas del inventario,
                con detalles de fechas, cantidades y responsables.
              </p>
            </div>

            <div
              class="reveal-up w-[350px] max-md:w-[320px] border-[1px] h-[400px] rounded-lg place-items-center p-4
                                 bg-[#f2f3f4] dark:bg-[#141414] dark:border-[#1f2123] flex flex-col gap-3"
            >
              <div
                class="w-full h-[250px]
                                    p-4
                                    rounded-xl
                                     backdrop-blur-2xl
                                     overflow-hidden flex place-content-center"
              >
                <img
                  src="https://plus.unsplash.com/premium_photo-1728105954570-7e99b218e5f1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Image generation"
                  class="w-auto h-full object-contain rounded-[20px]"
                />
              </div>
              <h3 class="text-2xl">Planificación de compras</h3>
              <p
                class="text-gray-700 dark:text-gray-300 px-4 text-center text-sm"
              >
                Identifica necesidades de reposición y organiza pedidos con
                anticipación para garantizar el funcionamiento del acueducto.
              </p>
            </div>

            <div
              class="reveal-up w-[350px] max-md:w-[320px] border-[1px] h-[400px] rounded-lg place-items-center p-4
                                 bg-[#f2f3f4] dark:bg-[#141414] dark:border-[#1f2123] flex flex-col gap-3"
            >
              <div
                class="w-full h-[250px]
                                    p-4
                                     rounded-xl
                                     backdrop-blur-2xl
                                     overflow-hidden flex place-content-center"
              >
                <img
                  src="https://plus.unsplash.com/premium_photo-1680196764069-2c373356fee9?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="History"
                  class="w-auto h-full object-contain rounded-[20px]"
                />
              </div>
              <h3 class="text-2xl">Ingresos y egresos</h3>
              <p
                class="text-gray-700 dark:text-gray-300 px-4 text-center text-sm"
              >
                Registra y clasifica todos los movimientos financieros de tu
                acueducto, manteniendo un control ordenado de la economía.
              </p>
            </div>

            <div
              class="reveal-up w-[350px] max-md:w-[320px] border-[1px] h-[400px] rounded-lg place-items-center p-4
                                 bg-[#f2f3f4] dark:bg-[#141414] dark:border-[#1f2123] flex flex-col gap-3"
            >
              <div
                class="w-full h-[250px]
                                    p-4
                                    rounded-xl
                                     backdrop-blur-2xl
                                     overflow-hidden flex place-content-center"
              >
                <img
                  src="https://images.unsplash.com/photo-1696831519293-876b5f8fcd49?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fEluZ3Jlc29zJTIweSUyMGVncmVzb3N8ZW58MHx8MHx8fDA%3D"
                  alt="Import content"
                  class="w-auto h-full object-contain rounded-[20px]"
                />
              </div>
              <h3 class="text-2xl">Reportes financieros</h3>
              <p
                class="text-gray-700 dark:text-gray-300 px-4 text-center text-sm"
              >
                Genera balances, estados de resultados y reportes personalizados
                que te permiten conocer la salud financiera de tu acueducto.
              </p>
            </div>

            <div
              class="reveal-up w-[350px] max-md:w-[320px] border-[1px] h-[400px] rounded-lg place-items-center p-4
                                 bg-[#f2f3f4] dark:bg-[#141414] dark:border-[#1f2123] flex flex-col gap-3"
            >
              <div
                class="w-full h-[250px]
                                    p-4
                                    rounded-xl
                                     backdrop-blur-2xl
                                     overflow-hidden flex place-content-center"
              >
                <img
                  src="https://images.unsplash.com/photo-1531190260877-c8d11eb5afaf?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Multilingual"
                  class="w-auto h-full object-contain rounded-[20px]"
                />
              </div>
              <h3 class="text-2xl">Integración con cartera</h3>
              <p
                class="text-gray-700 dark:text-gray-300 px-4 text-center text-sm"
              >
                Vincula automáticamente los pagos de los clientes con la
                contabilidad para obtener información precisa y actualizada en
                todo momento.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer
        class="mt-auto flex flex-col w-full gap-4 text-sm pt-[5%] pb-10 px-[10%]
              text-black dark:text-white max-md:flex-col"
      >
        <div
          class="flex max-md:flex-col max-md:gap-6 gap-3 w-full place-content-around"
        >
          <div
            class="flex h-full w-[250px] flex-col place-items-center gap-6 max-md:w-full"
          >
            <a href="#" class="w-full place-items-center flex flex-col gap-6">
              <img
                src="/images/logoAquaplus.png"
                alt="logo"
                class="max-w-[120px]"
              />
              <div class="max-w-[120px] text-center text-3xl h-fit">
                AquaPlus
              </div>
            </a>
            <div class="flex gap-4 text-lg">
              <a href="https://github.com/" aria-label="Github">
                <i class="bi bi-github"></i>
              </a>
              <a href="https://twitter.com/" aria-label="Twitter">
                <i class="bi bi-twitter"></i>
              </a>
              <a href="https://www.linkedin.com/" aria-label="Linkedin">
                <i class="bi bi-linkedin"></i>
              </a>
            </div>
          </div>

          <div
            class="flex max-md:flex-col flex-wrap gap-6 h-full w-full justify-around"
          >
            <div class="flex h-full w-[200px] flex-col gap-4">
              <h2 class="text-xl">Recursos</h2>
              <div class="flex flex-col gap-3">
                <a href="#" class="footer-link">Primeros pasos</a>
                <a href="#" class="footer-link">Manual de usuario</a>
                <a href="#" class="footer-link">Preguntas frecuentes</a>
                <a href="#" class="footer-link">Tutoriales y videos</a>
                <a href="#" class="footer-link">Planes y precios</a>
              </div>
            </div>

            <div class="flex h-full w-[200px] flex-col gap-4">
              <h2 class="text-xl">Compañía</h2>
              <div class="flex flex-col gap-3">
                <a href="#" class="footer-link">Quiénes somos</a>
                <a href="#" class="footer-link">Soporte técnico</a>
                <a href="#" class="footer-link">Blog / Noticias</a>
                <a href="#" class="footer-link">Casos de éxito</a>
                <a href="#" class="footer-link">Contacto</a>
              </div>
            </div>

            <div class="flex h-full w-[200px] flex-col gap-4">
              <h2 class="text-xl">Legal</h2>
              <div class="flex flex-col gap-3">
                <a href="#" class="footer-link">Términos de servicio</a>
                <a href="#" class="footer-link">Política de privacidad</a>
                <a href="#" class="footer-link">Protección de datos</a>
              </div>
            </div>
          </div>
        </div>

        <hr class="mt-8" />
        <div
          class="mt-2 flex gap-2 flex-col text-gray-700 dark:text-gray-300 place-items-center
              text-[12px] w-full text-center place-content-around"
        >
          <span>Copyright &#169; 2025 AquaPlus</span>
          <span>Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [RouterLink],
})
export class Welcome {}
