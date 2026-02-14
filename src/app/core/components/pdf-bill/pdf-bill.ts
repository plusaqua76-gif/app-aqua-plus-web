import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LegendsHistoryBill } from '../charts/legens-bill-history';
import { rxResource } from '@angular/core/rxjs-interop';
import { EnterpriseIdService } from '@services/enterpriceId.service';
import { IBillDetailResponse, IPuntoPago } from '@interfaces/Ibill-detail';
import { ColombianCurrencyPipe } from '@shared/pipes/colombian-currency.pipe';
import { DeudaService } from '../../../modules/bill/service/deuda.service';
import { IDeudaClienteResponse } from '@interfaces/IdeudaFactura';

@Component({
  selector: 'app-pdf-bill',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LegendsHistoryBill,
    ColombianCurrencyPipe,
  ],
  styleUrls: ['./pdf-bill.css'],
  templateUrl: './pdf-bill.html',
})
export class PdfBill {
  dataDeuda = input<IDeudaClienteResponse | null>(null);
  dataDeudaConsolidada = input<any>(null);
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

    return Object.entries(billData.totalesTarifas.porTipo).map(
      ([nombre, valor]) => ({
        nombre,
        valor,
      })
    );
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
  private reorganizarTotalesConPosicionamiento(totales: any[]): any[] {
    const totalesCopia = [...totales];
    const posicionesEspeciales = new Array(3).fill(null);
    const totalesRestantes: any[] = [];

    for (let i = totalesCopia.length - 1; i >= 0; i--) {
      const total = totalesCopia[i];
      const nombre = total.nombre.toLowerCase();

      if (nombre.includes('acueducto')) {
        posicionesEspeciales[0] = total;
        totalesCopia.splice(i, 1);
      } else if (nombre.includes('alcantarillado')) {
        posicionesEspeciales[2] = total;
        totalesCopia.splice(i, 1);
      } else if (nombre.includes('aseo')) {
        posicionesEspeciales[1] = total;
        totalesCopia.splice(i, 1);
      }
    }

    let indiceTotalRestante = 0;
    for (let i = 0; i < 3; i++) {
      if (
        posicionesEspeciales[i] === null &&
        indiceTotalRestante < totalesCopia.length
      ) {
        posicionesEspeciales[i] = totalesCopia[indiceTotalRestante];
        indiceTotalRestante++;
      }
    }

    for (let i = indiceTotalRestante; i < totalesCopia.length; i++) {
      totalesRestantes.push(totalesCopia[i]);
    }

    const resultado = [
      ...posicionesEspeciales.filter((total) => total !== null),
      ...totalesRestantes,
    ];

    return resultado;
  }

  getPrimeros3Totales() {
    const totales = this.getTotalesPorTipo();
    const totalesReorganizados = this.reorganizarTotalesConPosicionamiento(totales);
    return totalesReorganizados.slice(0, 3);
  }

  getTotalesRestantes() {
    const totales = this.getTotalesPorTipo();
    const totalesReorganizados = this.reorganizarTotalesConPosicionamiento(totales);
    if (totalesReorganizados.length <= 3) return [];
    return totalesReorganizados.slice(3);
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
  private readonly serviceClasses = [
    'service-1',
    'service-2',
    'service-3',
    'otros',
  ];

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
    if (!dateString) return '';
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
    return `${dir.ciudadNombre || ''}, ${
      dir.corregimientoNombre || ''
    } ${dir.descripcion || ''}`;
  }

  getDirectionCompleteCounter(): string {
    const billData = this.billData();
    if (!billData?.contador?.direccion) return '';
    const dir = billData.contador.direccion;
    return `${
      dir.corregimientoNombre || ''
    } ${dir.descripcion || ''}`;
  }

  getMonthName(dateString: string | undefined): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    return monthNames[date.getMonth()];
  }

  private reorganizarTarifasConPosicionamiento(tarifas: any[]): any[] {
    const tarifasCopia = [...tarifas];
    const posicionesEspeciales = new Array(3).fill(null);
    const tarifasRestantes: any[] = [];

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

    let indiceTarifaRestante = 0;
    for (let i = 0; i < 3; i++) {
      if (
        posicionesEspeciales[i] === null &&
        indiceTarifaRestante < tarifasCopia.length
      ) {
        posicionesEspeciales[i] = tarifasCopia[indiceTarifaRestante];

        indiceTarifaRestante++;
      }
    }

    for (let i = indiceTarifaRestante; i < tarifasCopia.length; i++) {
      tarifasRestantes.push(tarifasCopia[i]);
    }

    const resultado = [
      ...posicionesEspeciales.filter((tarifa) => tarifa !== null),
      ...tarifasRestantes,
    ];

    return resultado;
  }

  getPrimeras3Tarifas() {
    const billData = this.billData();
    if (!billData?.tarifas) return [];

    const tarifasReorganizadas = this.reorganizarTarifasConPosicionamiento(
      billData.tarifas
    );

    return tarifasReorganizadas.slice(0, 3);
  }

  getTarifasRestantes() {
    const billData = this.billData();
    if (!billData?.tarifas) return [];

    const tarifasReorganizadas = this.reorganizarTarifasConPosicionamiento(
      billData.tarifas
    );

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
            tarifaNombre: tarifa.nombre,
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

  // Método para determinar la clase del grid según la cantidad de puntos de pago
  getPuntosGridClass(): string {
    const puntosPago = this.getPuntosPago();
    if (!puntosPago || puntosPago.length === 0) {
      return 'puntos-grid-empty';
    }
    if (puntosPago.length === 1) {
      return 'puntos-grid-single';
    }
    return 'puntos-grid-double';
  }
}
