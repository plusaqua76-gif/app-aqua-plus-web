import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AnimationState = 'normal' | 'alert' | 'success';

@Component({
  selector: 'app-animated-payment-button',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      (click)="clicked.emit()"
      [disabled]="disabled()"
      class="relative flex items-center justify-center rounded-xl border px-4 py-3  text-sm font-medium backdrop-blur-md transition-all duration-300 overflow-hidden group bg-gradient-to-br border-blue-500/30 dark:text-white from-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/50 text-gray-900 to-blue-600/20 w-full disabled:opacity-50 disabled:cursor-not-allowed"
      [style.min-height]="(showAlert() || showSuccess()) ? '80px' : minHeight()"
    >
      @if (showAlert()) {
        <!-- Animación de alerta -->
        <div class="payment-alert-container" [class.active]="showAlert()">
          <div class="alert-left-side">
            <div class="alert-card">
              <div class="alert-card-line"></div>
              <div class="alert-buttons"></div>
            </div>
            <div class="alert-post">
              <div class="alert-post-line"></div>
              <div class="alert-screen">
                <div class="alert-icon">!</div>
              </div>
              <div class="alert-numbers"></div>
              <div class="alert-numbers-line2"></div>
            </div>
          </div>
          <div class="alert-right-side">
            <div class="alert-new">{{ alertMessage() }}</div>
            <svg
              class="alert-arrow"
              xmlns="http://www.w3.org/2000/svg"
              width="512"
              height="512"
              viewBox="0 0 451.846 451.847"
            >
              <path
                d="M345.441 248.292L151.154 442.573c-12.359 12.365-32.397 12.365-44.75 0-12.354-12.354-12.354-32.391 0-44.744L278.318 225.92 106.409 54.017c-12.354-12.359-12.354-32.394 0-44.748 12.354-12.359 32.391-12.359 44.75 0l194.287 194.284c6.177 6.18 9.262 14.271 9.262 22.366 0 8.099-3.091 16.196-9.267 22.373z"
                class="active-path"
                fill="#ffffff"
              ></path>
            </svg>
          </div>
        </div>
      } @else if (showSuccess()) {
        <!-- Animación de éxito -->
        <div class="payment-success-container" [class.active]="showSuccess()">
          <div class="success-left-side">
            <div class="success-card">
              <div class="success-card-line"></div>
              <div class="success-buttons"></div>
            </div>
            <div class="success-post">
              <div class="success-post-line"></div>
              <div class="success-screen">
                <div class="success-dollar">$</div>
              </div>
              <div class="success-numbers"></div>
              <div class="success-numbers-line2"></div>
            </div>
          </div>
          <div class="success-right-side">
            <!-- <div class="success-new">{{ successMessage() }}</div> -->
            <svg
              class="success-arrow"
              xmlns="http://www.w3.org/2000/svg"
              width="512"
              height="512"
              viewBox="0 0 451.846 451.847"
            >
              <path
                d="M345.441 248.292L151.154 442.573c-12.359 12.365-32.397 12.365-44.75 0-12.354-12.354-12.354-32.391 0-44.744L278.318 225.92 106.409 54.017c-12.354-12.359-12.354-32.394 0-44.748 12.354-12.359 32.391-12.359 44.75 0l194.287 194.284c6.177 6.18 9.262 14.271 9.262 22.366 0 8.099-3.091 16.196-9.267 22.373z"
                class="active-path"
                fill="#a1a1ff"
              ></path>
            </svg>
          </div>
        </div>
      } @else {
        <!-- Contenido normal del botón -->
        <ng-content></ng-content>
      }
    </button>
  `,
  styles: [`
    /* Animación de alerta para estado no permitido */
    .payment-alert-container {
      background-color: transparent;
      display: flex;
      width: 100%;
      height: 60px;
      position: relative;
      border-radius: 5px;
      transition: 0.3s ease-in-out;
      box-shadow: none;
    }

    .payment-alert-container.active {
      transform: scale(1.03);
    }

    .payment-alert-container.active .alert-left-side {
      width: 100%;
    }

    .alert-left-side {
      background: linear-gradient(135deg, #ff8c00, #ff4d4d);
      width: 70px;
      height: 60px;
      border-radius: 4px 0 0 4px;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: 0.3s;
      flex-shrink: 0;
      overflow: hidden;
    }

    .alert-right-side {
      width: calc(100% - 70px);
      display: flex;
      align-items: center;
      overflow: hidden;
      cursor: pointer;
      justify-content: space-between;
      white-space: nowrap;
      transition: 0.3s;
      padding: 0 12px;
    }

    .alert-right-side:hover {
      background-color: #ffecd1;
    }

    .alert-arrow {
      width: 14px;
      height: 14px;
      margin-left: 12px;
    }

    .alert-new {
      font-size: 15px;
      font-family: "Inter", sans-serif;
      color: #ff8c00;
      font-weight: 600;
    }

    .alert-card {
      width: 40px;
      height: 25px;
      background-color: #ffb366;
      border-radius: 4px;
      position: absolute;
      display: flex;
      z-index: 10;
      flex-direction: column;
      align-items: center;
      box-shadow: 5px 5px 5px -2px rgba(255, 77, 77, 0.4);
    }

    .alert-card-line {
      width: 35px;
      height: 6px;
      background-color: #ffcc99;
      border-radius: 1px;
      margin-top: 3px;
    }

    .alert-buttons {
      width: 4px;
      height: 4px;
      background-color: #cc4b00;
      box-shadow:
        0 -5px 0 0 #992d00,
        0 5px 0 0 #ff6a1a;
      border-radius: 50%;
      margin-top: 2px;
      transform: rotate(90deg);
      margin: 5px 0 0 -15px;
    }

    .payment-alert-container.active .alert-card {
      animation: slide-top-alert 0.9s cubic-bezier(0.68, -0.55, 0.265, 1.55) both;
    }

    .payment-alert-container.active .alert-post {
      animation: slide-post-alert 0.7s cubic-bezier(0.23, 1, 0.32, 1) both;
    }

    @keyframes slide-top-alert {
      0% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-35px) rotate(90deg);
      }
      60% {
        transform: translateY(-35px) rotate(90deg);
      }
      100% {
        transform: translateY(-5px) rotate(90deg);
      }
    }

    .alert-post {
      width: 35px;
      height: 40px;
      background-color: #f5f5f5;
      position: absolute;
      z-index: 11;
      bottom: 6px;
      top: 60px;
      border-radius: 4px;
      overflow: hidden;
    }

    .alert-post-line {
      width: 27px;
      height: 4px;
      background-color: #666;
      position: absolute;
      border-radius: 0 0 2px 2px;
      right: 4px;
      top: 4px;
    }

    .alert-post-line:before {
      content: "";
      position: absolute;
      width: 27px;
      height: 4px;
      background-color: #888;
      top: -4px;
    }

    .alert-screen {
      width: 27px;
      height: 12px;
      background-color: #ffffff;
      position: absolute;
      top: 11px;
      right: 4px;
      border-radius: 2px;
    }

    .alert-numbers {
      width: 6px;
      height: 6px;
      background-color: #999;
      box-shadow:
        0 -9px 0 0 #999,
        0 9px 0 0 #999;
      border-radius: 1px;
      position: absolute;
      transform: rotate(90deg);
      left: 14px;
      top: 27px;
    }

    .alert-numbers-line2 {
      width: 6px;
      height: 6px;
      background-color: #bbb;
      box-shadow:
        0 -9px 0 0 #bbb,
        0 9px 0 0 #bbb;
      border-radius: 1px;
      position: absolute;
      transform: rotate(90deg);
      left: 14px;
      top: 36px;
    }

    @keyframes slide-post-alert {
      50% {
        transform: translateY(0);
      }
      100% {
        transform: translateY(-35px);
      }
    }

    .alert-icon {
      position: absolute;
      font-size: 9px;
      font-family: "Inter", sans-serif;
      width: 100%;
      left: 0;
      top: 1px;
      color: #d32f2f;
      text-align: center;
      font-weight: bold;
    }

    .payment-alert-container.active .alert-icon {
      animation: fade-in-fwd 0.3s 0.7s backwards;
    }

    /* Animación de transacción exitosa */
    .payment-success-container {
      background-color: transparent;
      display: flex;
      width: 100%;
      height: 80px;
      position: relative;
      border-radius: 6px;
      transition: 0.3s ease-in-out;
    }

    .payment-success-container.active {
      transform: scale(1.03);
    }

    .payment-success-container.active .success-left-side {
      width: 100%;
    }

    .success-left-side {
      background-color: #3b82f6;
      width: 90px;
      height: 80px;
      border-radius: 4px;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      transition: 0.3s;
      flex-shrink: 0;
      overflow: hidden;
    }

    .success-right-side {
      width: calc(100% - 90px);
      display: flex;
      align-items: center;
      overflow: hidden;
      cursor: pointer;
      justify-content: space-between;
      white-space: nowrap;
      transition: 0.3s;
      padding: 0 15px;
      background-color: transparent;
    }

    .success-right-side:hover {
      background-color: rgba(42, 42, 61, 0.3);
    }

    .success-arrow {
      width: 16px;
      height: 16px;
    }

    .success-new {
      font-size: 14px;
      font-family: "Inter", sans-serif;
      color: #93c5fd;
      font-weight: 600;
    }

    .success-card {
      width: 50px;
      height: 32px;
      background-color: #93c5fd;
      border-radius: 6px;
      position: absolute;
      display: flex;
      z-index: 10;
      flex-direction: column;
      align-items: center;
      box-shadow: 7px 7px 7px -2px rgba(59, 130, 246, 0.5);
    }

    .success-card-line {
      width: 46px;
      height: 9px;
      background-color: #60a5fa;
      border-radius: 2px;
      margin-top: 5px;
    }

    .success-buttons {
      width: 6px;
      height: 6px;
      background-color: #1e40af;
      box-shadow:
        0 -7px 0 0 #1e3a8a,
        0 7px 0 0 #3b82f6;
      border-radius: 50%;
      margin-top: 4px;
      transform: rotate(90deg);
      margin: 7px 0 0 -21px;
    }

    .payment-success-container.active .success-card {
      animation: slide-top-success 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) both;
    }

    .payment-success-container.active .success-post {
      animation: slide-post-success 1s cubic-bezier(0.165, 0.84, 0.44, 1) both;
    }

    @keyframes slide-top-success {
      0% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-50px) rotate(90deg);
      }
      60% {
        transform: translateY(-50px) rotate(90deg);
      }
      100% {
        transform: translateY(-6px) rotate(90deg);
      }
    }

    .success-post {
      width: 45px;
      height: 52px;
      background-color: #4b5563;
      position: absolute;
      z-index: 11;
      bottom: 8px;
      top: 80px;
      border-radius: 6px;
      overflow: hidden;
    }

    .success-post-line {
      width: 34px;
      height: 6px;
      background-color: #1f2937;
      position: absolute;
      border-radius: 0px 0px 3px 3px;
      right: 6px;
      top: 6px;
    }

    .success-post-line:before {
      content: "";
      position: absolute;
      width: 34px;
      height: 6px;
      background-color: #374151;
      top: -6px;
    }

    .success-screen {
      width: 34px;
      height: 16px;
      background-color: #e5e7eb;
      position: absolute;
      top: 16px;
      right: 6px;
      border-radius: 3px;
    }

    .success-numbers {
      width: 8px;
      height: 8px;
      background-color: #6b7280;
      box-shadow:
        0 -12px 0 0 #6b7280,
        0 12px 0 0 #6b7280;
      border-radius: 2px;
      position: absolute;
      transform: rotate(90deg);
      left: 18px;
      top: 36px;
    }

    .success-numbers-line2 {
      width: 8px;
      height: 8px;
      background-color: #9ca3af;
      box-shadow:
        0 -12px 0 0 #9ca3af,
        0 12px 0 0 #9ca3af;
      border-radius: 2px;
      position: absolute;
      transform: rotate(90deg);
      left: 18px;
      top: 47px;
    }

    @keyframes slide-post-success {
      50% {
        transform: translateY(0);
      }
      100% {
        transform: translateY(-50px);
      }
    }

    .success-dollar {
      position: absolute;
      font-size: 12px;
      font-family: "Inter", sans-serif;
      width: 100%;
      left: 0;
      top: 2px;
      color: #3b82f6;
      text-align: center;
      font-weight: bold;
    }

    .payment-success-container.active .success-dollar {
      animation: fade-in-fwd 0.3s 1s backwards;
    }

    @keyframes fade-in-fwd {
      0% {
        opacity: 0;
        transform: translateY(-5px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class AnimatedPaymentButton {
  clicked = output<void>();
  disabled = input<boolean>(false);
  showAlert = input<boolean>(false);
  showSuccess = input<boolean>(false);
  alertMessage = input<string>('Alerta');
  successMessage = input<string>('Procesando Pago');
  minHeight = input<string>('auto');
}
