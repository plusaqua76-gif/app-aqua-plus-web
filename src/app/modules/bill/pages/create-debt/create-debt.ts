import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { IDeudaCliente, IPlazoPago, ITipoDeuda } from '@interfaces/IdeudaFactura';
import { IEnterpriseClientCounter } from '@interfaces/IenterpriseClientCounter';
import { EnterpriseClientCounterService } from '../../../client/service/enterpriseClientCounter.service';
import { TipoDeudaService } from '../../service/tipoDeuda.service';
import { DeudaService } from '../../service/deuda.service';
import { Router, ActivatedRoute } from '@angular/router';
import { IFactura, IfacturaResponse } from '@interfaces/Ifactura';
import { FacturaService } from '../../service/factura.service';
import { PlazoPagoService } from '../../service/plazoPago.service';
import { ToastService } from '@services/toast.service';
import { ApiResponse } from '@interfaces/Iresponse';


@Component({
  selector: 'app-create-debt',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './create-debt.html',

})
export class CreateDebt implements OnInit {
  deudaId!: number;
  registerForm!: FormGroup;
  showSuccessMessage = false;

  empresaClienteContador: IEnterpriseClientCounter[] = [];
  empresaClienteContadorName: string[] = [];

  tipoDeuda: ITipoDeuda[] = [];
  tipoDeudaName: string[] = [];

  factura: IFactura[] = [];
  facturaName: string[] = [];

  facturas: IfacturaResponse[] = [];

  plazoPago: IPlazoPago[] = [];
  plazoPagoName: string[] = [];

  selectedClienteId: number | null = null;
  selectTipoDeudaId: number | null = null;
  selectFacturaId: number | null = null;
  selectPlazoPagoId: number | null = null;

  protected readonly fb = inject(FormBuilder);
  protected readonly enterpriseClientCounterService = inject(EnterpriseClientCounterService);
  protected readonly tipoDeudaService = inject(TipoDeudaService);
  protected readonly deudaService = inject(DeudaService);
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly plazoPagoService = inject(PlazoPagoService);
  protected readonly facturaService = inject(FacturaService);
  protected readonly toast = inject(ToastService);
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

 ngOnInit(): void {
    this.initializeForm();
    this.loadAllClientes();
    this.loadTipoDeuda();
    this.loadPlazoPago();

    this.registerForm.get('empresaClienteContador')?.valueChanges.subscribe(selectedCliente => {
      if (selectedCliente && selectedCliente.id) {
        const clienteId = selectedCliente.id;
        this.loadFacturasPorCliente(clienteId);
      } else {
        this.facturas = [];
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

    readonly empresaId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  });


  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });


  private initializeForm(): void {
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

  loadFacturasPorCliente(empresaClienteContadorId: number): void {
    this.facturaService.getFacturAll().subscribe((response: ApiResponse<IfacturaResponse[]>) => {

      const facturasFiltradas = response.response.filter(fac =>
        fac.empresaClienteContadorId === empresaClienteContadorId
      );

      this.facturas = [...facturasFiltradas];
    });
  }


  loadPlazoPago(): void {
    this.plazoPagoService.getAllPlazoPago().subscribe((response) => {
      this.plazoPago = response.response;
      this.plazoPagoName = response.response.map((plazoPago) => plazoPago.nombre)
    })
  }
  loadTipoDeuda(): void {
    this.tipoDeudaService.getAllTipoDeuda().subscribe((response) => {
      this.tipoDeuda = response.response;
      this.tipoDeudaName = response.response.map((tipoDeuda) => tipoDeuda.nombre)
    })
  }
  loadAllClientes(): void {
    this.enterpriseClientCounterService.getAllCLiente().subscribe((response) => {
      this.empresaClienteContador = response.response;
      this.empresaClienteContadorName = response.response.map((empresaClienteContador) => empresaClienteContador.cliente.nombre)
    })
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.toast.warning('Formulario inválido', 'Revisa los campos requeridos.');
      return;
    }

    const rawForm = this.registerForm.value;
    const nombreUsuario = this.nombreUsuario()
    const fechaDeuda: string = rawForm.fechaDeuda;

    const deuda: IDeudaCliente = {
      ...rawForm,
      fechaDeuda: fechaDeuda,
      valor: parseFloat(rawForm.valor),
      activo: true,
      usuarioCreacion: nombreUsuario,
      fechaCreacion: new Date(),
    };

    this.deudaService.saveDeuda(deuda).subscribe({
      next: (res) => {
        this.toast.success('Deuda registrada correctamente.', 'Éxito');
        this.router.navigate(['../customer-debt'], {
          relativeTo: this.route,
        });
      },
      error: (err) => {
        console.error('Error al guardar deuda:', err);
        this.toast.error('Ocurrió un error al guardar la deuda.', 'Error');
      }
    });
  }
}

