import { Component, effect, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LegendsHistoryBill } from './charts/legens-bill-history';
import { rxResource } from '@angular/core/rxjs-interop';
import { EnterpriseIdService } from '@services/enterpriceId.service';
import { IBillDetailResponse, IPuntoPago } from '@interfaces/Ibill-detail';
import { ColombianCurrencyPipe } from '@shared/index';
import { DeudaService } from '../../modules/bill/service/deuda.service';
import { IDeudaClienteResponse } from '@interfaces/IdeudaFactura';

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
        top: 30px;
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
        padding: 2px 25px 23px 25px;
        border-radius: 25px;
        font-weight: bold;
        font-size: 16px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      .bill-body {
        min-height: 800px;
        padding: 30px 0;
      }

      /* Card única con dos columnas */
      .unified-card {
        background: white;
        border-radius: 15px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
        min-width: 914px; /* Ancho fijo menos padding */
        min-height: 350px;
      }

      /* Encabezado principal de la card */
      .unified-card-header {
        background: #E0E9FF;
        color: #333333;
        padding: 15px 20px;
        border-radius: 15px 15px 0 0;
        font-weight: 600;
        font-size: 16px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 205px;
        margin-bottom: 0;
      }

      .titleTwo{
        padding-bottom: 17px;
      }

      .unified-card-header .header-column {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .unified-card-header .column-icon {
        width: 20px;
        height: 20px;
        background: #2388FF;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      /* Contenido de la card con layout de dos columnas */
      .unified-card-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
       padding-top: 5px;
       padding-bottom: 12px;
       padding-left: 12px;
        padding-right: 12px;

      }

      /* Columna izquierda con dos filas */
      .left-section {
        display: grid;
        grid-template-rows: auto 1fr;
      }

      /* Información del cliente en la primera fila */
      .client-info-section {
        display: flex;
        flex-direction: column;
        position: relative;
      }

      .client-content {
        font-size: 14px;
        line-height: 1.4;
      }

      .client-info-item {
        margin: 6px 0;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
      }

      .client-info-item .label {
        font-weight: 500;
        color: #333;
        min-width: 160px;
        margin-right: 10px;
        flex-shrink: 0;
      }

      .client-info-item .value {
        color: #666;
        flex: 1;
        text-align: left;
      }

      .estrato-badge {
        background: #2388ff;
        color: white;
        padding: 4px 12px 12px;
        border-radius: 15px;
        font-size: 12px;
        font-weight: 500;
        display: inline-block;
        margin-left: auto;
        flex-shrink: 0;
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
        gap: 5px;
        flex: 1;
      }

      .consumption-item {
        background: white;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid #378EFF;

      }

      .consumption-item .item-label {
        background: #7BC6FF;
        color: white;
        font-size: 12px;
        font-weight: 500;
                padding-top: 0px;
        padding-bottom: 8px;
        padding-left: 12px;
        padding-right: 12px;
        margin: 0;
        text-transform: uppercase;
        text-align: center;
      }

      .consumption-item .item-value {
        background: white;
        font-size: 12px;
        font-weight: 600;
        color: #333;
        padding-top: 0px;
        padding-bottom: 8px;
        padding-left: 12px;
        padding-right: 12px;
        text-align: center;
        margin: 0;
      }

      .total-section {
        height: 50px;
        padding-top: 0px;
        padding-bottom: 15px;
        padding-left: 12px;
        padding-right: 12px;
        background: #adecbb;
        border-radius: 10px;
        margin-top: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .total-label {
        font-size: 16px;
        font-weight: 600;
        color: #2e7d32;
        margin: 0;
      }

      .total-amount {
        font-size: 20px;
        font-weight: bold;
        color: #1b5e20;
        margin: 0;
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

      .services-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: minmax(auto, max-content) minmax(auto, max-content);
        gap: 12px;
        margin: 10px 0;
        min-width: 814px;
      }

      .services-grid > .service-card-wrapper:nth-child(1),
      .services-grid > .service-card-wrapper:nth-child(2) {
        align-self: stretch;
      }

      .services-grid > .service-card-wrapper:nth-child(3),
      .services-grid > .service-card-wrapper:nth-child(4) {
        align-self: stretch;
      }



      .service-card-wrapper {
        display: flex;
        align-items: stretch;
        gap: 3px;
        height: 100%;
      }





      .service-card {
        background: white;
        border-radius: 20px;
        padding: 7px 15px;
        border: 2px solid #DEE4EE;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
      }

      .service-card.aseo-dual,
      .service-card.dual-column {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0px;
        padding: 7px 15px;
        border: 2px solid #DEE4EE;
        border-radius: 20px;
        background: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        width: 100%;
        height: 100%;
      }

      .service-card.aseo-dual .service-column:first-child,
      .service-card.dual-column .service-items:first-child {
        border-right: 1px solid #e0e0e0;
        padding-right: 20px;
        margin-right: 0px;
      }

      .service-card.aseo-dual .service-column:last-child,
      .service-card.dual-column .service-items:last-child {
        padding-left: 20px;
        margin-left: 0px;
      }

      .service-card.dual-column .service-items {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .service-card.dual-column .service-column-title {
        text-align: left;
        grid-column: 1 / -1;
      }

      .service-card.puntos-pago {
        display: flex;
        flex-direction: column;
        text-align: center;
        gap: 10px;
        background: white;
        padding: 15px;
        width: 100%;
        height: 100%;
      }

      .puntos-pago-title {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 12px;
        font-weight: bold;
        color: #333;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid #eee;
        text-align: center;
      }

      .puntos-pago-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        width: 100%;
        height: 100%;
        align-content: start;
      }

      .punto-pago-item {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 60px;
      }

      .punto-pago-item img {
        max-width: 100%;
        max-height: 50px;
        width: auto;
        height: auto;
        object-fit: contain;
      }

      /* Estilos específicos para el código QR */
      .punto-pago-item.qr-item {
        grid-column: 1 / -1; /* Ocupa todas las columnas disponibles */
        height: 80px; /* Altura mayor para el QR */
        background: #f0f8ff;
        border: 2px dashed #2388ff;
      }

      .qr-image {
        max-width: 100%;
        max-height: 75px !important; /* Más grande que las imágenes normales */
        width: auto;
        height: auto;
        object-fit: contain;
      }

      .service-column {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .service-column-title {
        font-size: 12px;
            margin: -18px;
    margin-left: 5px;
        font-weight: bold;
        color: white;
        margin-bottom: 5px;
        padding: 2px 12px 12px 12px;
        border-radius: 8px;
        text-align: center;
        background: #0077FF;
        display: inline-block;
        width: fit-content;
      }

      .service-card-wrapper:nth-child(1) .service-column-title {
        background: #77b2ff;
      }

      .service-card-wrapper:nth-child(2) .service-column-title {
        background: #fdcb6e; /* Naranja para Alcantarillado */
      }

      .service-card-wrapper:nth-child(3) .service-column-title:not(.otros-title) {
        background: #ff8a9b; /* Rosa para Aseo - solo si NO es otros-title */
      }

      .service-column-title.otros-title {
        background: #6c7293 !important; /* Gris para Otros - con !important para asegurar precedencia */
        color: white;
        padding: 2px 12px 12px 12px;
        border-radius: 8px;
        margin-bottom: 5px;
        display: inline-block;
        width: fit-content;
        margin-left: auto;
        margin-right: auto;
      }

      .service-items {
        font-size: 11px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
      }

      .service-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .service-item:last-child {
        border-bottom: none;
      }

      .service-item span:first-child {
        flex: 1;
        color: #666;
        font-size: 11px;
        line-height: 1.3;
      }

      .service-item span:last-child {
        color: #333;
        font-size: 11px;
      }

      /* Estilos específicos para la categoría "Otros Servicios" */
      .service-item.tarifa-title {
        margin: 4px 0 4px 0;
        padding: 8px 0 4px 0;
        font-weight: bold;
      }

      .service-item.tarifa-title span:first-child {
        font-size: 12px;
        font-weight: bold;
        color: #333;
      }

      .service-item.concepto-subitem {
        padding-left: 12px;
      }

      .service-item.concepto-subitem span:first-child {
        font-size: 10px;
        color: #777;
      }

      /* Línea divisoria */
      .dashed-line {
        width: 100%;
        height: 2px;
        border-top: 3px dashed #adb1b8;
        margin: 20px 0;
        min-width: 814px;
      }

      /* Sección inferior */
      .bottom-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0px;
        margin-top: 20px;
        min-width: 814px; /* Ancho fijo menos padding */
        align-items: start;
        background: #F3F8FF;
        border-radius: 15px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border: 1px solid #378EFF;
        position: relative;
      }

      /* Línea superior del bottom-section */
      .bottom-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        border-radius: 15px 15px 0 0;
      }

      .consumption-summary,
      .payment-summary {
        padding: 20px;
        box-shadow: none;
        border: none;
        border-radius: 0;
      }

      .consumption-summary {
        background: #F3F8FF;
        border-radius: 15px 0 0 15px;
      }

      .payment-summary {
        background: #F3F8FF;
        border-radius: 0 15px 15px 0;
      }



      .summary-content {
        margin-top: 15px;
        font-size: 12px;
      }

      .due-date {
        margin-top: 0px;
        font-weight: bold;
        color: #333;
        text-align: center;

                padding-left: 12px;
        padding-right: 12px;
                padding-top: 0px;
        padding-bottom: 17px;



        background: rgba(255, 255, 255, 0.7);
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
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
        min-width: 320px;
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
        color: rgb(0 0 0 / 27%);
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
              <h1>{{ enterpriseInfo.value()?.nombre || 'Cargando...' }}</h1>
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
            <!-- Encabezado principal de la card -->
            <div class="unified-card-header">
              <div class="header-column">
                <div class="column-icon">
                  <svg class="h-3 w-3" fill="white" viewBox="0 0 24 24">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <span class="titleTwo" >Cliente e Historial de consumo</span>
              </div>
              <div class="header-column">
                <div class="column-icon">
                  <svg class="h-3 w-3" fill="white" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </div>
                <span class="titleTwo">Datos del consumo y el contador</span>
              </div>
            </div>

            <!-- Contenido de la card -->
            <div class="unified-card-content">
              <!-- Columna izquierda con dos filas -->
              <div class="left-section">
              <!-- Primera fila: Información del cliente -->
              <div class="client-info-section">
                <div class="client-content">
                  <div class="client-info-item">
                    <span class="label">Nombre:</span>
                    <span class="value">
                      {{ billData()?.cliente?.primerNombre || '' }}
                      {{ billData()?.cliente?.segundoNombre || '' }}
                      {{ billData()?.cliente?.primerApellido || '' }}
                      {{ billData()?.cliente?.segundoApellido || '' }}
                    </span>
                    <div class="estrato-badge">Estrato {{ billData()?.cliente?.estrato }}</div>
                  </div>
                  <div class="client-info-item">
                    <span class="label">Número de documento:</span>
                    <span class="value">{{ billData()?.cliente?.numeroCedula || '' }}</span>
                  </div>
                  <div class="client-info-item">
                    <span class="label">Código Cliente:</span>
                    <span class="value">{{ billData()?.cliente?.codigo || '' }}</span>
                  </div>
                  <div class="client-info-item">
                    <span class="label">Dirección:</span>
                    <span class="value">
                      {{ billData()?.cliente?.direccion?.departamentoNombre || '' }}, {{ billData()?.cliente?.direccion?.ciudadNombre || '' }}, {{ billData()?.cliente?.direccion?.corregimientoNombre || '' }} {{ billData()?.cliente?.direccion?.descripcion || '' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Segunda fila: Historial de consumo -->
              <div class="chart-section">
                <div class="chart-content">
                  <app-legends-bill-history
                    [historyData]="billData()?.lecturasHistorico || []">
                  </app-legends-bill-history>
                </div>
              </div>
            </div>

            <!-- Columna derecha: Datos del consumo y contador -->
            <div class="right-section">
              <div class="consumption-grid">
                <div class="consumption-item">
                  <div class="item-label">Periodo Facturado</div>
                  <div class="item-value">{{ getMonthName(billData()?.factura?.fechaEmision) }}</div>
                </div>
                <div class="consumption-item">
                  <div class="item-label">Lectura</div>
                  <div class="item-value">{{ billData()?.factura?.lectura?.lectura || '' }} m³</div>
                </div>
                <div class="consumption-item">
                  <div class="item-label">Fecha Lectura</div>
                  <div class="item-value">{{ billData()?.factura?.lectura?.fechaLectura }}</div>
                </div>
                <div class="consumption-item">
                  <div class="item-label">Fecha de fechaEmision</div>
                  <div class="item-value">{{ billData()?.factura?.fechaEmision }}</div>
                </div>
                <div class="consumption-item">
                  <div class="item-label">Contador</div>
                  <div class="item-value">{{ billData()?.contador?.tipoContadorNombre }}</div>
                </div>
                <div class="consumption-item">
                  <div class="item-label">Serial</div>
                  <div class="item-value">{{ billData()?.contador?.serial }}</div>
                </div>
              </div>

              <div class="consumption-item" style="margin-top: 15px;">
                <div class="item-label">Dirección</div>
                <div class="item-value">{{ getDirectionCompleteCounter() }}</div>
              </div>

              <div class="total-section">
                <div class="total-label">Valor Facturado:</div>
                <div class="total-amount">{{ billData()?.factura?.lectura?.precio | colombianCurrency  }}</div>
              </div>
              </div>
            </div>
            <!-- Fin del contenido de la card -->
          </div>
          <!-- Fin de la unified-card -->

          <!-- Grid de servicios -->
          <div class="services-grid">
            <!-- Primera fila, primera columna: Primera tarifa -->
            @if (getPrimeras3Tarifas()[0]) {
              <div class="service-card-wrapper">
                @if (shouldUseDualColumn(getPrimeras3Tarifas()[0].conceptos)) {
                  <!-- Card con dos columnas para más de 6 items -->
                  <div class="service-card dual-column">
                    <div class="service-column-title">{{ getPrimeras3Tarifas()[0].nombre }}</div>
                    <div class="service-items">
                      @for (concepto of getFirstColumnItems(getPrimeras3Tarifas()[0].conceptos); track concepto.idTarifaConcepto) {
                        <div class="service-item">
                          <span>{{ concepto.tipoConceptoNombre }}</span>
                          <span>{{ (concepto.valor || 0) | colombianCurrency }}</span>
                        </div>
                      }
                    </div>
                    <div class="service-items">
                      @for (concepto of getSecondColumnItems(getPrimeras3Tarifas()[0].conceptos); track concepto.idTarifaConcepto) {
                        <div class="service-item">
                          <span>{{ concepto.tipoConceptoNombre }}</span>
                          <span>{{ (concepto.valor || 0) | colombianCurrency }}</span>
                        </div>
                      }
                    </div>
                  </div>
                } @else {
                  <!-- Card normal para 6 items o menos -->
                  <div class="service-card">
                    <div class="service-column-title">{{ getPrimeras3Tarifas()[0].nombre }}</div>
                    <div class="service-items">
                      @for (concepto of getPrimeras3Tarifas()[0].conceptos; track concepto.idTarifaConcepto) {
                        <div class="service-item">
                          <span>{{ concepto.tipoConceptoNombre }}</span>
                          <span>{{ (concepto.valor || 0) | colombianCurrency }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Primera fila, segunda columna: Tercera tarifa -->
            @if (getPrimeras3Tarifas()[2]) {
              <div class="service-card-wrapper">
                @if (shouldUseDualColumn(getPrimeras3Tarifas()[2].conceptos)) {
                  <!-- Card con dos columnas para más de 6 items -->
                  <div class="service-card dual-column">
                    <div class="service-column-title">{{ getPrimeras3Tarifas()[2].nombre }}</div>
                    <div class="service-items">
                      @for (concepto of getFirstColumnItems(getPrimeras3Tarifas()[2].conceptos); track concepto.idTarifaConcepto) {
                        <div class="service-item">
                          <span>{{ concepto.tipoConceptoNombre }}</span>
                          <span>{{ (concepto.valor || 0) | colombianCurrency }}</span>
                        </div>
                      }
                    </div>
                    <div class="service-items">
                      @for (concepto of getSecondColumnItems(getPrimeras3Tarifas()[2].conceptos); track concepto.idTarifaConcepto) {
                        <div class="service-item">
                          <span>{{ concepto.tipoConceptoNombre }}</span>
                          <span>{{ (concepto.valor || 0) | colombianCurrency }}</span>
                        </div>
                      }
                    </div>
                  </div>
                } @else {
                  <!-- Card normal para 6 items o menos -->
                  <div class="service-card">
                    <div class="service-column-title">{{ getPrimeras3Tarifas()[2].nombre }}</div>
                    <div class="service-items">
                      @for (concepto of getPrimeras3Tarifas()[2].conceptos; track concepto.idTarifaConcepto) {
                        <div class="service-item">
                          <span>{{ concepto.tipoConceptoNombre }}</span>
                          <span>{{ (concepto.valor || 0) | colombianCurrency }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Segunda fila, primera columna: Segunda tarifa con dos columnas -->
            @if (getPrimeras3Tarifas()[1]) {
              <div class="service-card-wrapper">
                <div class="service-card aseo-dual">
                  <div class="service-column">
                    <div class="service-column-title">{{ getPrimeras3Tarifas()[1].nombre }}</div>
                    <div class="service-items">
                      @for (concepto of getPrimeras3Tarifas()[1].conceptos; track concepto.idTarifaConcepto) {
                        <div class="service-item">
                          <span>{{ concepto.tipoConceptoNombre }}</span>
                          <span>{{ (concepto.valor || 0) | colombianCurrency }}</span>
                        </div>
                      }
                    </div>
                  </div>
                  <div class="service-column">
                    <div class="service-column-title otros-title">Otros</div>
                    <div class="service-items">
                      @if (tieneOtrasTarifas()) {
                        @for (tarifa of getTarifasRestantes(); track tarifa.idTipoTarifa) {
                          <div class="service-item tarifa-title">
                            <span>{{ tarifa.nombre }}</span>
                            <span></span>
                          </div>
                          @for (concepto of tarifa.conceptos.slice(0, 3); track concepto.idTarifaConcepto) {
                            <div class="service-item concepto-subitem">
                              <span>{{ concepto.tipoConceptoNombre }}</span>
                              <span>{{ (concepto.valor || 0) | colombianCurrency }}</span>
                            </div>
                          }
                        }
                      }
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- Segunda fila, segunda columna: Puntos de pago -->
            <div class="service-card-wrapper">
              <div class="service-card puntos-pago">
                <div class="puntos-pago-title">
                  <svg width="16" height="16" fill="#2388ff" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Puntos de pago
                </div>
                <div class="puntos-pago-grid">
                  <!-- Código QR de la empresa - más grande si existe -->
                  @if (hasEmpresaCodigoQr()) {
                    <div class="punto-pago-item qr-item">
                      <img
                        [src]="'data:image/png;base64,' + getEmpresaCodigoQrImagen()"
                        [alt]="'Código QR - ' + (billData()?.empresa?.nombre || 'Empresa')"
                        class="qr-image" />
                    </div>
                  }

                  <!-- Puntos de pago normales -->
                  @if (getPuntosPago() && getPuntosPago().length > 0) {
                    @for (punto of getPuntosPago(); track punto.id || $index) {
                      <div class="punto-pago-item">
                        @if (punto.imagen) {
                          <img
                            [src]="'data:' + (punto.contentType || 'image/png') + ';base64,' + punto.imagen"
                            [alt]="punto.nombre || 'Punto de pago'" />
                        } @else {
                          <!-- Fallback text si no hay imagen -->
                          <span style="font-size: 10px; text-align: center; color: #666;">
                            {{ punto.nombre || 'Punto de pago' }}
                          </span>
                        }
                      </div>
                    }
                  } @else {
                    <!-- Fallback a imágenes estáticas si no hay datos dinámicos -->
                    <div class="punto-pago-item">
                      <img src="/images/image1.png" alt="Efecty" />
                    </div>
                    <div class="punto-pago-item">
                      <img src="/images/image2.png" alt="Confie" />
                    </div>
                    <div class="punto-pago-item">
                      <img src="/images/image3.png" alt="Ditraunica" />
                    </div>
                    <div class="punto-pago-item">
                      <img src="/images/qrenterprice.webp" alt="QR" />
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Línea divisoria -->
          <div class="dashed-line"></div>

          <div class="bottom-section">
            <!-- Columna izquierda: Información de pago -->
            <div class="consumption-summary">
              <div class="card-header">
                <div
                  class="w-full"
                >
                  <span>Información de pago</span>
                  <svg class="h-3 w-3" fill="white" viewBox="0 0 24 24">
                    <path
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>

              </div>
              <div class="summary-content">
                <div class="info-item">
                  <span class="label">Nombre:</span>
                  <span class="value">
                    {{ billData()?.cliente?.primerNombre || '' }}
                    {{ billData()?.cliente?.segundoNombre || '' }}
                    {{ billData()?.cliente?.primerApellido || '' }}
                    {{ billData()?.cliente?.segundoApellido || '' }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="label">Número de documento:</span>
                  <span class="value">{{ billData()?.cliente?.numeroCedula || '' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Código Cliente:</span>
                  <span class="value">{{ billData()?.cliente?.codigo || '' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Dirección:</span>
                  <span class="value">
                    {{ billData()?.cliente?.direccion?.departamentoNombre || '' }}, {{ billData()?.cliente?.direccion?.ciudadNombre || '' }}, {{ billData()?.cliente?.direccion?.corregimientoNombre || '' }} {{ billData()?.cliente?.direccion?.descripcion || '' }}
                  </span>
                </div>
                <div class="due-date" style="color: #d32f2f; background: rgba(211, 47, 47, 0.1); border: 1px solid #d32f2f; margin-top: 55px;">
                  <span style="color: #d32f2f;">Fecha emision:</span>
                  <span style="color: #d32f2f; font-weight: bold;">{{ billData()?.factura?.fechaEmision }}</span>
                </div>
                <div class="due-date" style="background: rgba(211, 47, 47, 0.1); border: 1px solid #d32f2f; margin-top: 10px;">
                  <span style="color: #d32f2f;">Valor de la deuda:</span>
                  <span style="color: #d32f2f; font-weight: bold;">{{ valorDeuda() | colombianCurrency }}</span>
                </div>
              </div>
            </div>

            <!-- Columna derecha: Valor total de la factura -->
            <div class="payment-summary">
              <div class="card-header">
                <div
                  class="w-full"
                >
                <span>Valor total de la factura</span>
                  <svg class="h-3 w-3" fill="white" viewBox="0 0 24 24">
                    <path
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

              </div>

              <!-- Fecha de vencimiento -->
              <div style="background: rgba(35, 136, 255, 0.1); border: 1px solid #2388ff; border-radius: 8px; padding-bottom: 20px; padding-botton: 0px; margin: 15px 0; text-align: center;">
                <span style="color: #2388ff; font-size: 13px; font-weight: 500;">Fecha de vencimiento:</span>
                <span style="color: #2388ff; font-weight: bold; margin-left: 8px; font-size: 14px;">{{ formatDate(billData()?.factura?.fechaFin) || '' }}</span>
              </div>

              <div class="payment-totals-grid">
                <!-- Primeros 3 totales con colores específicos por nombre del servicio -->
                @for (tipo of getPrimeros3Totales(); track tipo.nombre; let i = $index) {
                  <div class="rounded-t-xl mt-[30px] text-center bg-white text-black relative overflow-hidden">
                    <!-- Header superior con texto y color -->
                    <div class="h-[25px] rounded-t-xl flex items-center justify-center text-xs font-medium text-white pb-3"
                         [ngClass]="{
                           'bg-[#74b9ff]': i === 0,
                           'bg-[#fac6d0]': i === 1,
                           'bg-[#fdcb6e]': i === 2
                         }">
                      {{ i === 0 ? 'Acueducto' : i === 1 ? 'Aseo' : 'Alcantarillado' }}
                    </div>
                    <!-- Contenido principal -->
                    <div class="hidden">{{ tipo.nombre }}</div>
                    <div class="text-base font-bold text-black py-2 pb-4 m-0 border-l border-r min-h-[40px] flex items-center justify-center"
                         [ngClass]="{
                           'border-[#74b9ff]': i === 0,
                           'border-[#fac6d0]': i === 1,
                           'border-[#fdcb6e]': i === 2
                         }">
                      {{ tipo.valor | colombianCurrency }}
                    </div>
                    <!-- Footer inferior con color -->
                    <div class="h-2"
                         [ngClass]="{
                           'bg-[#74b9ff]': i === 0,
                           'bg-[#fac6d0]': i === 1,
                           'bg-[#fdcb6e]': i === 2
                         }">
                    </div>
                  </div>
                }
                <!-- Cuarta tarjeta con total agrupado de otros servicios -->
                @if (tieneOtrosTotales()) {
                  <div class="rounded-t-xl mt-[30px] text-center bg-white text-black relative overflow-hidden">
                    <!-- Header superior para "Otros" -->
                    <div class="h-[25px] rounded-t-xl flex items-center justify-center text-xs font-medium text-white bg-[#5d6481] pb-3">
                      Otros
                    </div>
                    <!-- Contenido principal -->
                    <div class="hidden">Otros</div>
                    <div class="text-base font-bold text-black py-2 pb-4 m-0 border-l border-r border-[#5d6481] min-h-[40px] flex items-center justify-center">
                      {{ getTotalOtrosServicios() | colombianCurrency }}
                    </div>
                    <!-- Footer inferior -->
                    <div class="h-2 bg-[#5d6481]">
                    </div>
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

  dataDeuda = input<IDeudaClienteResponse | null>(null);
  showSuspensionNotice = true;
  selectedStatus = input<string | null>(null);
  billData = input<IBillDetailResponse | null>(null);
  valorDeuda = input<number>(0);
  private readonly enterpriseIdService = inject(EnterpriseIdService);
  private readonly deudaService = inject(DeudaService);

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

  // Array de colores para asignar secuencialmente
  private readonly serviceColors = ['#2388ff', '#ff8a9b', '#ffa726', '#6c7293'];
  private readonly serviceClasses = ['service-1', 'service-2', 'service-3', 'otros'];

  // Método simple: usar posición para asignar color
  getTarifaCardClassByPosition(index: number): string {
    return this.serviceClasses[index] || 'otros';
  }

  getTipoCardClassByPosition(index: number): string {
    const classes = ['acueducto-card', 'aseo-card', 'alcantarillado-card'];
    return classes[index] || 'otros-card';
  }

  // Obtener color por posición
  getServiceColor(index: number): string {
    return this.serviceColors[index] || this.serviceColors[3]; // Default 'otros'
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

  getMonthName(dateString: string | undefined): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return monthNames[date.getMonth()];
  }

  // Método auxiliar para reorganizar tarifas con posicionamiento específico
  private reorganizarTarifasConPosicionamiento(tarifas: any[]): any[] {
    const tarifasCopia = [...tarifas]; // Copia para no mutar el original
    const posicionesEspeciales = new Array(3).fill(null); // [pos0, pos1, pos2]
    const tarifasRestantes: any[] = [];

    // Reorganización de tarifas por posicionamiento

    // Buscar y posicionar servicios específicos
    for (let i = tarifasCopia.length - 1; i >= 0; i--) {
      const tarifa = tarifasCopia[i];
      const nombre = tarifa.nombre.toLowerCase();

      if (nombre.includes('acueducto')) {

        posicionesEspeciales[0] = tarifa;
        tarifasCopia.splice(i, 1);
      } else if (nombre.includes('alcantarillado')) {

        posicionesEspeciales[2] = tarifa;
        tarifasCopia.splice(i, 1);
      } else if (nombre.includes('aseo')) {

        posicionesEspeciales[1] = tarifa;
        tarifasCopia.splice(i, 1);
      }
    }

    // Llenar posiciones vacías con tarifas restantes
    let indiceTarifaRestante = 0;
    for (let i = 0; i < 3; i++) {
      if (posicionesEspeciales[i] === null && indiceTarifaRestante < tarifasCopia.length) {
        posicionesEspeciales[i] = tarifasCopia[indiceTarifaRestante];

        indiceTarifaRestante++;
      }
    }

    // Las tarifas que sobran van al final para "otros servicios"
    for (let i = indiceTarifaRestante; i < tarifasCopia.length; i++) {
      tarifasRestantes.push(tarifasCopia[i]);

    }

    // Crear array final
    const resultado = [...posicionesEspeciales.filter(tarifa => tarifa !== null), ...tarifasRestantes];



    return resultado;
  }

  // Métodos para manejar las tarifas limitadas
  getPrimeras3Tarifas() {
    const billData = this.billData();
    if (!billData?.tarifas) return [];

    const tarifasReorganizadas = this.reorganizarTarifasConPosicionamiento(billData.tarifas);

    // Debug removido para evitar spam en consola

    // Tomar los primeros 3 elementos del array reorganizado
    return tarifasReorganizadas.slice(0, 3);
  }

  getTarifasRestantes() {
    const billData = this.billData();
    if (!billData?.tarifas) return [];

    const tarifasReorganizadas = this.reorganizarTarifasConPosicionamiento(billData.tarifas);

    if (tarifasReorganizadas.length <= 3) return [];
    return tarifasReorganizadas.slice(3);
  }

  getConceptosAgrupados() {
    const tarifasRestantes = this.getTarifasRestantes();
    const conceptosAgrupados: any[] = [];

    tarifasRestantes.forEach((tarifa: any) => {
      if (tarifa.conceptos) {
        tarifa.conceptos.forEach((concepto: any) => {
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

  shouldUseDualColumn(conceptos: any[]): boolean {
    return conceptos && conceptos.length >= 4;
  }

  getFirstColumnItems(conceptos: any[]): any[] {
    if (!conceptos || conceptos.length < 4) {
      return conceptos || [];
    }

    return conceptos.slice(0, 4);
  }

  getSecondColumnItems(conceptos: any[]): any[] {
    if (!conceptos || conceptos.length < 5) {
      return [];
    }

    return conceptos.slice(4);
  }

  getPuntosPago(): IPuntoPago[] {
    const billData = this.billData();
    if ((billData?.empresa as any)?.puntosPago) {
      return (billData?.empresa as any)?.puntosPago;
    }

    return billData?.puntosPago || [];
  }

  getEmpresaCodigoQrImagen(): string | null {
    const billData = this.billData();
    return (billData?.empresa as any)?.codigoQr?.imagen || null;
  }
  hasEmpresaCodigoQr(): boolean {
    const result = !!this.getEmpresaCodigoQrImagen();
    return result;
  }
}
