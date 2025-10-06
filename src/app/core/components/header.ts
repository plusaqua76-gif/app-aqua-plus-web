import { UserService } from './../../modules/auth/service/user.service';
import { Component, inject, HostListener, input, PLATFORM_ID, computed, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY, map } from 'rxjs';
import { BreadcrumbService } from '@services/breadcrumb.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  template: `
    <nav
      class="fixed top-0 z-[999] bg-white/70 dark:bg-gray-900/60 backdrop-blur-md  transition-all duration-300"
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
      <div class="flex items-center justify-end h-16 pr-6 pl-3.5">
        <!-- Breadcrumb Section -->
        <div class="hidden md:flex items-center min-w-0 flex-[4] max-w-[85%] mt-0 md:mt-0" [class.mt-[86px]]="screenWidth() <= 768">
          @if (breadcrumbService.breadcrumbs().length > 0) {
            <nav class="flex w-full" aria-label="Breadcrumb">
              <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                @for (item of breadcrumbService.breadcrumbs(); track $index) {
                  <li [class]="$index === 0 ? 'inline-flex items-center' : ''">
                    @if ($index === 0) {
                      @if (!item.isActive) {
                        <a
                          [routerLink]="item.url"
                          class="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                          <svg class="w-3 h-3 me-2.5 text-gray-600 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                          </svg>
                          <span>{{ item.label }}</span>
                        </a>
                      } @else {
                        <span class="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                          <svg class="w-3 h-3 me-2.5 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                          </svg>
                          <span>{{ item.label }}</span>
                        </span>
                      }
                    } @else {
                      <div class="flex items-center">
                        <svg class="rtl:rotate-180 w-3 h-3 text-gray-400 dark:text-gray-500 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                        </svg>
                        @if (!item.isActive) {
                          <a
                            [routerLink]="item.url"
                            class="ms-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 md:ms-2 transition-colors duration-200">
                            <span>{{ item.label }}</span>
                          </a>
                        } @else {
                          <span
                            class="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ms-2"
                            aria-current="page">
                            <span>{{ item.label }}</span>
                          </span>
                        }
                      </div>
                    }
                  </li>
                }
              </ol>
            </nav>
          }
        </div>

        <!-- User Section -->
        <div class="flex items-center gap-2">
          <button
            id="dropdownAvatarNameButton"
            data-dropdown-toggle="dropdownAvatarName"
            class="flex items-center text-sm pe-1 font-medium text-gray-900 rounded-full hover:text-blue-600 dark:hover:text-blue-500 md:me-0 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-white"
            type="button"
          >
            <span class="sr-only">Open user menu</span>
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
            </div>
            <ul
              class="py-2 text-sm text-gray-700 dark:text-gray-200"
              aria-labelledby="dropdownAvatarNameButton"
            >
              <li>
                <a
                  [routerLink]="['profile']"
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
  readonly router = inject(Router);
  readonly userService = inject(UserService);
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);
  readonly breadcrumbService = inject(BreadcrumbService);


  collapsed = input<boolean>(false);
  screenWidth = input<number>(0);
  isScrolled = false;



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
