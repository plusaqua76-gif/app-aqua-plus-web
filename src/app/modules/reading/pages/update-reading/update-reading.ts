import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ILectura } from '@interfaces/Ifactura';
import { ToastService } from '@services/toast.service';
import { ReadingService } from '../../service/reading.service';

@Component({
  selector: 'app-update-reading',
  imports: [CommonModule, FormsModule],
  templateUrl: './update-reading.html',
  providers: [DatePipe]
})
export class UpdateReading implements OnInit {

  lectura: ILectura | null = null;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly readingService = inject(ReadingService);
  protected readonly toastService = inject(ToastService);

  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.readingService.getLecturaById(id).subscribe({
        next: (res) => {
          const lectura = res.response;
          this.lectura = {
            ...lectura,
            fechaLectura: lectura.fechaLectura ? this.formatDateToInput(lectura.fechaLectura) : ''

          };
        },
        error: (err) => {
          console.error('Error cargando factura:', err);
        }
      });
    }
  }

  onSubmit(): void {
  if (!this.lectura) {
    this.toastService.warning('Advertencia', 'No hay lectura cargada.');
    return;
  }

  this.lectura.fechaLectura = this.formatDateToString(this.lectura.fechaLectura);

  this.readingService.updateLectura(this.lectura).subscribe({
    next: (res) => {
      if (!res.success) {
        console.error('Error al actualizar lectura:', res.message);
        this.toastService.error(
          'Error al actualizar lectura',
          res.message || 'No se pudo actualizar la lectura.'
        );
      } else {
        console.log('Lectura actualizada correctamente:', res);
        this.toastService.success(
          'Éxito',
          'La lectura se actualizó correctamente.'
        );
        this.router.navigate(['reading']);
      }
    },
    error: (err) => {
      console.error('Error inesperado al actualizar lectura:', err);
      this.toastService.error(
        'Error inesperado',
        'No se pudo actualizar la lectura. Intente más tarde.'
      );
    }
  });
}


  private formatDateToInput(fecha: string | Date): string {
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

 private formatDateToString(date: string | Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

}
