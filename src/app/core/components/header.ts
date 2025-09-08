import { UserService } from './../../modules/auth/service/user.service';
import { Component, inject, HostListener, input, PLATFORM_ID, computed, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, map } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  template: `
    <nav
      [ngClass]="{
        'shadow-lg border-gray-300 dark:border-gray-800': isScrolled,
        'border-transparent': !isScrolled
      }"
      class="fixed top-0 z-[999] bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border-b transition-all duration-300"
      [style.left]="
        screenWidth() > 768 ? (collapsed() ? '16.5625rem' : '5rem') : '0'
      "
      [style.width]="
        screenWidth() > 768
          ? 'calc(100% - ' + (collapsed() ? '16.5625rem' : '5rem') + ')'
          : '100%'
      "
    >
    @let user = dataUser.value();
      <div class="flex items-center justify-end h-16 px-6">
        <div class="flex items-center gap-2">
          <button
            id="dropdownAvatarNameButton"
            data-dropdown-toggle="dropdownAvatarName"
            class="flex items-center text-sm pe-1 font-medium text-gray-900 rounded-full hover:text-blue-600 dark:hover:text-blue-500 md:me-0 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-white"
            type="button"
          >
            <span class="sr-only">Open user menu</span>
            <!-- <img
              class="w-8 h-8 me-2 rounded-full object-cover"
              src=""
              alt="user photo"
            /> -->
            <span>{{ user?.nombre || 'Usuario' }}</span>
            <svg
              class="w-2.5 h-2.5 ms-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 6"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 4 4 4-4"
              />
            </svg>
          </button>
          <div
            id="dropdownAvatarName"
            class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600"
          >
            <div class="px-4 py-3 text-sm text-gray-900 dark:text-white">
              <div class="font-medium">{{ user?.nombre || 'Usuario' }}</div>
              <!-- <div class="truncate">{{ user?.correo || 'email@example.com' }}</div> -->
            </div>
            <ul
              class="py-2 text-sm text-gray-700 dark:text-gray-200"
              aria-labelledby="dropdownAvatarNameButton"
            >
              <li>
                <a
                  href="/profile"
                  class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Mi Perfil
                </a>
              </li>
            </ul>
            <div class="py-2">
              <button
                (click)="logout()"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [],
})
export class Header {

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 0;
  }
  private router = inject(Router);
  private userService = inject(UserService);

  collapsed = input<boolean>(false);
  screenWidth = input<number>(0);
  isScrolled = false;

  // constructor(){
  //   effect(() => {
  //     console.log("la data de mi usuario mi pez", this.dataUser.value());
  //   });
  // }

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  readonly userId = computed(() => {
    if (!this.isBrowser) return null;

    try {
      const userData = sessionStorage.getItem('userData');
      if (!userData) return null;

      const parsedUserData = JSON.parse(userData);
      return parsedUserData.id ? Number(parsedUserData.id) : null;
    } catch (error) {
      console.error('Error parsing userData from sessionStorage:', error);
      return null;
    }
  });

  dataUser = rxResource({
    params: () => ({ enterpriseId: this.userId() }),
    stream: ({ params }) => {
      const { enterpriseId } = params;
      if (!enterpriseId) {
        console.warn('No enterprise ID available for bills');
        return EMPTY;
      }
      return this.userService.getUserSignal(enterpriseId).pipe(
        map(apiResponse => apiResponse.response)
      );
    }
  });

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/welcome']);
  }
}
