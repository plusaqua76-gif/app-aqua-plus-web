import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EnterpriseClientCounterService } from '../../../client/service/enterpriseClientCounter.service';
import { PlazoPagoService } from '../../service/plazoPago.service';
import { ToastService } from '@services/toast.service';
import { PqrEnterprisesService } from '../../../pqr-client/services/pqr-enterprices.service';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { of, catchError, startWith, map, Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { CounterService } from '../../../client/service/couter.service';
import { IParametroGeneral } from '@interfaces/INovelty/IClienteNovedad';
import { TipoDeudaService } from '../../service/tipoDeuda.service';
import { ITipoDeuda } from '@interfaces/deuda/ITipoDeuda';
import { DeudaService } from '../../service/deuda.service';
import { IDeudaCliente } from '@interfaces/deuda/IDeudaCliente';
import { Router } from '@angular/router';
import { CounterEnterpriceService } from '../../../fee/services/counter-enterprice.service';
import { ClientRaw } from '@interfaces/client/IclientRaw';
import { IPaginationParams } from '@interfaces/IpaginatedResponse';
import { FacturaService } from '../../service/factura.service';
import { IEnterpriseClientCounter } from '@interfaces/IenterpriseClientCounter';


@Component({
  selector: 'app-create-debt',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './create-debt.html',
  standalone: true,
})
export class CreateDebt  {
  // Exponer Array para usar en el template
  protected readonly Array = Array;

  protected readonly toastService = inject(ToastService);
  protected readonly pqrService = inject(PqrEnterprisesService);
  protected platformId = inject(PLATFORM_ID);
  private readonly enterpriseClientCounterService = inject(EnterpriseClientCounterService);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly plazoPagoService = inject(PlazoPagoService);
  private readonly counterService = inject(CounterService);
  private readonly tipoDeudaService = inject(TipoDeudaService);
  private readonly deudaService = inject(DeudaService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly counterEnterpriceService = inject(CounterEnterpriceService);
  private readonly facturaService = inject(FacturaService);
  readonly procesandoDeuda = signal(false);

  // Propiedades para búsqueda de clientes
  searchTerm = '';
  private searchSubject = new Subject<string>();
  searchResults = signal<ClientRaw[]>([]);
  selectedClient = signal<ClientRaw | null>(null);
  showResults = signal(false);
  isSearching = signal(false);

  // Propiedades para contadores
  selectedCounter = signal<IEnterpriseClientCounter | null>(null);

  // Propiedades para búsqueda de facturas
  billTerm = signal('');
  selectedBill = signal<{ codigo: string; id: number } | null>(null);

  readonly deudaForm = this.fb.group({
    empresaClienteContadorId: [null, [Validators.required]],
    tipoDeudaId: [null, [Validators.required]],
    plazoPagoId: [null, [Validators.required]],
    facturaId: [null],
    fechaDeuda: [new Date().toISOString().split('T')[0], [Validators.required]],
    valor: ['', [Validators.required, Validators.min(0.01), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    estDeudaId: [null, []],
    fechaCobro: [null],
    descripcion: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(500)]]
  });

  readonly userData = computed(() => {
    if (!this.isBrowser) return null;
    try {
      const userDataString = sessionStorage.getItem('userData');
      if (!userDataString) return null;
      return JSON.parse(userDataString);
    } catch (e) {
      return null;
    }
  });

  readonly empresaId = computed(() => {
    const data = this.userData();
    return data?.empresaId || null;
  });

  readonly personaId = computed(() => {
    const data = this.userData();
    return data?.personaId || null;
  });

  readonly nombreUsuario = computed(() => {
    const data = this.userData();
    return data?.nombre || null;
  });

  constructor() {
    this.initClientSearch();
    effect(() => {
      const esPagoConAcuerdo = this.esPagoConAcuerdo();
      const plazoPagoControl = this.deudaForm.get('plazoPagoId');
      const fechaCobroControl = this.deudaForm.get('fechaCobro');
      if (esPagoConAcuerdo) {
        plazoPagoControl?.clearValidators();
        plazoPagoControl?.setValue(null);
        plazoPagoControl?.updateValueAndValidity({ emitEvent: false });
        fechaCobroControl?.setValidators([Validators.required]);
        fechaCobroControl?.updateValueAndValidity({ emitEvent: false });
      } else {
        plazoPagoControl?.setValidators([Validators.required]);
        plazoPagoControl?.updateValueAndValidity({ emitEvent: false });
        fechaCobroControl?.clearValidators();
        fechaCobroControl?.setValue(null);
        fechaCobroControl?.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  plazopago = rxResource({
    stream: () => this.plazoPagoService.getAllPlazoPago().pipe(
      catchError(error => {
        console.error('Error loading payment terms:', error);
        return of({ success: false, response: [], message: 'Error al cargar plazos de pago' });
      })
    )
  })

  tipodeuda = rxResource({
    stream: () => this.tipoDeudaService.getAllTipoDeuda().pipe(
      catchError(error => {
        console.error('Error loading debt types:', error);
        return of({ success: false, response: [], message: 'Error al cargar tipos de deuda' });
      })
    )
  })

  estDeuda = rxResource({
    params: () => ({ code: 'EST_DEUDA' }),
    stream: ({ params }) => {
      const { code } = params;
      if (!code) return of(null);
      return this.counterService.typeAforo(code).pipe(
        catchError(() => of(null))
      );
    }
  })

  // Obtener contadores del cliente seleccionado
  countersClient = rxResource({
    params: () => ({
      idEmpresa: this.empresaId(),
      idPersona: this.selectedClient()?.id || null
    }),
    stream: ({ params }) => {
      const { idEmpresa, idPersona } = params;
      if (!idEmpresa || !idPersona) {
        return of(null);
      }
      return this.enterpriseClientCounterService.getCountersByEmpresaPersona(idEmpresa, idPersona).pipe(
        catchError(error => {
          console.error('Error loading counters:', error);
          return of(null);
        })
      );
    }
  });

  // Búsqueda de facturas por código
  billcode = rxResource({
    params: () => ({
      term: this.billTerm(),
      counterId: this.selectedCounter()?.id || null
    }),
    stream: ({ params }) => {
      const { term, counterId } = params;
      if (!term || term.trim().length < 3 || !counterId) {
        return of(null);
      }
      return this.facturaService.getBillsByCounterAndCode(counterId, term).pipe(
        catchError(error => {
          console.error('Error searching bills:', error);
          return of(null);
        })
      );
    }
  });

  // Parámetro de interés de mora
  // parametroInteres = rxResource({
  //   params: () => ({
  //     empresaId: this.empresaId()
  //   }),
  //   stream: ({ params }) => {
  //     const { empresaId } = params;
  //     if (!empresaId) {
  //       return of(null);
  //     }
  //     return this.counterEnterpriceService.getParamsEnterprice(empresaId, 'INTERES_DEUDA').pipe(
  //       catchError(error => {
  //         console.error('Error loading interest parameter:', error);
  //         return of(null);
  //       })
  //     );
  //   }
  // });

  // Tasa de interés como número
  // readonly tasaInteres = computed(() => {
  //   const paramResponse = this.parametroInteres.value();
  //   if (!paramResponse) return 0;

  //   const param = Array.isArray(paramResponse.response)
  //     ? paramResponse.response[0]
  //     : paramResponse.response;

  //   return param?.valorParametro ? Number(param.valorParametro) : 0;
  // });

  // Valor del formulario reactivo
  private valorControl = toSignal(
    this.deudaForm.get('valor')!.valueChanges.pipe(
      startWith(this.deudaForm.get('valor')?.value),
      map(val => val ? Number(val) : 0)
    ),
    { initialValue: 0 }
  );

  // Plazo de pago reactivo
  private plazoPagoControl = toSignal(
    this.deudaForm.get('plazoPagoId')!.valueChanges.pipe(
      startWith(this.deudaForm.get('plazoPagoId')?.value)
    ),
    { initialValue: null }
  );

  // Estado de deuda reactivo
  private estDeudaIdControl = toSignal(
    this.deudaForm.get('estDeudaId')!.valueChanges.pipe(
      startWith(this.deudaForm.get('estDeudaId')?.value)
    ),
    { initialValue: null }
  );

  // True cuando se selecciona Acuerdo de Pago (con o sin factura)
  readonly esPagoConAcuerdo = computed(() => {
    const selectedId = this.estDeudaIdControl();
    if (!selectedId) return false;
    const options = this.estDeuda.value()?.response as IParametroGeneral[] | undefined;
    if (!options) return false;
    const selected = options.find(o => o.id === Number(selectedId));
    return selected?.codigo === 'PACOFA' || selected?.codigo === 'PASINFA';
  });

  readonly valorFormulario = computed(() => this.valorControl());

  // Lista de plazos de pago
  readonly plazoPagoOptions = computed(() => {
    return this.plazopago.value()?.response || [];
  });

  // Cálculo del interés
  // readonly valorInteres = computed(() => {
  //   const valor = this.valorFormulario();
  //   const tasa = this.tasaInteres();
  //   return valor * (tasa / 100);
  // });

  // Total con interés
  // readonly totalConInteres = computed(() => {
  //   return this.valorFormulario() + this.valorInteres();
  // });

  // Plazo de pago seleccionado (reactivo)
  readonly plazoSeleccionado = computed(() => {
    const plazoPagoId = this.plazoPagoControl();
    if (!plazoPagoId) {
      return null;
    }

    const plazo = this.plazoPagoOptions().find(p => p.nombre === plazoPagoId);
    return plazo || null;
  });

  // Extraer número de meses del plazo
  readonly numeroMeses = computed(() => {
    const plazo = this.plazoSeleccionado();

    if (!plazo) {
      return 0;
    }

    // Buscar número de meses en nombre o descripción
    const texto = `${plazo.nombre || ''} ${plazo.descripcion || ''}`;
    const match = texto.match(/(\d+)\s*mes/i);
    const meses = match ? parseInt(match[1], 10) : 0;

    return meses;
  });

  // Valor de cada cuota
  // readonly valorCuota = computed(() => {
  //   const total = this.totalConInteres();
  //   const meses = this.numeroMeses();
  //   return meses > 0 ? total / meses : 0;
  // });

  // Interés por cuota
  // readonly interesPorCuota = computed(() => {
  //   const interes = this.valorInteres();
  //   const meses = this.numeroMeses();
  //   return meses > 0 ? interes / meses : 0;
  // });

  // Capital por cuota
  readonly capitalPorCuota = computed(() => {
    const valor = this.valorFormulario();
    const meses = this.numeroMeses();
    return meses > 0 ? valor / meses : 0;
  });

  private initClientSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((term) => {
          if (term.length < 3) {
            this.searchResults.set([]);
            this.showResults.set(false);
            this.isSearching.set(false);
            return of(null);
          }

          this.isSearching.set(true);
          const empresaId = this.empresaId();

          if (!empresaId) {
            this.isSearching.set(false);
            return of(null);
          }

          const isNumeric = /^\d+$/.test(term.trim());

          const params: IPaginationParams = {
            page: 0,
            size: 10,
            filters: isNumeric
              ? { numeroCedula: term.trim() }
              : { nombreCompleto: term.trim() },
          };

          return this.enterpriseClientCounterService
            .getAllClientsByIdEnterprisePaginated(empresaId, params)
            .pipe(
              catchError((error) => {
                console.error('Error buscando clientes:', error);
                return of(null);
              })
            );
        })
      )
      .subscribe((response) => {
        this.isSearching.set(false);
        if (response?.response) {
          this.searchResults.set(response.response);
          this.showResults.set(true);
        } else {
          this.searchResults.set([]);
          this.showResults.set(false);
        }
      });
  }

  onSearchChange(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchSubject.next(term);
  }

  selectClient(cliente: ClientRaw): void {
    this.selectedClient.set(cliente);
    this.showResults.set(false);
    this.searchTerm = cliente.nombreCompleto || '';
    // Limpiar selecciones dependientes
    this.clearCounter();
    this.clearBill();
  }

  clearClient(): void {
    this.selectedClient.set(null);
    this.searchTerm = '';
    this.searchResults.set([]);
    this.showResults.set(false);
    this.clearCounter();
    this.clearBill();
    this.deudaForm.patchValue({
      empresaClienteContadorId: null
    });
  }

  // Métodos para contador
  selectCounter(counter: IEnterpriseClientCounter): void {
    this.selectedCounter.set(counter);
    // Actualizar el formulario con el ID del empresaClienteContador
    this.deudaForm.patchValue({
      empresaClienteContadorId: counter.id as any
    });
    // Limpiar la factura seleccionada
    this.clearBill();
  }

  clearCounter(): void {
    this.selectedCounter.set(null);
    this.clearBill();
  }

  // Métodos para factura
  onBillTermChange(value: string): void {
    this.billTerm.set(value);
    this.selectedBill.set(null);
  }

  selectBill(bill: { codigo: string; id: number }): void {
    this.selectedBill.set(bill);
    this.deudaForm.patchValue({
      facturaId: bill.id as any
    });
  }

  clearBill(): void {
    this.billTerm.set('');
    this.selectedBill.set(null);
    this.deudaForm.patchValue({
      facturaId: null
    });
  }

  shouldShowNoResultsMessage(): boolean {
    const billData = this.billcode.value();
    const term = this.billTerm();

    if (!term || term.trim().length < 3) {
      return false;
    }

    if (this.billcode.isLoading()) {
      return false;
    }

    if (this.billcode.error()) {
      return true;
    }

    if (!billData) {
      return true;
    }

    if (billData.response && billData.response.length === 0) {
      return true;
    }

    return false;
  }

  onSubmit(): void {
    if (this.deudaForm.invalid) {
      this.markFormGroupTouched();
      this.toastService.warning('Formulario inválido', 'Por favor complete todos los campos requeridos correctamente.');
      return;
    }

    this.procesandoDeuda.set(true);

    const formValue = this.deudaForm.value;
    const usuario = this.nombreUsuario();

    if (!usuario) {
      this.toastService.error('Error', 'No se pudo obtener la información del usuario');
      this.procesandoDeuda.set(false);
      return;
    }

    // Buscar los objetos completos para las relaciones
    const tipoDeudaSeleccionado = (this.tipodeuda.value()?.response as ITipoDeuda[] | undefined)?.find(
      (tipo: ITipoDeuda) => tipo.id === Number(formValue.tipoDeudaId)
    );

    const estDeudaSeleccionado = (this.estDeuda.value()?.response as IParametroGeneral[] | undefined)?.find(
      (est: IParametroGeneral) => est.id === Number(formValue.estDeudaId)
    );

    const plazoPagoSeleccionado = this.plazopago.value()?.response?.find(
      plazo => formValue.plazoPagoId && plazo.nombre === formValue.plazoPagoId
    );

    const esPagoConAcuerdo = this.esPagoConAcuerdo();

    if (!tipoDeudaSeleccionado || (!esPagoConAcuerdo && !plazoPagoSeleccionado)) {
      this.toastService.error('Error', 'No se pudieron obtener los datos necesarios');
      this.procesandoDeuda.set(false);
      return;
    }

    // Verificar que haya un contador seleccionado
    const contadorSeleccionado = this.selectedCounter();

    if (!contadorSeleccionado) {
      this.toastService.error('Error', 'Debe seleccionar un contador');
      this.procesandoDeuda.set(false);
      return;
    }

    // Calcular el valor total con interés
    const valorBase = Number(formValue.valor);
    // const tasaInteres = this.tasaInteres();
    // const valorInteres = valorBase * (tasaInteres / 100);
    // const valorTotal = valorBase + valorInteres;

    // Construir objeto deuda con payload limpio y correcto
    const deuda: Partial<IDeudaCliente> & { fechaCobro?: Date } = {
      empresaClienteContador: { id: contadorSeleccionado.id },
      tipoDeuda: { id: tipoDeudaSeleccionado.id },
      ...(plazoPagoSeleccionado ? { plazoPago: plazoPagoSeleccionado.nombre } : {}),
      fechaDeuda: new Date(formValue.fechaDeuda!),
      ...(esPagoConAcuerdo && formValue.fechaCobro ? { fechaCobro: new Date(formValue.fechaCobro) } : {}),
      valor: valorBase, // Enviar como número, no string
      descripcion: formValue.descripcion!,
      activo: true,
      usuarioCreacion: usuario
      // fechaCreacion, usuarioCambio y fechaCambio los genera el backend
    };

    // Agregar factura si fue seleccionada
    const facturaSeleccionada = this.selectedBill();
    if (facturaSeleccionada) {
      deuda.factura = { id: facturaSeleccionada.id };
    }

    this.deudaService.saveDeuda(deuda as IDeudaCliente).subscribe({
      next: (response) => {
        const mensajeFactura = facturaSeleccionada
          ? ` asociada a la factura ${facturaSeleccionada.codigo}`
          : '';
        this.toastService.success(
          'Deuda Creada',
          `La deuda por valor de $${valorBase.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${mensajeFactura} ha sido creada exitosamente`
        );
        this.resetForm();
        this.procesandoDeuda.set(false);
      },  
      error: (error) => {
        console.error('Error al crear deuda:', error);
        this.procesandoDeuda.set(false);
      }
    });
  }

  cancelar(): void {
    this.resetForm();
    this.router.navigate(['/shell/bill/customer-debt']);
  }

  private resetForm(): void {
    this.deudaForm.reset({
      fechaDeuda: new Date().toISOString().split('T')[0]
    });
    this.clearClient();
    this.procesandoDeuda.set(false);
  }

  private markFormGroupTouched(): void {
    for (const key of Object.keys(this.deudaForm.controls)) {
      const control = this.deudaForm.get(key);
      control?.markAsTouched();
    }
  }

}

