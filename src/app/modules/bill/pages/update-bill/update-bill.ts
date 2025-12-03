import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FacturaService, ReadingUpdate } from '../../service/factura.service';
import { IEstado, IFactura } from '@interfaces/Ifactura';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadoService } from '../../service/estado.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-update-bill',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-bill.html',
  providers: [DatePipe]
})
export class UpdateBill implements OnInit {
  factura: IFactura | null = null;
  consumo = signal<number>(0);
  isSubmitting = signal<boolean>(false);
  lecturaId = signal<number | null>(null);
  isLoading = signal<boolean>(true);
  loadError = signal<string | null>(null);

  protected readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly facturaService = inject(FacturaService);
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const data = sessionStorage.getItem('userData');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  });

  readonly usuarioModificacion = computed(() => {
    const data = this.userData();
    return data?.nombre || 'admin';
  });


  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (!id || isNaN(id)) {
      this.loadError.set('ID de factura inválido');
      this.isLoading.set(false);
      this.toast.error('Error', 'ID de factura inválido');
      setTimeout(() => this.goBack(), 2000);
      return;
    }

    this.route.queryParams.subscribe(params => {
      if (params['lecturaId']) {
        this.lecturaId.set(Number(params['lecturaId']));
      }
      if (params['consumoActual']) {
        this.consumo.set(Number(params['consumoActual']));
      }
    });

    this.facturaService.getFacturaById(id).subscribe({
      next: (res) => {
        const factura = res.response;
        this.factura = factura;
        
        if (!this.lecturaId() && factura?.lectura?.id) {
          this.lecturaId.set(factura.lectura.id);
        }
        
        if (this.consumo() === 0) {
          if (factura?.lectura?.lectura) {
            this.consumo.set(Number(factura.lectura.lectura));
          } else if (factura?.consumo) {
            this.consumo.set(Number(factura.consumo));
          }
        }
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando factura:', err);
        this.loadError.set('No se pudo cargar la factura');
        this.isLoading.set(false);
        this.toast.error('Error', 'No se pudo cargar la factura');
        setTimeout(() => this.goBack(), 3000);
      }
    });
  }

  onSubmit(): void {
    const lecturaIdValue = this.lecturaId();

    if (!lecturaIdValue) {
      this.toast.error('Error', 'No se pudo identificar el ID de la lectura');
      return;
    }

    const consumoValue = this.consumo();
    if (consumoValue <= 0) {
      this.toast.warning('Validación', 'El consumo debe ser mayor a 0');
      return;
    }

    this.isSubmitting.set(true);

    const readingUpdate: ReadingUpdate = {
      id: lecturaIdValue,
      lectura: consumoValue,
      usuarioModificacion: this.usuarioModificacion()
    };

    this.facturaService.updateReading(readingUpdate).subscribe({
      next: (res) => {
        this.toast.success('Éxito', 'Consumo actualizado correctamente');
        this.isSubmitting.set(false);
        setTimeout(() => {
          this.goBack();
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
