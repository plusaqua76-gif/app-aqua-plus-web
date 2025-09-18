import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FacturaService } from '../../service/factura.service';
import { IEstado, IFactura } from '@interfaces/Ifactura';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadoService } from '../../service/estado.service';

@Component({
  selector: 'app-update-bill',
  standalone: true,
  imports: [CommonModule,  FormsModule],
  templateUrl: './update-bill.html',
  providers: [DatePipe]
})
export class UpdateBill implements OnInit {
  estado: IEstado[] = [];
  estadoName: string[] = [];
  selectedEstadoId: number | null = null;

  factura: IFactura | null = null;

  private readonly route = inject(ActivatedRoute);
  private readonly facturaService = inject(FacturaService);
  private readonly estadoService = inject(EstadoService);

  ngOnInit(): void {

    this.loadAllEstados();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.facturaService.getFacturaById(id).subscribe({
        next: (res) => {
          const factura = res.response;
          this.factura = {
            ...factura,
            estado: factura.estado || {
              id: 0,
              nombre: '',
              descripcion: '',
              activo: true,
              usuarioCreacion: '',
              fechaCreacion: new Date(),
              usuarioModificacion: null,
              fechaModificacion: null
            },
            lectura: factura.lectura || {
              id: 0,
              contador: { id: 0, nombre: '' },
              lectura: '',
              fechaLectura: new Date(),
              consumoAnormal: false,
              descripcion: '',
              activo: true,
              usuarioCreacion: '',
              fechaCreacion: new Date(),
              usuarioModificacion: null,
              fechaModificacion: null
            },
            fechaEmision: factura.fechaEmision ? this.formatDateToInput(factura.fechaEmision) : '',
            fechaFin: factura.fechaFin ? this.formatDateToInput(factura.fechaFin) : ''
          };
        },
        error: (err) => {
          console.error('Error cargando factura:', err);
        }
      });
    }
  }

  loadAllEstados(): void {
    this.estadoService.getAllEstado().subscribe((response) => {
      this.estado = response.response;
      this.estadoName = response.response.map((tipoDocumento) => tipoDocumento.nombre)
    })
  }

  onSubmit(): void {
  if (this.factura) {
    const estadoSeleccionado = this.estado.find(e => e.id === this.factura!.estado.id);
    if (estadoSeleccionado) {
      this.factura.estado = estadoSeleccionado;
    }

    this.factura.fechaEmision = this.formatDateToString(this.factura.fechaEmision);
    this.factura.fechaFin = this.formatDateToString(this.factura.fechaFin);

    this.facturaService.updateFactura(this.factura).subscribe({
      next: (res) => {
        console.log('Respuesta del servidor:', res);
        alert('Factura actualizada correctamente');
      },
      error: (err) => {
        console.error('Error al actualizar la factura:', err);
        alert('Error al actualizar la factura');
      }
    });
  } else {
    console.warn('No hay factura cargada');
  }
}
  private formatDateToInput(fecha: string | Date): string {
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDateToString(date: string | Date | null): string | null {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
