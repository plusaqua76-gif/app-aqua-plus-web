import {
  Component,
  computed,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { RateTypeService } from '../../services/rate-type.service';
import { PopupComponent } from '../../../../shared/components/popUp';
import { RateTypesListComponent } from '../../components/rate-types-list.component';
import { TypeConceptsListComponent } from '../../components/type-concepts-list.component';
import { ConceptRateEnterpice } from '../fee-enterprice/concept-rate-enterpice';
import { PaymentPoints } from '../payment-points/payment-points';
import { DaysValidity } from '../days-validity/days-validity';
import { CounterEnterprice } from '../company-accountant-reading/counter-enterprice';
import { IrateTypes } from '@interfaces/IrateTypes';
import { ToastService } from '@services/toast.service';
import { TypeConceptService } from '../../services/type-concept.service';
import { ConceptRateService } from '../../services/concept-rate.service';
import { EMPTY, of, catchError } from 'rxjs';
import {
  Estrato,
  NuevoItem,
} from '../../../../core/interfaces/tipo-tarifa/ITarifaItem';
import {
  EstratoConcepto
} from '../../../../core/interfaces/IConceptoEstrato';

// esto es mala practica, nosotros ya tenemos creado una interface IrateTypes en core/interfaces/IrateTypes.ts

@Component({
  selector: 'app-fee',
  imports: [
    CommonModule,
    FormsModule,
    PopupComponent,
    RateTypesListComponent,
    TypeConceptsListComponent,
    ConceptRateEnterpice,
    PaymentPoints,
    DaysValidity,
    CounterEnterprice,
  ],
  styleUrls: ['./fee.css'],
  templateUrl: './fee.html',
})
export class FeeComponent {
  protected readonly rateTypeService = inject(RateTypeService);
  protected readonly toastService = inject(ToastService);
  protected readonly router = inject(Router);
  protected typeConceptService = inject(TypeConceptService);
  protected conceptRateService = inject(ConceptRateService);
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

  // Tab navigation
  activeTab = signal<string>('fee-rate');

  selectedTipoTarifa: any = null;
  selectedTipoConcepto: any = null;
  valorTarifa: number | null = null;
  mostrarTablaEstratos: boolean = false;
  estratosActuales: Estrato[] = [];
  nuevoEstratoNumero: number = 1;
  nuevoEstratoValor: number | null = null;
  guardandoTarifa = signal(false);
  cargandoEstratos = signal(false);
  indCalcularMc = signal(false);

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

  showDeleteConfirmEstrato = signal(false);
  estratoToDelete: Estrato | null = null;

  showSaveConfirm = signal(false);

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


  typeRates = rxResource({
    params: () => ({ enterpriseId: this.empresaId() }),
    stream: ({ params: { enterpriseId } }) =>
      enterpriseId
        ? this.rateTypeService.getRateTypes(enterpriseId).pipe(
            catchError(error => {
              console.error('Error loading rate types:', error);
              return of({ success: false, response: [], message: 'Error al cargar tipos de tarifa' });
            })
          )
        : EMPTY,
  });

  typeRatesData = computed(() => {
    try {
      const value = this.typeRates.value();
      return value?.response ?? [];
    } catch (error) {
      console.error('Error in typeRatesData computed:', error);
      return [];
    }
  });

  dataTypeConcepts = rxResource({
    params: () => ({ enterpriseId: this.empresaId() }),
    stream: ({ params: { enterpriseId } }) =>
      enterpriseId
        ? this.typeConceptService.getAllTypeConcepts(enterpriseId).pipe(
            catchError(error => {
              console.error('Error loading type concepts:', error);
              // Retornar un observable con estructura vacía pero válida
              return of({ success: false, response: [], message: 'Error al cargar tipos de concepto' });
            })
          )
        : EMPTY,
  });

  typeConceptsData = computed(() => {
    try {
      const value = this.dataTypeConcepts.value();
      return value?.response ?? [];
    } catch (error) {
      console.error('Error in typeConceptsData computed:', error);
      return [];
    }
  });

  private resetFormularioItem(): NuevoItem {
    return { nombre: '', descripcion: '' };
  }

  private convertirEstratoApiALocal(estratoApi: EstratoConcepto): Estrato {
    return {
      id: estratoApi.id,
      numero: estratoApi.estrato,
      valor: estratoApi.valor
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

    this.guardandoTarifa.set(true);

    const item = {
      idEmpresa: empresaId,
      idTipoTarifa: tipoTarifaId,
      usuarioCreacion: usuario,
      activo: true,
      concepto: {
        idTipoConcepto: tipoConceptoId,
        indCalcularMc: this.indCalcularMc()
      } as any
    };

    // Agregar valores según el tipo (con o sin estratos)
    if (this.mostrarTablaEstratos && this.estratosActuales.length > 0) {
      item.concepto.valoresEstrato = this.estratosActuales.map(estrato => ({
        estrato: estrato.numero,
        valor: estrato.valor
      }));
    } else {
      item.concepto.valor = this.valorTarifa;
    }

    const payload = {
      items: [item]
    };

    this.conceptRateService.saveFeeConceptRate(payload).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success('Éxito', 'Tarifa guardada exitosamente');
          this.dataTypeConcepts.reload();
          this.limpiarFormulario();
        } else {
          this.toastService.error('Error', 'No se pudo guardar la tarifa');
        }
        this.guardandoTarifa.set(false);
      },
      error: (error) => {
        console.error('Error al guardar la tarifa:', error);
        this.toastService.error('Error', 'Error al guardar la tarifa. Por favor, inténtelo de nuevo.');
        this.guardandoTarifa.set(false);
      },
      complete: () => {
        this.guardandoTarifa.set(false);
        this.dataTypeConcepts.reload();
      }
    });
  }

  private limpiarFormulario(): void {
    this.selectedTipoTarifa = null;
    this.selectedTipoConcepto = null;
    this.valorTarifa = null;
    this.estratosActuales = [];
    this.mostrarTablaEstratos = false;
    this.nuevoEstratoNumero = 1;
    this.nuevoEstratoValor = null;
    this.indCalcularMc.set(true);
  }

  onTipoTarifaChange(): void {
    if (this.selectedTipoConcepto) {
      this.verificarEstratos();
    }
  }

  onTipoConceptoChange(): void {
    if (this.selectedTipoTarifa) {
      this.verificarEstratos();
    }
  }

  private verificarEstratos(): void {
    const empresaId = this.empresaId();
    const tipoTarifaId = typeof this.selectedTipoTarifa === 'string'
      ? parseInt(this.selectedTipoTarifa)
      : this.selectedTipoTarifa;
    const tipoConceptoId = typeof this.selectedTipoConcepto === 'string'
      ? parseInt(this.selectedTipoConcepto)
      : this.selectedTipoConcepto;

    if (!empresaId || !tipoTarifaId || !tipoConceptoId) {
      return;
    }


    this.cargandoEstratos.set(true);
    this.conceptRateService.getConceptRateByEnterprise(empresaId)
      .subscribe({
        next: (response) => {
          if (response.success && response.response) {

            const conceptRateExistente = response.response.find(cr =>
              cr.tipoTarifa.id === tipoTarifaId &&
              cr.tipoConcepto.id === tipoConceptoId
            );

            if (conceptRateExistente) {

              if (conceptRateExistente.porEstrato && conceptRateExistente.estratos && conceptRateExistente.estratos.length > 0) {

                this.mostrarTablaEstratos = true;
                this.valorTarifa = null;
                this.estratosActuales = conceptRateExistente.estratos.map(estrato => ({
                  id: estrato.id,
                  numero: estrato.estrato,
                  valor: estrato.valor
                }));
                // Actualizar el autoincremental para el próximo estrato
                this.actualizarAutoincrementalEstrato();
              }
              // Verificar si tiene un valor único (sin estratos)
              else if (conceptRateExistente.valor !== null && conceptRateExistente.valor !== undefined) {
                // Existe un valor único, cargarlo en el input
                this.mostrarTablaEstratos = false;
                this.estratosActuales = [];
                this.valorTarifa = conceptRateExistente.valor;
              }
              // Cargar el estado del checkbox
              this.indCalcularMc.set(conceptRateExistente.indCalcularMc);
            } else {
              // No existen datos, resetear el estado y permitir al usuario decidir
              this.mostrarTablaEstratos = false;
              this.estratosActuales = [];
              this.valorTarifa = null;
              this.indCalcularMc.set(true);
            }
          } else {
            // No existen datos, resetear el estado
            this.mostrarTablaEstratos = false;
            this.estratosActuales = [];
            this.valorTarifa = null;
            this.indCalcularMc.set(true);
          }
        },
        error: (error) => {
          console.error('Error al verificar estratos:', error);

          // Verificar si es un error 404
          if (error.status === 404) {
          } else {
            console.error('Error al verificar datos existentes:', error);
            this.toastService.error('Error', 'Error al verificar datos existentes');
          }

          // En caso de error, permitir al usuario decidir y agregar los datos
          this.mostrarTablaEstratos = false;
          this.estratosActuales = [];
          this.valorTarifa = null;
          this.indCalcularMc.set(true);
        },
        complete: () => {
          this.cargandoEstratos.set(false);
        }
      });
  }

  toggleTablaEstratos(): void {
    this.mostrarTablaEstratos = !this.mostrarTablaEstratos;

    if (this.mostrarTablaEstratos) {
      if (this.estratosActuales.length === 0) {
        this.estratosActuales = [];
        this.nuevoEstratoNumero = 1;
      } else {
        // Si hay estratos existentes, actualizar el autoincremental
        this.actualizarAutoincrementalEstrato();
      }
    }
  }

  agregarNuevoEstrato(): void {
    if (this.nuevoEstratoValor !== null && this.nuevoEstratoValor > 0) {
      const maxId =
        this.estratosActuales.length > 0
          ? Math.max(...this.estratosActuales.map((e) => e.id))
          : 0;

      const nuevoEstrato: Estrato = {
        id: maxId + 1,
        numero: this.nuevoEstratoNumero,
        valor: this.nuevoEstratoValor,
      };

      this.estratosActuales.push(nuevoEstrato);
      this.estratosActuales.sort((a, b) => a.numero - b.numero);

      // Limpiar campos y actualizar autoincremental
      this.actualizarAutoincrementalEstrato();
      this.nuevoEstratoValor = null;
    }
  }

  eliminarEstrato(id: number): void {
    const estrato = this.estratosActuales.find(e => e.id === id);
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
        'Error: No se pudo obtener el usuario actual'
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
            'El tipo de Tarifa no se pudo Guardar'
          );
        }
        this.guardandoTipoTarifa.set(false);
      },
      error: (error) => {
        this.toastService.error(
          'error',
          'El tipo de Tarifa no se pudo Guardar'
        );

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
              'Tipo de tarifa eliminado exitosamente'
            );
          } else {
            this.toastService.success(
              'error',
              'El tipo de tarifa no se pudo eliminar'
            );
          }
        },
        error: (error) => {
          this.toastService.success(
            'error',
            'El tipo de tarifa no se pudo eliminar intente nuevamente'
          );
          console.error('Error al eliminar el tipo de tarifa:', error);
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
        'Error: No se pudo obtener el usuario actual'
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
      error: (error) => {
        console.error('Error en la operación concepto:', error);
        const errorMsg = this.editandoTipoConcepto()
          ? 'Error al actualizar el tipo de concepto. Por favor, inténtelo de nuevo.'
          : 'Error al guardar el tipo de concepto. Por favor, inténtelo de nuevo.';
        this.toastService.success('error', errorMsg);

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

  // Métodos para el popup de conceptos de tarifa por empresa
  // Métodos para el popup de conceptos de tarifa por empresa
  abrirPopupConceptosTarifaEmpresa(): void {
    this.showPopupConceptosTarifaEmpresa.set(true);

    const empresaId = this.empresaId();
    if (empresaId) {
      this.conceptRateService.getConceptRateByEnterprise(empresaId).subscribe({
        next: (response) => {
          // Manejar respuesta exitosa si es necesario
        },
        error: (error) => {
          console.error('Error al cargar conceptos de tarifa por empresa:', error);
          // El interceptor ya muestra el toast, no necesitamos duplicar el mensaje
        }
      });
    }
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
                'Tipo de concepto eliminado exitosamente'
              );
            } else {
              this.toastService.error(
                'error',
                'El tipo de concepto no se pudo eliminar'
              );
            }
          },
          error: (error) => {
            this.toastService.error(
              'error',
              'El tipo de concepto no se pudo eliminar intente nuevamente'
            );
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

    // Si el estrato tiene ID (existe en BD), hacer petición al servidor
    if (estratoId && estratoId > 0) {
      this.conceptRateService.deleteConceptStratum(estratoId).subscribe({
        next: (response) => {
          if (response?.success === true) {
            // Eliminar del array local solo si la petición fue exitosa
            this.estratosActuales = this.estratosActuales.filter(
              (estrato) => estrato.id !== estratoId
            );
            // Actualizar autoincremental después de eliminar
            this.actualizarAutoincrementalEstrato();
            this.toastService.success(
              'Éxito',
              `Se eliminó exitosamente el estrato ${estratoInfo}`
            );
          } else {
            this.toastService.error(
              'Error',
              response?.message || 'No se pudo eliminar el estrato'
            );
          }
        },
        error: (error) => {
          console.error('Error al eliminar estrato:', error);
          const errorMessage = error?.error?.message || error?.message || 'Error de conexión';
          this.toastService.error(
            'Error',
            `No se pudo eliminar el estrato ${estratoInfo}: ${errorMessage}`
          );
        },
        complete: () => {
          this.cancelDeleteEstrato();
        }
      });
    } else {
      // Si no tiene ID (elemento temporal), eliminar directamente del array
      this.estratosActuales = this.estratosActuales.filter(
        (estrato) => estrato.id !== estratoId
      );
      // Actualizar autoincremental después de eliminar
      this.actualizarAutoincrementalEstrato();
      this.toastService.success(
        'Éxito',
        `Se eliminó el estrato ${estratoInfo}`
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
    const tipoTarifaNombre = this.typeRatesData().find(t => t.id == this.selectedTipoTarifa)?.nombre || 'Sin nombre';
    const tipoConceptoNombre = this.typeConceptsData().find(t => t.id == this.selectedTipoConcepto)?.descripcion || 'Sin descripción';

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
  }

  getTabClasses(tabId: string): string {
    const isActive = this.activeTab() === tabId;
    return isActive ? 'active' : '';
  }
}
