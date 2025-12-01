import { Component, computed, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeudaService } from '../../service/deuda.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EnterpriseClientCounterService } from '../../../client/service/enterpriseClientCounter.service';
import { TipoDeudaService } from '../../service/tipoDeuda.service';
import { FacturaService } from '../../service/factura.service';
import { PlazoPagoService } from '../../service/plazoPago.service';
import { IDeudaCliente, IPlazoPago, ITipoDeuda } from '@interfaces/IdeudaFactura';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { IEnterpriseClientCounter } from '@interfaces/IenterpriseClientCounter';
import { IFactura, IfacturaResponse } from '@interfaces/Ifactura';
import { ToastService } from '@services/toast.service';
import { ApiResponse } from '@interfaces/Iresponse';

@Component({
  selector: 'app-update-debt',
  imports: [CommonModule,  FormsModule, ReactiveFormsModule ],
  templateUrl: './update-debt.html',
})
export class UpdateDebt implements OnInit {
  registerForm!: FormGroup;
  deudaId!: number;


  empresaClienteContador: IEnterpriseClientCounter[] = [];
  tipoDeuda: ITipoDeuda[] = [];
  factura: IFactura[] = [];
  facturas: IfacturaResponse[] = [];
  plazoPago: IPlazoPago[] = [];

  protected fb = inject(FormBuilder);
  protected deudaService = inject(DeudaService);
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected enterpriseClientCounterService = inject(EnterpriseClientCounterService);
  protected tipoDeudaService = inject(TipoDeudaService);
  protected facturaService = inject(FacturaService);
  protected plazoPagoService = inject(PlazoPagoService);
  protected readonly toast = inject(ToastService);
    protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

  ngOnInit(): void {
    this.deudaId = +this.route.snapshot.paramMap.get('id')!;
    this.initializeForm();
    this.loadAllClientes();
    this.loadTipoDeuda();
    this.loadPlazoPago();

    this.registerForm.get('empresaClienteContador')?.valueChanges.subscribe(selectedCliente => {
      const empresaClienteContadorId = selectedCliente?.id;
      if (empresaClienteContadorId) {
        this.loadFacturasPorCliente(empresaClienteContadorId);
      } else {
        this.facturas = [];
      }
    });
    this.deudaService.getDeudaById(this.deudaId).subscribe({
      next: (data) => {
        const deudaResponse = data.response;
        this.registerForm.patchValue({
          fechaDeuda: deudaResponse.fechaDeuda,
          valor: deudaResponse.valor,
          descripcion: deudaResponse.descripcion
        });
        const selectedEmpresaClienteContador = this.empresaClienteContador.find(c => c.id === deudaResponse.empresaClienteContador.id);
        if (selectedEmpresaClienteContador) {
          this.registerForm.get('empresaClienteContador')?.patchValue(selectedEmpresaClienteContador);
          this.loadFacturasPorCliente(selectedEmpresaClienteContador.id, deudaResponse.factura.id);
        }
        const selectedTipoDeuda = this.tipoDeuda.find(t => t.id === deudaResponse.tipoDeuda.id);
        if (selectedTipoDeuda) {
          this.registerForm.get('tipoDeuda')?.patchValue(selectedTipoDeuda);
        }
        const selectedPlazoPago = this.plazoPago.find(p => p.id === deudaResponse.plazoPago);
        if (selectedPlazoPago) {
          this.registerForm.get('plazoPago')?.patchValue(selectedPlazoPago);
        }
      },
      error: (err) => {
        console.error('Error cargando la deuda:', err);
        this.toast.error('Error', 'Error cargando la deuda.');
      }
    });
  }

    readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (e) {
      console.error('Error parsing userData from sessionStorage:', e);
      return null;
    }
  });

  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });

  initializeForm(): void {
    this.registerForm = this.fb.group({
      empresaClienteContador: [null, Validators.required],
      tipoDeuda: [null, Validators.required],
      factura: [null, Validators.required],
      plazoPago: [null, Validators.required],
      fechaDeuda: ['', Validators.required],
      valor: ['', Validators.required],
      descripcion: ['']
    });
  }


  loadFacturasPorCliente(empresaClienteContadorId: number, facturaIdToSelect?: number): void {
    this.facturaService.getFacturAll().subscribe((response: ApiResponse<IfacturaResponse[]>) => {
      this.facturas = response.response.filter(fac => fac.empresaClienteContadorId === empresaClienteContadorId);

      if (facturaIdToSelect) {
        const facturaSeleccionada = this.facturas.find(f => f.id === facturaIdToSelect);
        if (facturaSeleccionada) {
          this.registerForm.get('factura')?.patchValue(facturaSeleccionada);
        }
      }
    });
  }

  loadTipoDeuda(): void {
    this.tipoDeudaService.getAllTipoDeuda().subscribe(response => {
      this.tipoDeuda = response.response;
    });
  }

  loadPlazoPago(): void {
    this.plazoPagoService.getAllPlazoPago().subscribe(response => {
      this.plazoPago = response.response;
    });
  }

  loadAllClientes(): void {
    this.enterpriseClientCounterService.getAllCLiente().subscribe(response => {
      this.empresaClienteContador = response.response;
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.toast.warning('Formulario inválido', 'Por favor complete los campos correctamente.');
      return;
    }

    const rawForm = this.registerForm.value;

    const deuda: IDeudaCliente = {
      ...rawForm,
      id: this.deudaId,
      empresaClienteContador: rawForm.empresaClienteContador,
      tipoDeuda: rawForm.tipoDeuda,
      factura: rawForm.factura,
      plazoPago: rawForm.plazoPago.id, // Solo enviar el ID

      valor: parseFloat(rawForm.valor),
      usuarioModificacion: this.nombreUsuario(),
      fechaModificacion: new Date()
    };

    this.deudaService.updateDeuda(deuda).subscribe({
      next: () => {
        this.toast.success('Éxito', 'La deuda se actualizó correctamente.');
        this.router.navigate(['../customer-debt'], {
          relativeTo: this.route,
        });
      },
      error: (err) => {
        console.error('Error al actualizar deuda:', err);
        this.toast.error('Error al actualizar', 'No se pudo actualizar la deuda. Intente más tarde.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/shell/bill/customer-debt']);
  }

}
