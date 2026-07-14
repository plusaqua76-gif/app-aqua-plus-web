import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { EnterpriseIdService } from '@services/enterpriceId.service';
import { ColombianCurrencyPipe } from '@shared/pipes/colombian-currency.pipe';
import { IAbonoReceiptData } from '@interfaces/abono/IAbonoReceipt';

@Component({
  selector: 'app-abono-receipt',
  standalone: true,
  imports: [CommonModule, ColombianCurrencyPipe],
  templateUrl: './abono-receipt.html',
  styleUrl: './abono-receipt.css',
})
export class AbonoReceipt {
  receiptData = input<IAbonoReceiptData | null>(null);

  private readonly enterpriseIdService = inject(EnterpriseIdService);

  readonly enterpriseInfo = rxResource({
    stream: () => this.enterpriseIdService.getEnterpriseInfo(),
  });

  readonly logoSrc = computed(() => {
    const info = this.enterpriseInfo.value();
    if (!info) return null;

    if (info.imagenEmpresa) {
      return info.imagenEmpresa as string;
    }

    const imagen = Array.isArray(info.imagen) ? info.imagen[0] : null;
    if (!imagen?.imagen) return null;

    const contentType = imagen.contentType || (imagen.extension ? `image/${imagen.extension}` : 'image/png');
    return `data:${contentType};base64,${imagen.imagen}`;
  });

  getFecha(): string {
    const fecha = this.receiptData()?.fecha;
    if (!fecha) return '';

    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  getHora(): string {
    const fecha = this.receiptData()?.fecha;
    if (!fecha) return '';

    return new Date(fecha).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }

  getDireccionCompleta(): string {
    const info = this.enterpriseInfo.value();
    if (!info?.direccion) return '';

    const dir = info.direccion;
    if (typeof dir === 'string') return dir;
    if (dir.descripcion) return dir.descripcion;

    const partes = [
      dir.corregimiento?.nombre,
      dir.ciudad?.nombre,
      dir.departamento?.nombre,
    ].filter(Boolean);

    return partes.join(', ');
  }
}
