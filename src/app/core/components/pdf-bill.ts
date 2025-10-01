import { Component, effect, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LegendsHistoryBill } from './charts/legens-bill-history';
import { rxResource } from '@angular/core/rxjs-interop';
import { EnterpriseIdService } from '@services/enterpriceId.service';
import { IBillDetailResponse } from '@interfaces/Ibill-detail';
import { ColombianCurrencyPipe } from '@shared/index';
import { DeudaService } from '../../modules/bill/service/deuda.service';

@Component({
  selector: 'app-pdf-bill',
  standalone: true,
  imports: [CommonModule, RouterModule, LegendsHistoryBill, ColombianCurrencyPipe],
  styles: [
    `
      .pdf-container {
        width: 100%;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center; /* Centrado vertical siempre */
        padding: 20px;
        overflow-x: auto; /* Permite scroll horizontal si es necesario */
        box-sizing: border-box;
      }

      .bill-content {
        width: 994px; /* Ancho A4 en píxeles - FIJO */
        min-width: 994px; /* Evita que se comprima */
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
        flex-shrink: 0; /* Evita que se reduzca */
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

      /* Card única con dos columnas */
      .unified-card {
        background: white;
        border-radius: 15px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
        min-width: 914px; /* Ancho fijo menos padding */
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        min-height: 350px;
      }

      /* Columna izquierda con dos filas */
      .left-section {
        display: grid;
        grid-template-rows: auto 1fr;
        gap: 20px;
      }

      /* Información del cliente en la primera fila */
      .client-info-section {
        display: flex;
        flex-direction: column;
      }

      .client-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 15px;
        font-weight: 600;
        color: #2388ff;
        font-size: 16px;
      }

      .client-content {
        font-size: 14px;
        line-height: 1.4;
      }

      .client-info-item {
        margin: 6px 0;
        display: flex;
        align-items: flex-start;
      }

      .client-info-item .label {
        font-weight: 500;
        color: #333;
        min-width: 140px;
        margin-right: 5px;
      }

      .client-info-item .value {
        color: #666;
        flex: 1;
      }

      .estrato-badge {
        background: #2388ff;
        color: white;
        padding: 4px 12px;
        border-radius: 15px;
        font-size: 12px;
        font-weight: 500;
        margin-left: auto;
        align-self: flex-start;
      }

      /* Área de la gráfica en la segunda fila */
      .chart-section {
        display: flex;
        flex-direction: column;
      }

      .chart-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 15px;
        font-weight: 600;
        color: #2388ff;
        font-size: 16px;
      }

      .chart-content {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
      }

      /* Columna derecha con información de consumo */
      .right-section {
        display: flex;
        flex-direction: column;
      }

      .consumption-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 15px;
        font-weight: 600;
        color: #2388ff;
        font-size: 16px;
      }

      .consumption-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        flex: 1;
      }

      .consumption-item {
        background: #f8faff;
        border-radius: 10px;
        padding: 12px;
        border: 1px solid #e3f2fd;
      }

      .consumption-item .item-label {
        font-size: 12px;
        font-weight: 500;
        color: #2388ff;
        margin-bottom: 5px;
        text-transform: uppercase;
      }

      .consumption-item .item-value {
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }

      .total-section {
        background: #adecbb;
        border-radius: 10px;
        padding: 15px;
        margin-top: 15px;
        text-align: center;
      }

      .total-label {
        font-size: 16px;
        font-weight: 600;
        color: #2e7d32;
      }

      .total-amount {
        font-size: 20px;
        font-weight: bold;
        color: #1b5e20;
      }

      /* Grid principal con información */
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: auto auto;
        gap: 15px;
        margin-bottom: 20px;
        min-width: 814px; /* Ancho fijo menos padding */
      }

      /* Fila específica para mapa y punto de pago */
      .map-payment-row {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: 60% 40%;
        gap: 20px;
        margin: 15px 0;
        min-width: 814px; /* Ancho fijo menos padding */
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
        min-width: 814px; /* Ancho fijo menos padding */
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

      /* Estilos específicos para la categoría "Otros Servicios" */
      .service-item.tarifa-title {
        margin: 8px 0 4px 0;
        padding: 4px 0;
        border-bottom: 1px solid #eee;
      }

      .service-item.concepto-subitem {
        margin: 2px 0;
        padding: 1px 0;
      }

      .service-item.concepto-subitem span:first-child {
        font-size: 10px;
        color: #666;
      }

      /* Sección inferior */
      .bottom-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-top: 20px;
        min-width: 814px; /* Ancho fijo menos padding */
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
        min-width: 320px; /* Ancho mínimo para 4 columnas */
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

      /* Responsive con escala proporcional - mantiene estructura como imagen */
      /* Desktop grande - sin cambios */
      @media (min-width: 1051px) {
        .pdf-container {
          padding: 20px;
          justify-content: center;
          align-items: center;
        }
        .bill-content {
          transform: none;
        }
      }

      /* Tablet grande */
      @media (max-width: 1050px) and (min-width: 901px) {
        .pdf-container {
          padding: 20px;
          justify-content: center;
          align-items: center;
        }
        .bill-content {
          transform: scale(0.85);
          transform-origin: center center;
        }
      }

      /* Tablet */
      @media (max-width: 900px) and (min-width: 751px) {
        .pdf-container {
          padding: 20px;
          justify-content: center;
          align-items: center;
        }
        .bill-content {
          transform: scale(0.7);
          transform-origin: center center;
        }
      }

      /* Tablet pequeño */
      @media (max-width: 750px) and (min-width: 631px) {
        .pdf-container {
          padding: 15px;
          justify-content: center;
          align-items: center;
        }
        .bill-content {
          transform: scale(0.6);
          transform-origin: center center;
        }
      }

      /* Móvil grande */
      @media (max-width: 630px) and (min-width: 531px) {
        .pdf-container {
          padding: 15px;
          justify-content: center;
          align-items: center;
        }
        .bill-content {
          transform: scale(0.5);
          transform-origin: center center;
        }
      }

      /* Móvil mediano */
      @media (max-width: 530px) and (min-width: 426px) {
        .pdf-container {
          width: 100vw;
          max-width: 400px;
          height: 600px;
          max-height: 600px;
          padding: 10px;
          min-height: auto;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .bill-content {
          transform: scale(0.4);
          transform-origin: center center;
        }
      }

      /* Móvil pequeño */
      @media (max-width: 425px) and (min-width: 376px) {
        .pdf-container {
          width: 100vw;
          max-width: 350px;
          height: 550px;
          max-height: 550px;
          padding: 8px;
          min-height: auto;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .bill-content {
          transform: scale(0.38);
          transform-origin: center center;
        }
      }

      /* iPhone SE y dispositivos muy pequeños */
      @media (max-width: 375px) {
        .pdf-container {
          width: 100vw;
          max-width: 375px;
          height: 520px;
          max-height: 520px;
          padding: 5px;
          min-height: auto;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .bill-content {
          transform: scale(0.32);
          transform-origin: center center;
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
          transform: none !important; /* Quita la escala en impresión */
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
            <h1>la imagen no se cargo</h1>
            }
          </div>
          <div class="header-left">
            <div class="company-info">
              <h1>{{ enterpriseInfo.value().nombre }}</h1>
              <div class="company-details">
                <div><strong>NIT: </strong>{{ billData()?.empresa?.nit }}</div>
                <div><strong>Direccion: </strong>{{ GetDirectiomComplete() }}</div>
              </div>
            </div>
          </div>

          <div class="header-center">
            <div class="address-info">
              <!-- <div>Saladoblanco/Huila C 12</div>
              <div># 23 - 45 A barrio Centro</div> -->
            </div>
          </div>

          <div class="header-right">
            <div class="invoice-number">N°: {{ billData()?.empresa?.codigo }}</div>
          </div>
        </div>

        <div class="bill-body">
          <!-- Card única con estructura de dos columnas -->
          <div class="unified-card">
            <!-- Columna izquierda con dos filas -->
            <div class="left-section">
              <!-- Primera fila: Información del cliente -->
              <div class="client-info-section">
                <div class="client-header">
                  <div class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg class="h-3 w-3" fill="white" viewBox="0 0 24 24">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <span>Cliente</span>
                  <div class="estrato-badge">Estrato {{ billData()?.cliente?.estrato }}</div>
                </div>
                <div class="client-content">
                  <div class="client-info-item">
                    <span class="label">Nombre:</span>
                    <span class="value">
                      {{ billData()?.cliente?.primerNombre || 'Joselito' }}
                      {{ billData()?.cliente?.segundoNombre || '' }}
                      {{ billData()?.cliente?.primerApellido || 'Chavarro' }}
                      {{ billData()?.cliente?.segundoApellido || '' }}
                    </span>
                  </div>
                  <div class="client-info-item">
                    <span class="label">Número de documento:</span>
                    <span class="value">{{ billData()?.cliente?.numeroCedula || '23874623874' }}</span>
                  </div>
                  <div class="client-info-item">
                    <span class="label">Código Cliente:</span>
                    <span class="value">{{ billData()?.cliente?.codigo || '45GDT' }}</span>
                  </div>
                  <div class="client-info-item">
                    <span class="label">Dirección:</span>
                    <span class="value">
                      {{ billData()?.cliente?.direccion?.departamentoNombre || 'Huila' }}, {{ billData()?.cliente?.direccion?.ciudadNombre || 'Pitalito' }}, {{ billData()?.cliente?.direccion?.corregimientoNombre || 'Monte Carlos' }} {{ billData()?.cliente?.direccion?.descripcion || 'Carrera 45 # 67-89' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Segunda fila: Historial de consumo -->
              <div class="chart-section">
                <div class="chart-header">
                  <div class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg class="h-3 w-3" fill="white" viewBox="0 0 24 24">
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <span>Historial de consumo</span>
                </div>
                <div class="chart-content">
                  <app-legends-bill-history
                    [historyData]="billData()?.lecturasHistorico || []">
                  </app-legends-bill-history>
                </div>
              </div>
            </div>

            <!-- Columna derecha: Datos del consumo y contador -->
            <div class="right-section">
              <div class="consumption-header">
                <div class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg class="h-3 w-3" fill="white" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </div>
                <span>Datos del consumo y el contador</span>
              </div>

              <div class="consumption-grid">
                <div class="consumption-item">
                  <div class="item-label">Periodo Facturado</div>
                  <div class="item-value">Mayo</div>
                </div>
                <div class="consumption-item">
                  <div class="item-label">Lectura</div>
                  <div class="item-value">{{ billData()?.factura?.lectura?.lectura || 34 }} m³</div>
                </div>
                <div class="consumption-item">
                  <div class="item-label">Fecha Expedición</div>
                  <div class="item-value">12/23/20025</div>
                </div>
                <div class="consumption-item">
                  <div class="item-label">Fecha vencimiento</div>
                  <div class="item-value">12/23/20025</div>
                </div>
                <div class="consumption-item">
                  <div class="item-label">Contador</div>
                  <div class="item-value">Analógico</div>
                </div>
                <div class="consumption-item">
                  <div class="item-label">Serial</div>
                  <div class="item-value">FDFD435435</div>
                </div>
              </div>

              <div class="consumption-item" style="margin-top: 15px;">
                <div class="item-label">Dirección</div>
                <div class="item-value">Huila, Pitalito, Monte Carlos Carrera 45 # 67-89</div>
              </div>

              <div class="total-section">
                <div class="total-label">Valor Facturado:</div>
                <div class="total-amount">$ 34.000</div>
              </div>
            </div>
          </div>

          <!-- Grid de servicios -->
          <div class="services-grid">
            <!-- Primeras 3 tarifas individuales -->
            @for (tarifa of getPrimeras3Tarifas(); track tarifa.idTipoTarifa; let i = $index) {
              <div class="service-category" [ngClass]="getTarifaCardClassByPosition(i)">
                <h3>{{ tarifa.nombre }}</h3>
                <div class="service-items">
                  @for (concepto of tarifa.conceptos; track concepto.idTarifaConcepto) {
                    <div class="service-item">
                      <span>{{ concepto.tipoConceptoNombre }}</span>
                      <span>{{ (concepto.valor || 0) | colombianCurrency }}</span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Cuarta categoría con tarifas agrupadas -->
            @if (tieneOtrasTarifas()) {
              <div class="service-category otros">
                <h3>Otros Servicios</h3>
                <div class="service-items">
                  @for (tarifa of getTarifasRestantes(); track tarifa.idTipoTarifa) {
                    <!-- Nombre de la tarifa como subtítulo -->
                    <div class="service-item tarifa-title">
                      <span style="font-weight: bold; color: #333; font-size: 12px;">{{ tarifa.nombre }}</span>
                      <span></span>
                    </div>
                    <!-- Conceptos de la tarifa como subitems -->
                    @for (concepto of tarifa.conceptos; track concepto.idTarifaConcepto) {
                      <div class="service-item concepto-subitem">
                        <span style="padding-left: 15px; color: #666;">{{ concepto.tipoConceptoNombre }}</span>
                        <span>{{ (concepto.valor || 0) | colombianCurrency }}</span>
                      </div>
                    }
                  }
                </div>
              </div>
            }
          </div>
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
                <!-- Primeros 3 totales con colores específicos por posición -->
                @for (tipo of getPrimeros3Totales(); track tipo.nombre; let i = $index) {
                  <div class="total-card" [ngClass]="getTipoCardClassByPosition(i)">
                    <div class="card-title">{{ tipo.nombre }}</div>
                    <div class="card-amount">{{ tipo.valor | colombianCurrency }}</div>
                  </div>
                }
                <!-- Cuarta tarjeta con total agrupado de otros servicios -->
                @if (tieneOtrosTotales()) {
                  <div class="total-card otros-card">
                    <div class="card-title">Otros</div>
                    <div class="card-amount">{{ getTotalOtrosServicios() | colombianCurrency }}</div>
                  </div>
                }
              </div>
              <div class="final-total-card">
                <span class="total-label">Total a pagar:</span>
                <span class="total-amount">{{ getTotalAPagar() | colombianCurrency }}</span>
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
  selectedStatus = input<string | null>(null);
  billData = input<IBillDetailResponse | null>(null);
  private readonly enterpriseIdService = inject(EnterpriseIdService);
  private readonly deudaService = inject(DeudaService);

  constructor() {
    effect(() => {
      console.log("la data mi pez: ", this.enterpriseInfo.value());
    })
  }

  enterpriseInfo = rxResource({
    stream: () => this.enterpriseIdService.getEnterpriseInfo(),
  });



  getTotalesPorTipo() {
    const billData = this.billData();
    if (!billData?.totalesTarifas?.porTipo) return [];

    return Object.entries(billData.totalesTarifas.porTipo).map(([nombre, valor]) => ({
      nombre,
      valor
    }));
  }

  getTipoCardClass(tipoNombre: string): string {
    const tipo = tipoNombre.toLowerCase();
    if (tipo.includes('acueducto')) return 'acueducto';
    if (tipo.includes('aseo')) return 'aseo';
    if (tipo.includes('alcantarillado')) return 'alcantarillado';
    return 'otros';
  }

  getTipoCardClassForTotals(tipoNombre: string): string {
    const tipo = tipoNombre.toLowerCase();
    if (tipo.includes('acueducto')) return 'acueducto-card';
    if (tipo.includes('aseo')) return 'aseo-card';
    if (tipo.includes('alcantarillado')) return 'alcantarillado-card';
    return 'otros-card';
  }

  // Métodos para manejar los totales con lógica de 3 primeros
  getPrimeros3Totales() {
    const totales = this.getTotalesPorTipo();
    return totales.slice(0, 3);
  }

  getTotalesRestantes() {
    const totales = this.getTotalesPorTipo();
    if (totales.length <= 3) return [];
    return totales.slice(3);
  }

  getTotalOtrosServicios(): number {
    const totalesRestantes = this.getTotalesRestantes();
    return totalesRestantes.reduce((sum, tipo) => sum + (tipo.valor || 0), 0);
  }

  tieneOtrosTotales(): boolean {
    return this.getTotalesPorTipo().length > 3;
  }

  getTipoCardClassByPosition(index: number): string {
    const classes = ['acueducto-card', 'aseo-card', 'alcantarillado-card'];
    return classes[index] || 'otros-card';
  }

  getTarifaCardClassByPosition(index: number): string {
    const classes = ['acueducto', 'aseo', 'alcantarillado'];
    return classes[index] || 'otros';
  }

  getTotalAPagar(): number {
    const billData = this.billData();
    return billData?.totalesTarifas?.total || 0;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO');
  }

  getPrecioLectura(): number {
    const billData = this.billData();
    return billData?.factura?.lectura?.precio || 0;
  }

  GetDirectiomComplete(): string {
    const billData = this.billData();
    if (!billData?.empresa?.direccion) return '';
    const dir = billData.empresa.direccion;
    return `${dir.departamentoNombre || ''}, ${dir.ciudadNombre || ''}, ${dir.corregimientoNombre || ''} ${dir.descripcion || ''}`;
  }

  getDirectionCompleteCounter(): string {
    const billData = this.billData();
    if (!billData?.contador?.direccion) return '';
    const dir = billData.contador.direccion;
    return `${dir.departamentoNombre || ''}, ${dir.ciudadNombre || ''}, ${dir.corregimientoNombre || ''} ${dir.descripcion || ''}`;
  }

  // Métodos para manejar las tarifas limitadas
  getPrimeras3Tarifas() {
    const billData = this.billData();
    if (!billData?.tarifas) return [];
    // Tomar los primeros 3 elementos del array tal como llegan
    return billData.tarifas.slice(0, 3);
  }

  getTarifasRestantes() {
    const billData = this.billData();
    if (!billData?.tarifas || billData.tarifas.length <= 3) return [];
    return billData.tarifas.slice(3);
  }

  getConceptosAgrupados() {
    const tarifasRestantes = this.getTarifasRestantes();
    const conceptosAgrupados: any[] = [];

    tarifasRestantes.forEach(tarifa => {
      if (tarifa.conceptos) {
        tarifa.conceptos.forEach(concepto => {
          conceptosAgrupados.push({
            ...concepto,
            tarifaNombre: tarifa.nombre
          });
        });
      }
    });

    return conceptosAgrupados;
  }

  tieneOtrasTarifas(): boolean {
    const billData = this.billData();
    return !!(billData?.tarifas && billData.tarifas.length > 3);
  }
}
