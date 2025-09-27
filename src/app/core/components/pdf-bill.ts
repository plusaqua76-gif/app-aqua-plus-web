import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LegendsHistoryBill } from './charts/legens-bill-history';
import { rxResource } from '@angular/core/rxjs-interop';
import { EnterpriseIdService } from '@services/enterpriceId.service';

@Component({
  selector: 'app-pdf-bill',
  standalone: true,
  imports: [CommonModule, RouterModule, LegendsHistoryBill],
  styles: [
    `
      .pdf-container {
        width: 100%;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 20px;
      }

      .bill-content {
        width: 894px; /* Ancho A4 en píxeles */
        min-height: 1123px; /* Alto A4 en píxeles */
        background-image: url('/images/background/backgroundBillDef.svg');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        padding: 40px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        background-color: white;
        position: relative;
      }

      .bill-header {
        margin-bottom: 30px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #2388ff;
        border-radius: 20px;
        padding: 20px 30px;
        color: white;
        position: relative;
        overflow: visible;
        z-index: 1;
      }

      .bill-header::before {
        content: '';
        position: absolute;
        top: -70%;
        right: 10%;
        width: 200px;
        height: 200px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
      }

      .bill-header::after {
        content: '';
        position: absolute;
        bottom: -30%;
        left: 60%;
        width: 150px;
        height: 150px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 50%;
      }

      .header-right::before {
        content: '';
        position: absolute;
        bottom: -60%;
        right: 75%;
        width: 200px;
        height: 200px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 50%;
      }

      .logo-container {
        width: 145px;
        height: 145px;
        background: white;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: #333;
        font-size: 12px;
        position: absolute;
        left: 30px;
        top: 55px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        z-index: 999;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 20px;
        z-index: 2;
        position: relative;
        margin-left: 120px;
      }

      .company-info {
        padding-left: 50px;
      }

      .company-info h1 {
        font-size: 32px;
        font-weight: bold;
        margin: 0 0 5px 0;
      }

      .company-details {
        font-size: 14px;
        opacity: 0.9;
      }

      .company-details div {
        margin: 2px 0;
      }

      .header-center {
        text-align: center;
        z-index: 2;
      }

      .address-info {
        font-size: 14px;
        opacity: 0.9;
      }

      .header-right {
        z-index: 2;
      }

      .invoice-number {
        background: white;
        color: #4a90e2;
        padding: 15px 25px;
        border-radius: 25px;
        font-weight: bold;
        font-size: 16px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      .bill-body {
        min-height: 800px;
        padding: 60px 0;
      }

      /* Grid principal con información */
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: auto auto;
        gap: 15px;
        margin-bottom: 20px;
      }

      /* Fila específica para mapa y punto de pago */
      .map-payment-row {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: 60% 40%;
        gap: 20px;
        margin: 15px 0;
      }

      .info-card {
        background: white;
        border-radius: 15px;
        padding: 15px;
        box-shadow: 0 0.5px 10px rgba(0, 0, 0, 0.1);
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-weight: 600;
        color: #333;
        font-size: 14px;
      }

      .card-header i {
        width: 20px;
        height: 20px;
        background: #2388ff;
        border-radius: 50%;
      }

      .badge {
        background: #2388ff;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        margin-left: auto;
      }

      .card-content {
        font-size: 12px;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        margin: 6px 0;
        align-items: flex-start;
      }

      .info-item .label {
        font-weight: 500;
        color: #666;
        min-width: 100px;
      }

      .info-item .value {
        text-align: right;
        color: #333;
        flex: 1;
      }

      .price-highlight {
        background: #2388ff;
        color: white;
        padding: 8px 12px;
        border-radius: 15px;
        text-align: center;
        font-weight: bold;
        margin-top: 10px;
        font-size: 12px;
      }

      /* Área del mapa - dentro de la fila específica */
      .map-section {
        border-radius: 15px;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .map-content {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Punto de pago - dentro de la fila específica */
      .payment-point-card {
        background: white;
        border-radius: 15px;
        padding: 15px;
        box-shadow: 0 0.5px 10px rgba(0, 0, 0, 0.1);
        height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .payment-methods {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 10px;
        flex: 1;
        align-items: center;
        justify-items: center;
      }

      .payment-method {
        width: 100%;
        height: 100%;
        background: white;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        overflow: hidden;
      }

      .payment-logo {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 4px;
      }

      /* Grid de servicios */
      .services-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        margin: 20px 0;
      }

      .service-category {
        border-radius: 10px;
        padding: 15px;
        border: 1px solid #e0e0e0;
      }

      .service-category.acueducto {
        background: white;
        border-color: #dee4ee;
      }

      .service-category.aseo {
        background: white;
        border-color: #dee4ee;
      }

      .service-category.alcantarillado {
        background: white;
        border-color: #dee4ee;
      }

      .service-category.otros {
        background: white;
        border-color: #dee4ee;
      }

      .service-category h3 {
        margin: 0 0 15px 0;
        text-align: center;
        font-size: 14px;
        font-weight: bold;
        color: white;
        padding: 8px;
        border-radius: 8px;
      }

      .service-category.acueducto h3 {
        background: #74b9ff;
      }

      .service-category.aseo h3 {
        background: #fac6d0;
      }

      .service-category.alcantarillado h3 {
        background: #fdcb6e;
      }

      .service-category.otros h3 {
        background: #5d6481;
      }

      .service-items {
        font-size: 11px;
      }

      .service-item {
        display: flex;
        justify-content: space-between;
        margin: 4px 0;
        padding: 2px 0;
      }

      .service-item span:first-child {
        flex: 1;
        color: #555;
      }

      .service-item span:last-child {
        font-weight: bold;
        color: #555;
      }

      /* Sección inferior */
      .bottom-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-top: 20px;
      }

      .consumption-summary,
      .payment-summary {
        background: white;
        border-radius: 15px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border: 1px solid #e0e0e0;
      }

      .consumption-summary {
        background: #e8f4fd;
        border-color: #2388ff;
      }

      .payment-summary {
        background: #f0f8ff;
        border-color: #4a90e2;
      }

      .summary-content {
        margin-top: 15px;
        font-size: 12px;
      }

      .due-date {
        margin-top: 15px;
        font-weight: bold;
        color: #333;
        text-align: center;
        padding: 8px;
        background: rgba(255, 255, 255, 0.7);
        border-radius: 8px;
      }

      .novedad-text {
        color: #888;
        font-size: 14px;
        margin: 10px 0 20px 0;
      }

      .payment-totals-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        margin-bottom: 0;
      }

      .total-card {
        border-radius: 10px 10px 0 0;
        padding: 30px 10px 15px 10px;
        text-align: center;
        box-shadow: none;
        background: white;
        color: black;
      }

      .total-card.acueducto-card {
        padding: 25px 0px 0px 0px;
        margin-top: 30px;
      }

      .total-card.aseo-card {
        padding: 25px 0px 0px 0px;
        margin-top: 30px;
      }

      .total-card.alcantarillado-card {
        padding: 25px 0px 0px 0px;
        margin-top: 30px;
      }

      .total-card.otros-card {
        padding: 25px 0px 0px 0px;
        margin-top: 30px;
      }

      .total-card.acueducto-card::before {
        content: 'Acueducto';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 25px;
        background: #74b9ff;
        border-radius: 10px 10px 0 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 500;
        color: white;
      }

      .total-card.acueducto-card::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 8px;
        background: #74b9ff;
      }

      .total-card.aseo-card::before {
        content: 'Aseo';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 25px;
        background: #fac6d0;
        border-radius: 10px 10px 0 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 500;
        color: white;
      }

      .total-card.aseo-card::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 8px;
        background: #fac6d0;
      }

      .total-card.alcantarillado-card::before {
        content: 'Alcantarillado';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 25px;
        background: #fdcb6e;
        border-radius: 10px 10px 0 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 500;
        color: white;
      }

      .total-card.alcantarillado-card::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 8px;
        background: #fdcb6e;
      }

      .total-card.otros-card::before {
        content: 'Otros';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 25px;
        background: #5d6481;
        border-radius: 10px 10px 0 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 500;
        color: white;
      }

      .total-card.otros-card::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 8px;
        background: #5d6481;
      }

      .total-card {
        position: relative;
      }

      .card-title {
        display: none;
      }

      .card-amount {
        font-size: 16px;
        font-weight: bold;
        color: black;
        padding: 0;
        margin: 0;
      }

      .total-card.acueducto-card .card-amount {
        border-left: 1px solid #74b9ff;
        border-right: 1px solid #74b9ff;
        padding: 8px 0;
      }

      .total-card.aseo-card .card-amount {
        border-left: 1px solid #fac6d0;
        border-right: 1px solid #fac6d0;
        padding: 8px 0;
      }

      .total-card.alcantarillado-card .card-amount {
        border-left: 1px solid #fdcb6e;
        border-right: 1px solid #fdcb6e;
        padding: 8px 0;
      }

      .total-card.otros-card .card-amount {
        border-left: 1px solid #5d6481;
        border-right: 1px solid #5d6481;
        padding: 8px 0;
      }

      .final-total-card {
        background: #adecbb;
        color: #2e7d32;
        padding: 15px 20px;
        border-radius: 0 0 15px 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
      }

      .total-label {
        font-size: 16px;
        color: #19213d;
      }

      .total-amount {
        font-size: 20px;
        color: #1976d2;
        font-weight: bold;
      }

      /* Estilos para el letrero de suspensión */
      .suspension-notice {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 1000;
        overflow: hidden;
      }

      .suspension-banner {
        position: absolute;
        top: 40%;
        left: -20%;
        width: 140%;
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 80px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 6px;
        transform: rotate(-35deg);
        color: rgba(0, 0, 0, 0.6);
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      }

      .suspension-banner-text {
        position: relative;
        z-index: 1;
      }

      /* Responsive */
      @media (max-width: 850px) {
        .info-grid {
          grid-template-columns: 1fr;
        }

        .map-payment-row {
          grid-template-columns: 1fr;
        }

        .services-grid {
          grid-template-columns: 1fr 1fr;
        }

        .bottom-section {
          grid-template-columns: 1fr;
        }

        .payment-methods {
          flex-direction: row;
          gap: 10px;
        }

        .payment-method {
          height: 50px;
        }

        .payment-totals-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
      }

      @media (max-width: 600px) {
        .services-grid {
          grid-template-columns: 1fr;
        }

        .payment-methods {
          flex-wrap: wrap;
        }

        .payment-totals-grid {
          grid-template-columns: 1fr;
        }

        .final-total-card {
          flex-direction: column;
          text-align: center;
          gap: 8px;
        }
      }

      @media print {
        .pdf-container {
          padding: 0;
          background-color: white;
        }

        .bill-content {
          box-shadow: none;
          border-radius: 0;
          width: 100%;
          min-height: auto;
        }
      }

      @media (max-width: 850px) {
        .bill-content {
          width: 100%;
          max-width: 794px;
        }
      }
    `,
  ],
  template: `
    <div class="pdf-container">
      <div class="bill-content">
        <!-- Letrero de estado dinámico -->
        @if (selectedStatus()) {
        <div class="suspension-notice">
          <div class="suspension-banner">
            <span class="suspension-banner-text">{{ selectedStatus() }}</span>
          </div>
        </div>
        }
        <div class="bill-header">
          <div class="logo-container">
            @if (enterpriseInfo.value()?.imagen?.[0]?.imagen) {
            <img
              class="logo-image object-contain w-32 h-32 rounded-[20px]"
              [src]="'data:' + (enterpriseInfo.value()?.imagen?.[0]?.contentType || 'image/png') + ';base64,' + enterpriseInfo.value()?.imagen?.[0]?.imagen"
              [alt]="enterpriseInfo.value()?.nombre || 'Logo empresa'"
            />
            } @else {
            <h1>la imagen no se cargo pez</h1>
            }
          </div>
          <div class="header-left">
            <div class="company-info">
              <h1>Aqua Plus</h1>
              <div class="company-details">
                <div><strong>NIT:</strong> 15734685</div>
                <div><strong>Tel:</strong> (684) 879 - 0102</div>
              </div>
            </div>
          </div>

          <div class="header-center">
            <div class="address-info">
              <div>Saladoblanco/Huila C 12</div>
              <div># 23 - 45 A barrio Centro</div>
            </div>
          </div>

          <div class="header-right">
            <div class="invoice-number">N°: 000027</div>
          </div>
        </div>

        <div class="bill-body">
          <!-- Grid principal con información de la factura -->
          <div class="info-grid">
            <!-- Fila superior -->
            <div class="info-card client-card">
              <div class="card-header">
                <div
                  class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <svg class="h-3 w-3" fill="white" viewBox="0 0 24 24">
                    <path
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <span>Cliente</span>
                <span class="badge">Estrato 3</span>
              </div>
              <div class="card-content">
                <div class="info-item">
                  <span class="label">Nombre:</span>
                  <span class="value">Juanito Chavarro</span>
                </div>
                <div class="info-item">
                  <span class="label">Número de documento:</span>
                  <span class="value">123456789074</span>
                </div>
                <div class="info-item">
                  <span class="label">Código Cliente:</span>
                  <span class="value">4500T</span>
                </div>
                <div class="info-item">
                  <span class="label">Dirección:</span>
                  <span class="value"
                    >Huila, Pitalito, Monte Carlos Carrera 43 # 55</span
                  >
                </div>
              </div>
            </div>

            <div class="info-card counter-card">
              <div class="card-header">
                <div
                  class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <svg class="h-3 w-3" fill="white" viewBox="0 0 24 24">
                    <path
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <span>Contador</span>
              </div>
              <div class="card-content">
                <div class="info-item">
                  <span class="label">Tipo:</span>
                  <span class="value">Análogo</span>
                </div>
                <div class="info-item">
                  <span class="label">Serial:</span>
                  <span class="value">239769574</span>
                </div>
                <div class="info-item">
                  <span class="label">Dirección:</span>
                  <span class="value"
                    >Huila, Pitalito, Monte Carlos Carrera 43 # 55</span
                  >
                </div>
              </div>
            </div>

            <div class="info-card consumption-card">
              <div class="card-header">
                <div
                  class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <svg class="h-3 w-3" fill="white" viewBox="0 0 24 24">
                    <path
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <span>Detalle de consumo</span>
              </div>
              <div class="card-content">
                <div class="info-item">
                  <span class="label">Lectura:</span>
                  <span class="value">25 m³</span>
                </div>
                <div class="info-item">
                  <span class="label">Fecha Lectura:</span>
                  <span class="value">30/06/2029</span>
                </div>
                <div class="info-item">
                  <span class="label">Consumo total:</span>
                  <span class="value">20 m³</span>
                </div>
                <div class="price-highlight">Precio: $30,000 COP</div>
              </div>
            </div>
          </div>
          <div class="map-payment-row">
            <!-- Área central con mapa -->
            <div class="map-section">
              <div class="map-content">
                <app-legends-bill-history></app-legends-bill-history>
              </div>
            </div>

            <!-- Punto de pago -->
            <div class="payment-point-card">
              <div class="card-header">
                <div
                  class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <svg class="h-3 w-3" fill="white" viewBox="0 0 24 24">
                    <path
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <span>Punto de pago</span>
              </div>
              <div class="payment-methods">
                <div class="payment-method">
                  <img
                    src="/images/image1.png"
                    alt="Imagen 1"
                    class="payment-logo"
                  />
                </div>
                <div class="payment-method">
                  <img
                    src="/images/image2.png"
                    alt="Imagen 2"
                    class="payment-logo"
                  />
                </div>
                <div class="payment-method">
                  <img
                    src="/images/image3.png"
                    alt="Imagen 3"
                    class="payment-logo"
                  />
                </div>
                <div class="payment-method">
                  <img
                    src="/images/image7.png"
                    alt="Imagen 7"
                    class="payment-logo"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Grid de servicios -->
          <div class="services-grid">
            <div class="service-category acueducto">
              <h3>Acueducto</h3>
              <div class="service-items">
                <div class="service-item">
                  <span>Concepto del servicio</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Cargo Fijo</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Contribución</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Cargo variable complementario</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Subsidio de consumo</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Intereses</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Servicios especiales</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Subsidio</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Cargo Fijo</span>
                  <span>$1000</span>
                </div>
              </div>
            </div>

            <div class="service-category aseo">
              <h3>Aseo</h3>
              <div class="service-items">
                <div class="service-item">
                  <span>Concepto del servicio</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Cargo Fijo</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Contribución</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Cargo variable complementario</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Subsidio de consumo</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Intereses</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Servicios especiales</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Subsidio</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Cargo Fijo</span>
                  <span>$1000</span>
                </div>
              </div>
            </div>

            <div class="service-category alcantarillado">
              <h3>Alcantarillado</h3>
              <div class="service-items">
                <div class="service-item">
                  <span>Concepto del servicio</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Cargo Fijo</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Contribución</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Cargo variable complementario</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Subsidio de consumo</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Intereses</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Servicios especiales</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Subsidio</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Cargo Fijo</span>
                  <span>$1000</span>
                </div>
              </div>
            </div>

            <div class="service-category otros">
              <h3>Otros</h3>
              <div class="service-items">
                <div class="service-item">
                  <span>Concepto del servicio</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Cargo Fijo</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Contribución</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Cargo variable complementario</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Subsidio de consumo</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Intereses</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Servicios especiales</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Subsidio</span>
                  <span>$1000</span>
                </div>
                <div class="service-item">
                  <span>Cargo Fijo</span>
                  <span>$1000</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección inferior con resumen -->
          <div class="bottom-section">
            <div class="consumption-summary">
              <div class="card-header">
                <div
                  class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <svg class="h-3 w-3" fill="white" viewBox="0 0 24 24">
                    <path
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <span>Factura Consumo</span>
              </div>
              <div class="summary-content">
                <div class="info-item">
                  <span class="label">Tipo:</span>
                  <span class="value">Análogo</span>
                </div>
                <div class="info-item">
                  <span class="label">Serial:</span>
                  <span class="value">239769574</span>
                </div>
                <div class="info-item">
                  <span class="label">Dirección:</span>
                  <span class="value"
                    >Huila, Pitalito, Monte Carlos Carrera 43 # 55</span
                  >
                </div>
                <div class="due-date">Fecha límite de pago:</div>
              </div>
            </div>

            <div class="payment-summary">
              <div class="card-header">
                <div
                  class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <svg class="h-3 w-3" fill="white" viewBox="0 0 24 24">
                    <path
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span>Información de pago</span>
              </div>
              <div class="novedad-text">Novedad asignada</div>
              <div class="payment-totals-grid">
                <div class="total-card acueducto-card">
                  <div class="card-title">Acueducto</div>
                  <div class="card-amount">$ 1,454</div>
                </div>
                <div class="total-card aseo-card">
                  <div class="card-title">Aseo</div>
                  <div class="card-amount">$ 4,454</div>
                </div>
                <div class="total-card alcantarillado-card">
                  <div class="card-title">Alcantarillado</div>
                  <div class="card-amount">$ 2,454</div>
                </div>
                <div class="total-card otros-card">
                  <div class="card-title">Otros</div>
                  <div class="card-amount">$ 876</div>
                </div>
              </div>
              <div class="final-total-card">
                <span class="total-label">Total a pagar:</span>
                <span class="total-amount">$ 20,548.50</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PdfBill {
  showSuspensionNotice = true;

  // Input signal para recibir el estado seleccionado
  selectedStatus = input<string | null>(null);

  private readonly enterpriseIdService = inject(EnterpriseIdService);

  enterpriseInfo = rxResource({
    stream: () => this.enterpriseIdService.getEnterpriseInfo(),
  });
}
