import {
  Component,
  computed,
  inject,
  PLATFORM_ID,
  signal,
  AfterViewInit,
  ViewChild,
  effect,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { RateTypeService } from '../../services/rate-type.service';
import { PopupComponent } from '../../../../shared/components/popUp';
import { RateTypesListComponent } from '../../components/rate-types-list.component';
import { TypeConceptsListComponent } from '../../components/type-concepts-list.component';
import { UseTypesListComponent } from '../../components/use-types-list.component';
import { ConceptRateEnterpice } from '../fee-enterprice/concept-rate-enterpice';
import { PaymentPoints } from '../payment-points/payment-points';
import { CounterEnterprice } from '../company-accountant-reading/counter-enterprice';
import { IrateTypes } from '@interfaces/IrateTypes';
import { ToastService } from '@services/toast.service';
import { TypeConceptService } from '../../services/type-concept.service';
import { ConceptRateService } from '../../services/concept-rate.service';
import { EMPTY, of, catchError, forkJoin } from 'rxjs';
import {
  Estrato,
  NuevoItem,
} from '../../../../core/interfaces/tipo-tarifa/ITarifaItem';
import { EstratoConcepto } from '../../../../core/interfaces/IConceptoEstrato';
import { BackFill } from '../../components/drag-and-drop/back-fill';
import { error } from 'console';
import { UseService } from '../../services/use.service';
import { CounterEnterpriceService } from '../../services/counter-enterprice.service';
import { TransversalRate } from '../transversal-rate/transversalRate';
import { BillValidityParameters } from '../bill-validity-parameters/bill-validity-parameters';
import { Checkbox } from '../../../../shared/components/checkbox';

// esto es mala practica, nosotros ya tenemos creado una interface IrateTypes en core/interfaces/IrateTypes.ts

@Component({
  selector: 'app-fee',
  imports: [
    CommonModule,
    FormsModule,
    PopupComponent,
    RateTypesListComponent,
    TypeConceptsListComponent,
    UseTypesListComponent,
    ConceptRateEnterpice,
    PaymentPoints,
    CounterEnterprice,
    BackFill,
    TransversalRate,
    BillValidityParameters,
    Checkbox,
  ],
  styleUrls: ['./fee.css'],
  templateUrl: './fee.html',
})
export class FeeComponent implements AfterViewInit {
  @ViewChild(ConceptRateEnterpice)
  conceptRateEnterpiceComponent?: ConceptRateEnterpice;

  protected readonly rateTypeService = inject(RateTypeService);
  protected readonly toastService = inject(ToastService);
  protected readonly useService = inject(UseService);
  protected readonly router = inject(Router);
  protected typeConceptService = inject(TypeConceptService);
  protected conceptRateService = inject(ConceptRateService);
  protected counterEnterpriceService = inject(CounterEnterpriceService);
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

  // Tab navigation
  activeTab = signal<string>('fee-rate');

  selectedTipoTarifa: any = null;
  selectedTipoConcepto: any = null;
  selectedTipoUso: any = null;
  valorTarifa: number | null = null;
  mostrarTablaEstratos: boolean = false;
  estratosActuales: Estrato[] = [];
  nuevoEstratoNumero: number = 1;
  nuevoEstratoValor: number | null = null;
  guardandoTarifa = signal(false);
  cargandoEstratos = signal(false);
  indCalcularMc = signal(false);
  indAplicarRango = signal(false);
  valorRango = signal<number | null>(null);

  showPopupVisualizarTarifas = signal(false);
  showDeleteConfirm = signal(false);
  rateTypeToDelete: IrateTypes | null = null;

  // aqui se repiten estos dos elementos , por el momento los dejo asi si llegan a cambiar se donde puedo especificamente asignarles la psopiedades teniendo en cuenta qeu comparten la misma interfaz
  showPopupTipoTarifa = signal(false);
  guardandoTipoTarifa = signal(false);
  editandoTipoTarifa = signal(false);
  rateTypeToEdit: IrateTypes | null = null;
  nuevoTipoTarifa: NuevoItem = {
    nombre: '',
    descripcion: '',
  };

  showPopupTipoConcepto = signal(false);
  guardandoTipoConcepto = signal(false);
  editandoTipoConcepto = signal(false);
  typeConceptToEdit: IrateTypes | null = null;
  nuevoTipoConcepto: NuevoItem = {
    nombre: '',
    descripcion: '',
  };

  showPopupVisualizarConceptos = signal(false);
  showPopupConceptosTarifaEmpresa = signal(false);

  showDeleteConfirmConcept = signal(false);
  typeConceptToDelete: IrateTypes | null = null;

  // Tipo de Uso properties
  showPopupTipoUso = signal(false);
  guardandoTipoUso = signal(false);
  editandoTipoUso = signal(false);
  useTypeToEdit: any = null;
  valorUnitario = signal<number | null>(null);
  valorComplementario = signal<number | null>(null);
  valorBasico = signal<number | null>(null);
  nuevoTipoUso: NuevoItem = {
    nombre: '',
    descripcion: '',
  };

  showPopupVisualizarUsos = signal(false);
  showDeleteConfirmUse = signal(false);
  useTypeToDelete: any = null;

  showDeleteConfirmEstrato = signal(false);
  estratoToDelete: Estrato | null = null;

  showSaveConfirm = signal(false);

  showGuidePopup = signal(false);

  consumoMinimo = signal<number>(0);
  consumoMaximo = signal<number>(0);
  guardandoParametrosConsumo = signal(false);
  codigosTarifaConsumo = signal<string[]>([]);
  cargandoParametrosConsumo = signal(false);

  tipoServicio = computed(() => {
    const codigos = this.codigosTarifaConsumo();
    if (codigos.length === 0) return '';

    const primerCodigo = codigos[0];
    const prefijo = primerCodigo.substring(0, 3).toUpperCase();

    if (prefijo === 'ACU') return 'Acueducto';
    if (prefijo === 'ALC') return 'Alcantarillado';
    return 'Servicio';
  });

  paramConsumptionIds = {
    CONBAS: undefined as number | undefined,
    CONCON: undefined as number | undefined,
    CONSUN: undefined as number | undefined,
  };

  rangosConsumo = computed(() => {
    const minimo = this.consumoMinimo();
    const maximo = this.consumoMaximo();

    return {
      CONBAS: `0 - ${minimo}`,
      CONCON: `${minimo + 1} - ${maximo - 1}`,
      CONSUN: `${maximo} en adelante`
    };
  });

  constructor() {
    effect(() => {
      const paramsData = this.consumptionParamsData();

      if (paramsData && paramsData.length > 0) {
        // Extraer valores de los parámetros
        const CONBASParam = paramsData.find(p => p.key === 'CONBAS');
        const CONCOMParam = paramsData.find(p => p.key === 'CONCOM');

        if (CONBASParam?.value && CONBASParam.value !== '') {
          // CONBAS tiene formato "0-15", extraer el valor máximo
          const parts = CONBASParam.value.split('-');
          if (parts.length === 2) {
            const minValue = parseInt(parts[1]);
            if (!isNaN(minValue)) {
              this.consumoMinimo.set(minValue);
            }
          }
        }

        if (CONCOMParam?.value && CONCOMParam.value !== '') {
          // CONCOM tiene formato "15-50", extraer el valor máximo
          const parts = CONCOMParam.value.split('-');
          if (parts.length === 2) {
            const maxValue = parseInt(parts[1]);
            if (!isNaN(maxValue)) {
              this.consumoMaximo.set(maxValue);
            }
          }
        }
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

  typeUse = rxResource({
    params: () => ({
      enterpriseId: this.empresaId(),
    }),
    stream: ({ params }) => {
      if (!params.enterpriseId) {
        return of(null);
      }
      return this.useService.getTypeUse(params.enterpriseId).pipe(
        catchError((error) => {
          return of(null);
        }),
      );
    },
  });

  typeRates = rxResource({
    params: () => ({ enterpriseId: this.empresaId() }),
    stream: ({ params: { enterpriseId } }) =>
      enterpriseId
        ? this.rateTypeService.getRateTypes(enterpriseId).pipe(
            catchError((error) => {
              return of({
                success: false,
                response: [],
                message: 'Error al cargar tipos de tarifa',
              });
            }),
          )
        : EMPTY,
  });

  typeRatesData = computed(() => {
    try {
      const value = this.typeRates.value();
      return value?.response ?? [];
    } catch (error) {
      return [];
    }
  });

  typeUseData = computed(() => {
    try {
      const value = this.typeUse.value();
      return value?.response ?? [];
    } catch (error) {
      return [];
    }
  });

  dataTypeConcepts = rxResource({
    params: () => ({ enterpriseId: this.empresaId() }),
    stream: ({ params: { enterpriseId } }) =>
      enterpriseId
        ? this.typeConceptService.getAllTypeConcepts(enterpriseId).pipe(
            catchError((error) => {
              return of({
                success: false,
                response: [],
                message: 'Error al cargar tipos de concepto',
              });
            }),
          )
        : EMPTY,
  });

  typeConceptsData = computed(() => {
    try {
      const value = this.dataTypeConcepts.value();
      return value?.response ?? [];
    } catch (error) {
      return [];
    }
  });

  consumptionParams = rxResource({
    params: () => ({ enterpriseId: this.empresaId() }),
    stream: ({ params: { enterpriseId } }) =>
      enterpriseId
        ? forkJoin({
            CONBAS: this.counterEnterpriceService
              .getParamsEnterprice(enterpriseId, 'CONBAS')
              .pipe(catchError(() => of({ success: false, response: null }))),
            CONCON: this.counterEnterpriceService
              .getParamsEnterprice(enterpriseId, 'CONCON')
              .pipe(catchError(() => of({ success: false, response: null }))),
            CONSUN: this.counterEnterpriceService
              .getParamsEnterprice(enterpriseId, 'CONSUN')
              .pipe(catchError(() => of({ success: false, response: null }))),
          })
        : EMPTY,
  });

  consumptionParamsData = computed(() => {
    try {
      const data = this.consumptionParams.value();
      if (!data) return [];

      const extractValue = (param: any, key: 'CONBAS' | 'CONCON' | 'CONSUN') => {
        // La respuesta del API es un objeto directo, no un array
        const response = param?.response;

        if (response?.id) {
          this.paramConsumptionIds[key] = response.id;
        }

        return {
          value: response?.valorParametro || '',
          active: response?.activo ?? false,
        };
      };

      return [
        {
          key: 'CONBAS',
          description: 'Consumo Básico',
          ...extractValue(data.CONBAS, 'CONBAS'),
        },
        {
          key: 'CONCON',
          description: 'Consumo Complementario',
          ...extractValue(data.CONCON, 'CONCON'),
        },
        {
          key: 'CONSUN',
          description: 'Consumo Unitario',
          ...extractValue(data.CONSUN, 'CONSUN'),
        }
      ];
    } catch (error) {
      console.error('Error procesando parámetros de consumo:', error);
      return [];
    }
  });

mostrardata = this.consumptionParamsData().forEach(param => {
    console.log('Parámetro:', param.description, 'Valor:', param.value);
    this.valorComplementario.set(param.key === 'CONCOM' ? param.value : null);
    this.valorUnitario.set(param.key === 'CONSUN' ? param.value : null);
    this.valorBasico.set(param.key === 'CONBAS' ? param.value : null);
  });

  private resetFormularioItem(): NuevoItem {
    return { nombre: '', descripcion: '' };
  }

  private convertirEstratoApiALocal(estratoApi: EstratoConcepto): Estrato {
    return {
      id: estratoApi.id,
      numero: estratoApi.estrato,
      valor: estratoApi.valor,
    };
  }

  private hasValidEstratos(): boolean {
    return (
      this.estratosActuales.length > 0 &&
      this.estratosActuales.every((estrato) => estrato.valor > 0)
    );
  }

  private actualizarAutoincrementalEstrato(): void {
    if (this.estratosActuales.length > 0) {
      const maxNumero = Math.max(...this.estratosActuales.map((e) => e.numero));
      this.nuevoEstratoNumero = maxNumero + 1;
    } else {
      this.nuevoEstratoNumero = 1;
    }
  }

  canGuardarTarifa(): boolean {
    const hasBasicFields = !!(
      this.selectedTipoTarifa && this.selectedTipoConcepto
    );

    if (!hasBasicFields) {
      return false;
    }

    if (this.mostrarTablaEstratos) {
      return this.hasValidEstratos();
    }

    return !!(this.valorTarifa !== null && this.valorTarifa > 0);
  }
  guardarTarifa(): void {
    if (!this.canGuardarTarifa()) {
      return;
    }

    const empresaId = this.empresaId();
    const usuario = this.nombreUsuario();

    if (!empresaId) {
      console.error('Empresa ID no disponible');
      return;
    }

    if (!usuario) {
      console.error('Nombre de usuario no disponible');
      return;
    }

    const tipoTarifaId =
      typeof this.selectedTipoTarifa === 'string'
        ? parseInt(this.selectedTipoTarifa)
        : this.selectedTipoTarifa;
    const tipoConceptoId =
      typeof this.selectedTipoConcepto === 'string'
        ? parseInt(this.selectedTipoConcepto)
        : this.selectedTipoConcepto;
    const tipoUsoId =
      this.selectedTipoUso !== null && this.selectedTipoUso !== undefined
        ? typeof this.selectedTipoUso === 'string'
          ? parseInt(this.selectedTipoUso)
          : this.selectedTipoUso
        : null;

    this.guardandoTarifa.set(true);

    const item: any = {
      idEmpresa: empresaId,
      idTipoTarifa: tipoTarifaId,
      usuarioCreacion: usuario,
      activo: true,
      concepto: {
        idTipoConcepto: tipoConceptoId,
        indCalcularMc: this.indCalcularMc(),
        indAplicarRango: this.indAplicarRango(),
      },
    };

    if (this.indAplicarRango() && this.valorRango() !== null) {
      item.concepto.valorRango = this.valorRango();
    }

    if (tipoUsoId !== null && tipoUsoId !== undefined) {
      item.idTipoUso = tipoUsoId;
    }

    if (this.mostrarTablaEstratos && this.estratosActuales.length > 0) {
      item.concepto.valoresEstrato = this.estratosActuales.map((estrato) => ({
        estrato: estrato.numero,
        valor: estrato.valor,
      }));
    } else {
      item.concepto.valor = this.valorTarifa;
    }

    const payload = {
      items: [item],
    };

    this.conceptRateService.saveFeeConceptRate(payload).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Éxito', 'Tarifa guardada exitosamente');
          this.dataTypeConcepts.reload();
          this.conceptRatesEnterprise.reload();
          // Recargar datos del componente hijo
          this.conceptRateEnterpiceComponent?.reloadData();
          this.limpiarFormulario();
        } else {
          this.toastService.error('Error', 'No se pudo guardar la tarifa');
        }
        this.guardandoTarifa.set(false);
      },
      complete: () => {
        this.guardandoTarifa.set(false);
        this.dataTypeConcepts.reload();
        this.conceptRatesEnterprise.reload();
        // Recargar datos del componente hijo
        this.conceptRateEnterpiceComponent?.reloadData();
      },
    });
  }

  private limpiarFormulario(): void {
    this.selectedTipoTarifa = null;
    this.selectedTipoConcepto = null;
    this.selectedTipoUso = null;
    this.valorTarifa = null;
    this.estratosActuales = [];
    this.mostrarTablaEstratos = false;
    this.nuevoEstratoNumero = 1;
    this.nuevoEstratoValor = null;
    this.indCalcularMc.set(true);
    this.indAplicarRango.set(false);
    this.valorRango.set(null);
  }

  onTipoTarifaChange(): void {
    if (this.selectedTipoConcepto) {
      this.verificarEstratos();
    }
    // Cargar parámetros de consumo específicos para esta tarifa
    this.cargarParametrosConsumoPorTarifa();
  }

  onTipoConceptoChange(): void {
    if (this.selectedTipoTarifa) {
      this.verificarEstratos();
    }
    // Cargar parámetros de consumo específicos para este concepto
    this.cargarParametrosConsumoPorTarifa();
  }

  private verificarEstratos(): void {
    const empresaId = this.empresaId();
    const tipoTarifaId =
      typeof this.selectedTipoTarifa === 'string'
        ? parseInt(this.selectedTipoTarifa)
        : this.selectedTipoTarifa;
    const tipoConceptoId =
      typeof this.selectedTipoConcepto === 'string'
        ? parseInt(this.selectedTipoConcepto)
        : this.selectedTipoConcepto;

    if (!empresaId || !tipoTarifaId || !tipoConceptoId) {
      return;
    }

    this.cargandoEstratos.set(true);
    this.conceptRateService.getConceptRateByEnterprise(empresaId).subscribe({
      next: (response) => {
        if (response.success && response.response) {
          const conceptRateExistente = response.response.find(
            (cr) =>
              cr.tipoTarifa.id === tipoTarifaId &&
              cr.tipoConcepto.id === tipoConceptoId,
          );

          if (conceptRateExistente) {
            if (
              conceptRateExistente.porEstrato &&
              conceptRateExistente.estratos &&
              conceptRateExistente.estratos.length > 0
            ) {
              this.mostrarTablaEstratos = true;
              this.valorTarifa = null;
              this.estratosActuales = conceptRateExistente.estratos.map(
                (estrato) => ({
                  id: estrato.id,
                  numero: estrato.estrato,
                  valor: estrato.valor,
                }),
              );
              // Actualizar el autoincremental para el próximo estrato
              this.actualizarAutoincrementalEstrato();
            }
            // Verificar si tiene un valor único (sin estratos)
            else if (
              conceptRateExistente.valor !== null &&
              conceptRateExistente.valor !== undefined
            ) {
              // Existe un valor único, cargarlo en el input
              this.mostrarTablaEstratos = false;
              this.estratosActuales = [];
              this.valorTarifa = conceptRateExistente.valor;
            }
            // Cargar el estado de los checkboxes
            this.indCalcularMc.set(conceptRateExistente.indCalcularMc);
            this.indAplicarRango.set((conceptRateExistente as any).indAplicarRango || false);
            this.valorRango.set((conceptRateExistente as any).valorRango || null);
          } else {
            // No existen datos, resetear el estado y permitir al usuario decidir
            this.mostrarTablaEstratos = false;
            this.estratosActuales = [];
            this.valorTarifa = null;
            this.indCalcularMc.set(true);
            this.indAplicarRango.set(false);
            this.valorRango.set(null);
          }
        } else {
          // No existen datos, resetear el estado
          this.mostrarTablaEstratos = false;
          this.estratosActuales = [];
          this.valorTarifa = null;
          this.indCalcularMc.set(true);
          this.indAplicarRango.set(false);
          this.valorRango.set(null);
        }
      },
      complete: () => {
        this.cargandoEstratos.set(false);
      },
    });
  }

  toggleTablaEstratos(): void {
    this.mostrarTablaEstratos = !this.mostrarTablaEstratos;

    if (this.mostrarTablaEstratos) {
      if (this.estratosActuales.length === 0) {
        this.estratosActuales = [];
        this.nuevoEstratoNumero = 1;
      } else {
        this.actualizarAutoincrementalEstrato();
      }
    }
  }

  agregarNuevoEstrato(): void {
    if (this.nuevoEstratoValor !== null && this.nuevoEstratoValor > 0) {
      const minId =
        this.estratosActuales.length > 0
          ? Math.min(...this.estratosActuales.map((e) => e.id))
          : 0;
      const tempId = minId >= 0 ? -1 : minId - 1;

      const nuevoEstrato: Estrato = {
        id: tempId,
        numero: this.nuevoEstratoNumero,
        valor: this.nuevoEstratoValor,
      };

      this.estratosActuales.push(nuevoEstrato);
      this.estratosActuales.sort((a, b) => a.numero - b.numero);

      this.actualizarAutoincrementalEstrato();
      this.nuevoEstratoValor = null;
    }
  }

  eliminarEstrato(id: number): void {
    const estrato = this.estratosActuales.find((e) => e.id === id);
    if (estrato) {
      this.estratoToDelete = estrato;
      this.showDeleteConfirmEstrato.set(true);
    }
  }

  actualizarEstratoValor(estratoId: number, nuevoValor: number): void {
    const estrato = this.estratosActuales.find((e) => e.id === estratoId);
    if (estrato) {
      estrato.valor = nuevoValor;
      // Forzar detección de cambios actualizando la referencia del array
      this.estratosActuales = [...this.estratosActuales];
    }
  }

  // Métodos para el popup de tipo de tarifa
  abrirPopupTipoTarifa(): void {
    this.editandoTipoTarifa.set(false);
    this.rateTypeToEdit = null;
    this.showPopupTipoTarifa.set(true);
    this.nuevoTipoTarifa = this.resetFormularioItem();
  }

  cerrarPopupTipoTarifa(): void {
    this.showPopupTipoTarifa.set(false);
    this.editandoTipoTarifa.set(false);
    this.guardandoTipoTarifa.set(false);
    this.rateTypeToEdit = null;
    this.nuevoTipoTarifa = this.resetFormularioItem();
  }

  guardarNuevoTipoTarifa(): void {
    if (!this.nuevoTipoTarifa.nombre.trim() || this.guardandoTipoTarifa()) {
      return;
    }

    const usuario = this.nombreUsuario();
    if (!usuario) {
      this.toastService.error(
        'error',
        'Error: No se pudo obtener el usuario actual',
      );
      return;
    }

    this.guardandoTipoTarifa.set(true);

    const codigo =
      this.editandoTipoTarifa() && this.rateTypeToEdit?.codigo
        ? this.rateTypeToEdit.codigo
        : this.nuevoTipoTarifa.nombre
            .trim()
            .substring(0, 3)
            .toUpperCase()
            .padEnd(3, 'X'); // Si tiene menos de 3 letras, completa con 'X'

    const tipoTarifaData: IrateTypes = {
      empresa: { id: this.empresaId() },
      nombre: this.nuevoTipoTarifa.nombre.trim(),
      descripcion: this.nuevoTipoTarifa.descripcion.trim() || '',
      codigo: codigo,
      usuarioCreacion: usuario,
    };

    if (this.editandoTipoTarifa() && this.rateTypeToEdit?.id) {
      tipoTarifaData.id = this.rateTypeToEdit.id;
    }

    const operation = this.rateTypeService.saveRateType(tipoTarifaData);

    operation.subscribe({
      next: (response) => {
        if (response.success) {
          const mensaje = this.editandoTipoTarifa()
            ? 'Tipo de tarifa actualizado exitosamente'
            : 'Tipo de tarifa guardado exitosamente';

          this.toastService.success('Éxito', mensaje);
          this.cerrarPopupTipoTarifa();
          this.typeRates.reload();
        } else {
          this.toastService.error(
            'error',
            'El tipo de Tarifa no se pudo Guardar',
          );
        }
        this.guardandoTipoTarifa.set(false);
      },
      complete: () => {
        this.guardandoTipoTarifa.set(false);
      },
    });
  }

  // Métodos para el popup de visualizar tarifas
  abrirPopupVisualizarTarifas(): void {
    this.showPopupVisualizarTarifas.set(true);
  }

  cerrarPopupVisualizarTarifas(): void {
    this.showPopupVisualizarTarifas.set(false);
  }

  onEditRateType(rateType: IrateTypes): void {
    this.editandoTipoTarifa.set(true);
    this.rateTypeToEdit = rateType;

    this.nuevoTipoTarifa = {
      nombre: rateType.nombre,
      descripcion: rateType.descripcion || '',
    };

    this.showPopupTipoTarifa.set(true);
  }

  onDeleteRateType(rateType: IrateTypes): void {
    this.rateTypeToDelete = rateType;
    this.showDeleteConfirm.set(true);
  }

  getDeleteConfirmMessage(): string {
    return this.rateTypeToDelete
      ? `¿Está seguro que desea eliminar el tipo de tarifa "${this.rateTypeToDelete.nombre}"? Esta acción no se puede deshacer.`
      : '¿Está seguro que desea eliminar este tipo de tarifa?';
  }

  confirmDeleteRateType(): void {
    if (this.rateTypeToDelete?.id) {
      this.rateTypeService.deleteRateType(this.rateTypeToDelete.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.typeRates.reload();
            this.toastService.success(
              'Éxito',
              'Tipo de tarifa eliminado exitosamente',
            );
          } else {
            this.toastService.success(
              'error',
              'El tipo de tarifa no se pudo eliminar',
            );
          }
        },
        complete: () => {
          this.showDeleteConfirm.set(false);
          this.rateTypeToDelete = null;
        },
      });
    }
  }

  cancelDeleteRateType(): void {
    this.showDeleteConfirm.set(false);
    this.rateTypeToDelete = null;
  }

  abrirPopupTipoConcepto(): void {
    this.editandoTipoConcepto.set(false);
    this.typeConceptToEdit = null;
    this.showPopupTipoConcepto.set(true);
    this.nuevoTipoConcepto = this.resetFormularioItem();
  }

  cerrarPopupTipoConcepto(): void {
    this.showPopupTipoConcepto.set(false);
    this.editandoTipoConcepto.set(false);
    this.guardandoTipoConcepto.set(false);
    this.typeConceptToEdit = null;
    this.nuevoTipoConcepto = this.resetFormularioItem();
  }

  guardarNuevoTipoConcepto(): void {
    if (
      !this.nuevoTipoConcepto.descripcion.trim() ||
      this.guardandoTipoConcepto()
    ) {
      return;
    }

    const usuario = this.nombreUsuario();
    if (!usuario) {
      this.toastService.error(
        'error',
        'Error: No se pudo obtener el usuario actual',
      );
      return;
    }
    this.guardandoTipoConcepto.set(true);
    const codigo =
      this.editandoTipoConcepto() && this.typeConceptToEdit?.codigo
        ? this.typeConceptToEdit.codigo
        : this.nuevoTipoConcepto.descripcion
            .trim()
            .substring(0, 3)
            .toUpperCase()
            .padEnd(3, 'X');

    const tipoConceptoData: IrateTypes = {
      empresa: { id: this.empresaId() },
      nombre: this.nuevoTipoConcepto.descripcion.trim(), // Usar descripción como nombre, por el momento , solo tantico
      descripcion: this.nuevoTipoConcepto.descripcion.trim() || '',
      codigo: codigo,
      usuarioCreacion: usuario,
    };

    if (this.editandoTipoConcepto() && this.typeConceptToEdit?.id) {
      tipoConceptoData.id = this.typeConceptToEdit.id;
    }

    const operation = this.typeConceptService.saveTypeConcept(tipoConceptoData);

    operation.subscribe({
      next: (response) => {
        if (response.success) {
          const mensaje = this.editandoTipoConcepto()
            ? 'Tipo de concepto actualizado exitosamente'
            : 'Tipo de concepto guardado exitosamente';

          this.toastService.success('Éxito', mensaje);
          this.cerrarPopupTipoConcepto();
          this.dataTypeConcepts.reload();
        } else {
          const errorMsg = this.editandoTipoConcepto()
            ? 'Error al actualizar el tipo de concepto: '
            : 'Error al guardar el tipo de concepto: ';
          this.toastService.success('error', errorMsg);
        }

        this.guardandoTipoConcepto.set(false);
      },
      complete: () => {
        this.guardandoTipoConcepto.set(false);
      },
    });
  }

  abrirPopupVisualizarConceptos(): void {
    this.showPopupVisualizarConceptos.set(true);
  }

  cerrarPopupVisualizarConceptos(): void {
    this.showPopupVisualizarConceptos.set(false);
  }

  conceptRatesEnterprise = rxResource({
    params: () => ({ enterpriseId: this.empresaId() }),
    stream: ({ params: { enterpriseId } }) =>
      enterpriseId
        ? this.conceptRateService.getConceptRateByEnterprise(enterpriseId).pipe(
            catchError((error) => {
              return of({
                success: false,
                response: [],
                message: 'Error al cargar tarifas concepto',
              });
            }),
          )
        : EMPTY,
  });

  conceptRatesData = computed(() => {
    try {
      const value = this.conceptRatesEnterprise.value();
      return value?.response ?? [];
    } catch (error) {
      return [];
    }
  });

  abrirPopupConceptosTarifaEmpresa(): void {
    this.showPopupConceptosTarifaEmpresa.set(true);
    this.conceptRatesEnterprise.reload();
  }

  cerrarPopupConceptosTarifaEmpresa(): void {
    this.showPopupConceptosTarifaEmpresa.set(false);
  }

  onEditTypeConcept(typeConcept: IrateTypes): void {
    this.editandoTipoConcepto.set(true);
    this.typeConceptToEdit = typeConcept;
    this.nuevoTipoConcepto = {
      nombre: '',
      descripcion: typeConcept.descripcion || typeConcept.nombre || '',
    };
    this.showPopupTipoConcepto.set(true);
  }

  onDeleteTypeConcept(typeConcept: IrateTypes): void {
    this.typeConceptToDelete = typeConcept;
    this.showDeleteConfirmConcept.set(true);
  }

  getDeleteConfirmMessageConcept(): string {
    return this.typeConceptToDelete
      ? `¿Está seguro que desea eliminar el tipo de concepto "${this.typeConceptToDelete.nombre}"? Esta acción no se puede deshacer.`
      : '¿Está seguro que desea eliminar este tipo de concepto?';
  }

  confirmDeleteTypeConcept(): void {
    if (this.typeConceptToDelete?.id) {
      this.typeConceptService
        .deleteTypeConcept(this.typeConceptToDelete.id)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.dataTypeConcepts.reload();
              this.toastService.success(
                'Éxito',
                'Tipo de concepto eliminado exitosamente',
              );
            } else {
              this.toastService.error(
                'error',
                'El tipo de concepto no se pudo eliminar',
              );
            }
          },
          complete: () => {
            this.showDeleteConfirmConcept.set(false);
            this.typeConceptToDelete = null;
          },
        });
    }
  }

  cancelDeleteTypeConcept(): void {
    this.showDeleteConfirmConcept.set(false);
    this.typeConceptToDelete = null;
  }

  // ===== MÉTODOS PARA TIPO DE USO =====

  abrirPopupTipoUso(): void {
    this.editandoTipoUso.set(false);
    this.useTypeToEdit = null;
    this.showPopupTipoUso.set(true);
    this.nuevoTipoUso = this.resetFormularioItem();
  }

  cerrarPopupTipoUso(): void {
    this.showPopupTipoUso.set(false);
    this.editandoTipoUso.set(false);
    this.guardandoTipoUso.set(false);
    this.useTypeToEdit = null;
    this.nuevoTipoUso = this.resetFormularioItem();
  }

  guardarNuevoTipoUso(): void {
    if (!this.nuevoTipoUso.nombre.trim() || this.guardandoTipoUso()) {
      return;
    }

    const usuario = this.nombreUsuario();
    if (!usuario) {
      this.toastService.error(
        'Error',
        'No se pudo obtener la información del usuario',
      );
      return;
    }

    this.guardandoTipoUso.set(true);

    const codigo =
      this.editandoTipoUso() && this.useTypeToEdit?.codigo
        ? this.useTypeToEdit.codigo
        : this.nuevoTipoUso.nombre
            .trim()
            .substring(0, 3)
            .toUpperCase()
            .padEnd(3, 'X');

    const tipoUsoData = {
      empresa: { id: this.empresaId() },
      nombre: this.nuevoTipoUso.nombre.trim(),
      descripcion: this.nuevoTipoUso.descripcion.trim() || '',
      codigo: codigo,
      usuarioCreacion: usuario,
    };

    if (this.editandoTipoUso() && this.useTypeToEdit?.id) {
      (tipoUsoData as any).id = this.useTypeToEdit.id;
    }

    const operation =
      this.editandoTipoUso() && this.useTypeToEdit?.id
        ? this.useService.updateUse({
            id: this.useTypeToEdit.id,
            nombre: tipoUsoData.nombre,
            usuarioModificacion: usuario,
          })
        : this.useService.createUse(tipoUsoData);

    operation.subscribe({
      next: (response) => {
        if (response.success) {
          this.typeUse.reload();
          this.toastService.success(
            'Éxito',
            this.editandoTipoUso()
              ? 'Tipo de uso actualizado exitosamente'
              : 'Nuevo tipo de uso creado exitosamente',
          );
          this.cerrarPopupTipoUso();
        } else {
          this.toastService.error(
            'Error',
            response.message || 'No se pudo guardar el tipo de uso',
          );
        }
      },
      complete: () => {
        this.guardandoTipoUso.set(false);
      },
    });
  }

  abrirPopupVisualizarUsos(): void {
    this.showPopupVisualizarUsos.set(true);
  }

  cerrarPopupVisualizarUsos(): void {
    this.showPopupVisualizarUsos.set(false);
  }

  onEditUseType(useType: any): void {
    this.editandoTipoUso.set(true);
    this.useTypeToEdit = useType;

    this.nuevoTipoUso = {
      nombre: useType.nombre,
      descripcion: useType.descripcion || '',
    };

    this.showPopupTipoUso.set(true);
  }

  onDeleteUseType(useType: any): void {
    this.useTypeToDelete = useType;
    this.showDeleteConfirmUse.set(true);
  }

  getDeleteConfirmMessageUse(): string {
    return this.useTypeToDelete
      ? `¿Está seguro que desea eliminar el tipo de uso "${this.useTypeToDelete.nombre}"? Esta acción no se puede deshacer.`
      : '¿Está seguro que desea eliminar este tipo de uso?';
  }

  confirmDeleteUseType(): void {
    if (this.useTypeToDelete?.id) {
      this.useService.deleteUse(this.useTypeToDelete.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.typeUse.reload();
            this.toastService.success(
              'Éxito',
              'Tipo de uso eliminado exitosamente',
            );
          } else {
            this.toastService.error(
              'Error',
              'No se pudo eliminar el tipo de uso',
            );
          }
        },
        complete: () => {
          this.showDeleteConfirmUse.set(false);
          this.useTypeToDelete = null;
        },
      });
    }
  }

  cancelDeleteUseType(): void {
    this.showDeleteConfirmUse.set(false);
    this.useTypeToDelete = null;
  }

  onTipoUsoChange(): void {
    // Aquí puedes agregar lógica adicional si es necesario cuando cambia el tipo de uso
  }

  // Métodos para confirmación de eliminación de estrato
  getDeleteConfirmMessageEstrato(): string {
    return this.estratoToDelete
      ? `¿Está seguro que desea eliminar el estrato ${this.estratoToDelete.numero} con valor $${this.estratoToDelete.valor.toLocaleString()}? Esta acción no se puede deshacer.`
      : '¿Está seguro que desea eliminar este estrato?';
  }

  confirmDeleteEstrato(): void {
    if (!this.estratoToDelete) {
      this.cancelDeleteEstrato();
      return;
    }

    const estratoId = this.estratoToDelete.id;
    const estratoInfo = `${this.estratoToDelete.numero} (Valor: $${this.estratoToDelete.valor.toLocaleString()})`;

    // Si el estrato tiene ID positivo, existe en BD y requiere petición al servidor
    // Si el estrato tiene ID negativo, es temporal y solo se elimina del array local
    if (estratoId > 0) {
      this.conceptRateService.deleteConceptStratum(estratoId).subscribe({
        next: (response) => {
          if (response?.success === true) {
            // Eliminar del array local solo si la petición fue exitosa
            this.estratosActuales = this.estratosActuales.filter(
              (estrato) => estrato.id !== estratoId,
            );
            // Actualizar autoincremental después de eliminar
            this.actualizarAutoincrementalEstrato();
            this.toastService.success(
              'Éxito',
              `Se eliminó exitosamente el estrato ${estratoInfo}`,
            );
          } else {
            this.toastService.error(
              'Error',
              response?.message || 'No se pudo eliminar el estrato',
            );
          }
        },
        complete: () => {
          this.cancelDeleteEstrato();
        },
      });
    } else {
      // Estrato temporal (ID negativo o 0), eliminar directamente del array
      this.estratosActuales = this.estratosActuales.filter(
        (estrato) => estrato.id !== estratoId,
      );
      // Actualizar autoincremental después de eliminar
      this.actualizarAutoincrementalEstrato();
      this.toastService.success(
        'Éxito',
        `Se eliminó el estrato ${estratoInfo}`,
      );
      this.cancelDeleteEstrato();
    }
  }

  cancelDeleteEstrato(): void {
    this.showDeleteConfirmEstrato.set(false);
    this.estratoToDelete = null;
  }

  // Métodos para confirmación de guardado
  abrirConfirmacionGuardar(): void {
    if (this.canGuardarTarifa()) {
      this.showSaveConfirm.set(true);
    }
  }

  getSaveConfirmMessage(): string {
    const tipoTarifaNombre =
      this.typeRatesData().find((t) => t.id == this.selectedTipoTarifa)
        ?.nombre || 'Sin nombre';
    const tipoConceptoNombre =
      this.typeConceptsData().find((t) => t.id == this.selectedTipoConcepto)
        ?.descripcion || 'Sin descripción';

    let valorInfo = '';
    if (this.mostrarTablaEstratos && this.estratosActuales.length > 0) {
      valorInfo = `con ${this.estratosActuales.length} estrato(s) configurado(s)`;
    } else if (this.valorTarifa) {
      valorInfo = `con valor único de $${this.valorTarifa.toLocaleString()}`;
    }

    return `¿Está seguro que desea guardar la tarifa concepto "${tipoTarifaNombre} - ${tipoConceptoNombre}" ${valorInfo}?`;
  }

  confirmarGuardarTarifa(): void {
    this.showSaveConfirm.set(false);
    this.guardarTarifa();
  }

  cancelarGuardarTarifa(): void {
    this.showSaveConfirm.set(false);
  }

  // Tab navigation methods
  selectTab(tabId: string): void {
    this.activeTab.set(tabId);
    // Re-inicializar tooltips solo cuando cambia a tab que los necesita
    if (this.isBrowser && tabId === 'fee-rate') {
      // Usar requestAnimationFrame para mejor performance que setTimeout
      requestAnimationFrame(() => this.initFlowbite());
    }
  }

  getTabClasses(tabId: string): string {
    const isActive = this.activeTab() === tabId;
    return isActive ? 'active' : '';
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      // Esperar a que Flowbite esté disponible (carga async)
      this.waitForFlowbite().then(() => this.initFlowbite());
    }
  }

  private waitForFlowbite(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).initFlowbite) {
        resolve();
      } else {
        // Polling ligero cada 50ms, máximo 2 segundos
        let attempts = 0;
        const interval = setInterval(() => {
          if ((window as any).initFlowbite || attempts > 40) {
            clearInterval(interval);
            resolve();
          }
          attempts++;
        }, 50);
      }
    });
  }

  private initFlowbite(): void {
    if (typeof window !== 'undefined' && (window as any).initFlowbite) {
      (window as any).initFlowbite();
    }
  }

  // Métodos para el popup de guía
  abrirGuia(): void {
    this.showGuidePopup.set(true);
  }

  cerrarGuia(): void {
    this.showGuidePopup.set(false);
  }

  // Método para limpiar parámetros de consumo
  limpiarParametrosConsumo(): void {
    this.consumoMinimo.set(15);
    this.consumoMaximo.set(50);
  }

  // Método para construir códigos de consumo dinámicos
  private construirCodigosConsumo(): string[] {
    const tipoTarifaSeleccionado = this.typeRatesData().find(
      (t) => t.id == this.selectedTipoTarifa
    );

    if (!tipoTarifaSeleccionado?.codigo) {
      return [];
    }

    // Tomar los primeros 3 caracteres del código de tarifa
    const codigoTarifa = tipoTarifaSeleccionado.codigo.substring(0, 3).toUpperCase();

    // Construir los códigos completos
    return [
      `${codigoTarifa}CONBAS`,
      `${codigoTarifa}CONCON`,
      `${codigoTarifa}CONSUN`
    ];
  }

  // Método para cargar parámetros de consumo por tarifa seleccionada
  cargarParametrosConsumoPorTarifa(): void {
    if (!this.selectedTipoTarifa) {
      this.codigosTarifaConsumo.set([]);
      // Resetear valores cuando no hay tarifa seleccionada
      this.consumoMinimo.set(0);
      this.consumoMaximo.set(0);
      this.paramConsumptionIds.CONBAS = undefined;
      this.paramConsumptionIds.CONCON = undefined;
      this.paramConsumptionIds.CONSUN = undefined;
      return;
    }

    const codigos = this.construirCodigosConsumo();
    this.codigosTarifaConsumo.set(codigos);

    if (codigos.length === 0) {
      // Resetear valores cuando no se pueden construir códigos
      this.consumoMinimo.set(0);
      this.consumoMaximo.set(0);
      this.paramConsumptionIds.CONBAS = undefined;
      this.paramConsumptionIds.CONCON = undefined;
      this.paramConsumptionIds.CONSUN = undefined;
      return;
    }

    const empresaId = this.empresaId();
    if (!empresaId) {
      return;
    }

    // Resetear valores antes de cargar nuevos parámetros
    this.consumoMinimo.set(0);
    this.consumoMaximo.set(0);
    this.paramConsumptionIds.CONBAS = undefined;
    this.paramConsumptionIds.CONCON = undefined;
    this.paramConsumptionIds.CONSUN = undefined;

    this.cargandoParametrosConsumo.set(true);

    // Hacer las peticiones para cada código
    forkJoin({
      CONBAS: this.counterEnterpriceService
        .getParamsEnterprice(empresaId, codigos[0])
        .pipe(catchError(() => of({ success: false, response: null }))),
      CONCON: this.counterEnterpriceService
        .getParamsEnterprice(empresaId, codigos[1])
        .pipe(catchError(() => of({ success: false, response: null }))),
      CONSUN: this.counterEnterpriceService
        .getParamsEnterprice(empresaId, codigos[2])
        .pipe(catchError(() => of({ success: false, response: null })))
    }).subscribe({
      next: (data) => {
        // Actualizar consumoMinimo y consumoMaximo basado en los valores obtenidos
        // La respuesta del API es un objeto directo, no un array
        if (data.CONBAS?.success && data.CONBAS.response) {
          const valorParam = data.CONBAS.response.valorParametro;
          // Guardar el ID para futuras actualizaciones
          if (data.CONBAS.response.id) {
            this.paramConsumptionIds.CONBAS = data.CONBAS.response.id;
          }
          // Extraer el máximo del rango (ejemplo: "0-15" -> 15)
          const match = valorParam.match(/-(\d+)/);
          if (match) {
            this.consumoMinimo.set(parseInt(match[1]));
            console.log('CONBAS cargado:', valorParam, '-> mínimo:', match[1], '-> ID:', data.CONBAS.response.id);
          }
        }

        if (data.CONCON?.success && data.CONCON.response) {
          const valorParam = data.CONCON.response.valorParametro;
          // Guardar el ID para futuras actualizaciones
          if (data.CONCON.response.id) {
            this.paramConsumptionIds.CONCON = data.CONCON.response.id;
          }
          // Extraer el máximo del rango (ejemplo: "15-50" -> 50)
          const match = valorParam.match(/-(\d+)/);
          if (match) {
            this.consumoMaximo.set(parseInt(match[1]));
            console.log('CONCON cargado:', valorParam, '-> máximo:', match[1], '-> ID:', data.CONCON.response.id);
          }
        }

        if (data.CONSUN?.success && data.CONSUN.response) {
          // Guardar el ID para futuras actualizaciones
          if (data.CONSUN.response.id) {
            this.paramConsumptionIds.CONSUN = data.CONSUN.response.id;
          }
          console.log('CONSUN cargado -> ID:', data.CONSUN.response.id);
        }

        this.cargandoParametrosConsumo.set(false);
        console.log('Parámetros de consumo cargados - Min:', this.consumoMinimo(), 'Max:', this.consumoMaximo());
        console.log('IDs guardados:', this.paramConsumptionIds);
      },
      error: (error) => {
        console.error('Error al cargar parámetros de consumo:', error);
        this.toastService.error(
          'Error',
          'Error al cargar parámetros de consumo específicos'
        );
        this.cargandoParametrosConsumo.set(false);
      }
    });
  }

  // Método para actualizar parámetros de consumo
  actualizarParametrosConsumo(): void {
    const min = this.consumoMinimo();
    const max = this.consumoMaximo();

    // Validación
    if (min >= max) {
      this.toastService.error('Error', 'El consumo mínimo debe ser menor que el máximo');
      return;
    }

    const empresaId = this.empresaId();
    const usuario = this.nombreUsuario();

    if (!empresaId) {
      this.toastService.error('Error', 'No se pudo obtener el ID de la empresa');
      return;
    }

    if (!usuario) {
      this.toastService.error('Error', 'No se pudo obtener el usuario');
      return;
    }

    this.guardandoParametrosConsumo.set(true);

    // Obtener los códigos dinámicos basados en la tarifa seleccionada
    const codigos = this.construirCodigosConsumo();

    if (codigos.length === 0) {
      this.toastService.info(
        'Info',
        'Debe seleccionar una tarifa primero'
      );
      this.guardandoParametrosConsumo.set(false);
      return;
    }

    const buildParam = (key: 'CONBAS' | 'CONCON' | 'CONSUN', llave: string, valorParametro: string) => {
      const param: any = {
        empresa: { id: empresaId },
        llave: llave,
        valorParametro: valorParametro,
        activo: true,
        usuarioCreacion: usuario,
      };

      if (this.paramConsumptionIds[key]) {
        param.id = this.paramConsumptionIds[key];
      }

      return param;
    };

    const params: any[] = [
      buildParam('CONBAS', codigos[0], `0-${min}`),
      buildParam('CONCON', codigos[1], `${min}-${max}`),
      buildParam('CONSUN', codigos[2], `${max}+`),
    ];

    forkJoin(
      params.map((param) =>
        this.counterEnterpriceService.createParamsEnterprice(param).pipe(
          catchError((error) => {
            console.error('Error guardando parámetro:', param.llave, error);
            return of(null);
          })
        )
      )
    ).subscribe({
      next: (results) => {
        this.guardandoParametrosConsumo.set(false);
        const allSuccess = results.every((result) => result !== null);

        if (allSuccess) {
          this.toastService.success('Éxito', 'Parámetros de consumo actualizados correctamente');
          this.consumptionParams.reload();
        } else {
          this.toastService.error('Error parcial', 'Algunos parámetros no pudieron guardarse');
        }
      },
      error: (error) => {
        console.error('Error al actualizar parámetros:', error);
        this.toastService.error('Error', 'Error al actualizar los parámetros de consumo');
        this.guardandoParametrosConsumo.set(false);
      }
    });
  }
}
