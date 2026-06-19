import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IUserBill } from '@interfaces/IuserBill';

@Component({
  selector: 'app-bill-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-cards">
      <div class="a tl"></div>
      <div class="a t"></div>
      <div class="a tr"></div>
      <div class="a l"></div>
      <div class="a c"></div>
      <div class="a r"></div>
      <div class="a bl"></div>
      <div class="a b"></div>
      <div class="a br"></div>

      <div class="card">

        <!-- Logo AQUA+ -->
        <div class="icon-brand">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="48" width="48" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 6c0 0-5 4.5-5 7.5a5 5 0 0010 0C17 10.5 12 6 12 6z"/>
          </svg>
        </div>

        <!-- Estado / tipo de pago -->
        <div class="role-bill">
          <span class="status-badge" [class]="statusClass()">{{ bill().estadoNombre }}</span>
          <span class="payment-type">{{ bill().tipoPagoNombre }}</span>
        </div>

        <!-- Fechas -->
        <div class="info-event">
          <div class="info">
            <p class="title">EMISIÓN</p>
            <p class="subtitle">{{ bill().fechaEmision | date:'dd MMM yy' : '' : 'es' }}</p>
          </div>
          <div class="info">
            <p class="title">VENCE</p>
            <p class="subtitle">{{ bill().fechaFin | date:'dd MMM yy' : '' : 'es' }}</p>
          </div>
        </div>

        <div class="separator-line"></div>

        <!-- Nombre del cliente -->
        <div class="info-user">
          <p class="alias">{{ bill().codigo }}</p>
          <p class="name">{{ fullName() }}</p>
        </div>

        <!-- Consumo / precio -->
        <div class="flex">
          <div class="flex-col">
            <div class="info-position">
              <p class="label">CONSUMO</p>
              <p class="value">{{ bill().consumo !== null ? (bill().consumo + ' m³') : 'N/D' }}</p>
            </div>
            <div class="info-position">
              <p class="label">PRECIO</p>
              <p class="value">{{ bill().precio | currency:'COP':'symbol-narrow':'1.0-0':'es' }}</p>
            </div>
          </div>
          <div class="info-position" style="padding: 0.25rem 0.5rem; align-self: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="1" opacity="0.35">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
        </div>

        <div class="light-shadow"></div>
      </div>
    </div>
  `,
  styles: [`
    .container-cards {
      position: relative;
      perspective: 1500px;
    }

    .container-cards:hover .card::before {
      opacity: 0;
      animation-play-state: paused;
    }

    .card .light-shadow {
      position: absolute;
      inset: 0;
      transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      pointer-events: none;
    }

    .a {
      position: absolute;
      width: 115px;
      height: 130px;
      z-index: 19;
    }

    .tl { top: -10px; left: -30px; }
    .tl:hover ~ .card {
      transform: rotateX(-20deg) rotateY(20deg);
    }
    .tl:hover ~ .card .light-shadow {
      box-shadow: inset 32px 32px 120px 5px rgba(255,255,255,0.5), inset -32px -32px 120px 5px rgba(0,0,0,0.5);
    }

    .t { top: -10px; left: 85px; }
    .t:hover ~ .card { transform: rotateX(-20deg); }
    .t:hover ~ .card .light-shadow {
      box-shadow: inset 0 32px 120px rgba(255,255,255,0.5), inset 0 -32px 120px rgba(0,0,0,0.5);
    }

    .tr { top: -10px; left: 200px; }
    .tr:hover ~ .card { transform: rotateX(-20deg) rotateY(-20deg); }
    .tr:hover ~ .card .light-shadow {
      box-shadow: inset -32px 32px 120px 5px rgba(255,255,255,0.5), inset 32px -32px 120px 5px rgba(0,0,0,0.5);
    }

    .l { top: 120px; left: -30px; }
    .l:hover ~ .card { transform: rotateY(20deg); }
    .l:hover ~ .card .light-shadow {
      box-shadow: inset 32px 0 120px rgba(255,255,255,0.5), inset -32px 0 120px rgba(0,0,0,0.25);
    }

    .c { top: 120px; left: 85px; }
    .c:hover ~ .card { transform: scale(1.05); }
    .c:hover ~ .card .light-shadow {
      box-shadow: inset 0 0 120px rgba(255,255,255,0.5), inset 0 0 120px rgba(0,0,0,0.25);
    }

    .r { top: 120px; left: 200px; }
    .r:hover ~ .card { transform: rotateY(-20deg); }
    .r:hover ~ .card .light-shadow {
      box-shadow: inset -32px 0 120px rgba(255,255,255,0.5), inset 32px 0 120px rgba(0,0,0,0.25);
    }

    .bl { top: 250px; left: -30px; }
    .bl:hover ~ .card { transform: rotateX(20deg) rotateY(20deg); }
    .bl:hover ~ .card .light-shadow {
      box-shadow: inset -32px 0 120px 5px rgba(255,255,255,1);
    }

    .b { top: 250px; left: 85px; }
    .b:hover ~ .card { transform: rotateX(20deg); }
    .b:hover ~ .card .light-shadow {
      box-shadow: inset 0 0 120px 5px rgba(255,255,255,1);
    }

    .br { top: 250px; left: 200px; }
    .br:hover ~ .card { transform: rotateX(20deg) rotateY(-20deg); }
    .br:hover ~ .card .light-shadow {
      box-shadow: inset 32px 0 120px 5px rgba(255,255,255,1);
    }

    .card {
      position: relative;
      height: 380px;
      width: 280px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 1rem;
      color: #3e3e3e;
      background-color: #ffffff;
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
      border-radius: 1rem;
      transform: scale(0.9);
      transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.25);
      overflow: hidden;
      z-index: 10;
    }

    .card:hover { transform: scale(1); }

    .card::before, .card::after {
      content: "";
      position: absolute;
      z-index: -1;
      transition: all 0.5s ease;
    }

    .card::before {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100px;
      height: 400px;
      background-color: #0ea5e9;
      filter: blur(50px);
      animation: animation-card-shadow 10s linear infinite;
      opacity: 0.25;
    }

    .card::after {
      inset: 1.5px;
      background-color: rgba(240, 249, 255, 0.95);
      border-radius: 1rem;
    }

    .icon-brand {
      padding: 0.5rem 0.75rem;
      color: #0ea5e9;
    }

    .role-bill {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 0.5rem;
      font-size: 11px;
      font-weight: 600;
      gap: 0.5rem;
    }

    .status-badge {
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .status-pendiente {
      background: rgba(245, 158, 11, 0.15);
      color: #b45309;
      border: 1px solid rgba(245, 158, 11, 0.4);
    }

    .status-pagada {
      background: rgba(34, 197, 94, 0.15);
      color: #15803d;
      border: 1px solid rgba(34, 197, 94, 0.4);
    }

    .status-vencida {
      background: rgba(239, 68, 68, 0.15);
      color: #b91c1c;
      border: 1px solid rgba(239, 68, 68, 0.4);
    }

    .status-default {
      background: rgba(107, 114, 128, 0.15);
      color: #374151;
      border: 1px solid rgba(107, 114, 128, 0.4);
    }

    .payment-type {
      color: #6b7280;
      font-size: 10px;
    }

    .info-event {
      display: flex;
      padding: 0.5rem;
    }

    .info-event .info {
      width: 100%;
      font-size: 8px;
    }

    .info-event .info .title {
      color: #9ca3af;
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .info-event .info .subtitle {
      font-size: 10px;
      font-weight: 600;
      color: #1f2937;
      text-transform: uppercase;
    }

    .separator-line {
      width: 100%;
      border-top: 2px dashed #bfdbfe;
      margin: 0.5rem 0;
    }

    .info-user {
      display: flex;
      flex-direction: column;
      padding: 0.5rem;
    }

    .info-user .alias {
      font-size: 9px;
      color: #6b7280;
      font-family: monospace;
      letter-spacing: 0.05em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .info-user .name {
      font-size: 16px;
      font-weight: 700;
      color: #1e3a5f;
    }

    .flex {
      display: flex;
      width: 100%;
      align-items: flex-end;
    }

    .flex-col {
      display: flex;
      width: 100%;
      flex-direction: column;
      font-size: 8px;
    }

    .info-position {
      padding: 0.2rem 0;
    }

    .info-position .label {
      color: #9ca3af;
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .info-position .value {
      font-size: 12px;
      font-weight: 600;
      color: #1f2937;
    }

    @keyframes animation-card-shadow {
      to { transform: translate(-50%, -50%) rotate(360deg); }
    }
  `]
})
export class BillCard {
  bill = input.required<IUserBill>();

  fullName = computed(() => {
    const b = this.bill();
    return `${b.nombre} ${b.apellido}`.trim();
  });

  statusClass = computed(() => {
    const estado = this.bill().estadoNombre?.toLowerCase() ?? '';
    if (estado.includes('pendiente')) return 'status-badge status-pendiente';
    if (estado.includes('pagad')) return 'status-badge status-pagada';
    if (estado.includes('vencid')) return 'status-badge status-vencida';
    return 'status-badge status-default';
  });
}
