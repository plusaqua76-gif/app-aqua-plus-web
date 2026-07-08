import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';

/**
 * Barra de progreso superior que reacciona a la navegación del Router.
 * Da feedback inmediato mientras Angular resuelve/descarga la ruta destino,
 * mejorando la percepción de velocidad al cambiar de sección.
 */
@Component({
  selector: 'app-nav-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="nav-progress"
      [class.nav-progress--visible]="visible()"
      [style.width.%]="progress()"
      role="progressbar"
      aria-hidden="true"
    ></div>
  `,
  styles: [
    `
      .nav-progress {
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        width: 0;
        z-index: 9999;
        background: linear-gradient(90deg, #2563eb, #60a5fa);
        box-shadow: 0 0 10px rgba(37, 99, 235, 0.7), 0 0 5px rgba(37, 99, 235, 0.5);
        opacity: 0;
        transition: width 200ms ease-out, opacity 300ms ease-out;
        pointer-events: none;
      }
      .nav-progress--visible {
        opacity: 1;
      }
    `,
  ],
})
export class NavProgress {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  protected readonly progress = signal(0);
  protected readonly visible = signal(false);

  private trickleId: ReturnType<typeof setInterval> | null = null;
  private hideId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.start();
        } else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          this.complete();
        }
      });

    this.destroyRef.onDestroy(() => this.clearTimers());
  }

  private start(): void {
    this.clearTimers();
    this.visible.set(true);
    this.progress.set(10);

    this.trickleId = setInterval(() => {
      const current = this.progress();
      if (current >= 90) {
        return;
      }
      const step = current < 50 ? 8 : current < 75 ? 4 : 1.5;
      this.progress.set(Math.min(90, current + step));
    }, 300);
  }

  private complete(): void {
    if (this.trickleId) {
      clearInterval(this.trickleId);
      this.trickleId = null;
    }
    this.progress.set(100);

    this.hideId = setTimeout(() => {
      this.visible.set(false);
      setTimeout(() => this.progress.set(0), 300);
    }, 200);
  }

  private clearTimers(): void {
    if (this.trickleId) {
      clearInterval(this.trickleId);
      this.trickleId = null;
    }
    if (this.hideId) {
      clearTimeout(this.hideId);
      this.hideId = null;
    }
  }
}
