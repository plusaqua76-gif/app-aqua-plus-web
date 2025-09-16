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
import { IrateTypes } from '@interfaces/IrateTypes';
import { ToastService } from '@services/toast.service';
import { TypeConceptService } from '../../services/type-concept.service';
import { ConceptRateService } from '../../services/concept-rate.service';
import { IConceptRatePayload, IEstratoValue } from '@interfaces/IConceptRatePayload';
import { EMPTY, forkJoin } from 'rxjs';
import { Estrato, NuevoItem, TarifaItem } from '../../../../core/interfaces/tipo-tarifa/ITarifaItem';

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

    selectedTipoTarifa: any = null;
  selectedTipoConcepto: any = null;
  valorTarifa: number | null = null;
  mostrarTablaEstratos: boolean = false;
  estratosActuales: Estrato[] = [];
  nuevoEstratoNumero: number = 1;
  nuevoEstratoValor: number | null = null;
  tarifasAgregadas: TarifaItem[] = [];
  guardandoTarifas = signal(false);

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
          ? this.rateTypeService.getRateTypes(enterpriseId)
          : EMPTY
    })
  typeRatesData = computed(() => this.typeRates.value()?.response ?? []);



      dataTypeConcepts = rxResource({
      params: () => ({ enterpriseId: this.empresaId() }),
      stream: ({ params: { enterpriseId } }) =>
        enterpriseId
          ? this.typeConceptService.getAllTypeConcepts(enterpriseId)
          : EMPTY
    })
  typeConceptsData = computed(
    () => this.dataTypeConcepts.value()?.response ?? []
  );

  private nextId = 1;


  private resetFormularioItem(): NuevoItem {
    return { nombre: '', descripcion: '' };
  }

  canAddTarifa(): boolean {
    const hasBasicFields = !!(this.selectedTipoTarifa && this.selectedTipoConcepto);

    if (!hasBasicFields) {
      return false;
    }

    // Si se está mostrando la tabla de estratos, validar que haya al menos un estrato
    if (this.mostrarTablaEstratos) {
      return this.estratosActuales.length > 0;
    }

    // Si NO se está mostrando la tabla de estratos, validar que haya un valor
    return !!(this.valorTarifa !== null && this.valorTarifa > 0);
  } // Agregar una nueva tarifa
  agregarTarifa(): void {
    if (!this.canAddTarifa()) {
      return;
    }

    // Convertir a número si es string
    const tipoTarifaId =
      typeof this.selectedTipoTarifa === 'string'
        ? parseInt(this.selectedTipoTarifa)
        : this.selectedTipoTarifa;
    const tipoConceptoId =
      typeof this.selectedTipoConcepto === 'string'
        ? parseInt(this.selectedTipoConcepto)
        : this.selectedTipoConcepto;

    const tipoTarifaNombre =
      this.typeRatesData().find((t) => t.id === tipoTarifaId)?.nombre || '';
    const tipoConceptoNombre =
      this.typeConceptsData().find((c) => c.id === tipoConceptoId)?.nombre ||
      '';

    const nuevaTarifa: TarifaItem = {
      id: this.nextId++,
      tipoTarifa: tipoTarifaNombre,
      tipoConcepto: tipoConceptoNombre,
      valor: this.valorTarifa!,
      estratos: [...this.estratosActuales],
      tipoTarifaId: tipoTarifaId,
      tipoConceptoId: tipoConceptoId,
    };
    this.tarifasAgregadas.push(nuevaTarifa);
    this.limpiarFormulario();
  }

  eliminarTarifa(id: number): void {
    this.tarifasAgregadas = this.tarifasAgregadas.filter(
      (tarifa) => tarifa.id !== id
    );
  }

  private limpiarFormulario(): void {
    this.selectedTipoTarifa = null;
    this.selectedTipoConcepto = null;
    this.valorTarifa = null;
    this.estratosActuales = [];
    this.mostrarTablaEstratos = false;
    this.nuevoEstratoNumero = 1;
    this.nuevoEstratoValor = null;
  }


  toggleTablaEstratos(): void {
    this.mostrarTablaEstratos = !this.mostrarTablaEstratos;

    if (this.mostrarTablaEstratos) {
      // Si se activa la tabla de estratos, limpiar el valor tarifa concepto
      this.valorTarifa = null;

      // Si no hay estratos, agregar algunos por defecto
      if (this.estratosActuales.length === 0) {
        this.estratosActuales = [
          { id: 1, numero: 1, valor: 1000 },
          { id: 2, numero: 2, valor: 2000 },
          { id: 3, numero: 3, valor: 3000 },
        ];
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

      // Limpiar campos
      this.nuevoEstratoNumero =
        Math.max(...this.estratosActuales.map((e) => e.numero)) + 1;
      this.nuevoEstratoValor = null;
    }
  }

  eliminarEstrato(id: number): void {
    this.estratosActuales = this.estratosActuales.filter(
      (estrato) => estrato.id !== id
    );
  }

  actualizarEstratoValor(estratoId: number, nuevoValor: number): void {
    const estrato = this.estratosActuales.find((e) => e.id === estratoId);
    if (estrato) {
      estrato.valor = nuevoValor;
    }
  }

  guardarTarifas(): void {
    if (this.tarifasAgregadas.length === 0) {
      this.toastService.error('Error', 'No hay tarifas para guardar');
      return;
    }

    const empresaId = this.empresaId();
    const usuario = this.nombreUsuario();

    if (!empresaId) {
      this.toastService.error('Error', 'No se pudo obtener la empresa actual');
      return;
    }

    if (!usuario) {
      this.toastService.error('Error', 'No se pudo obtener el usuario actual');
      return;
    }

    this.guardandoTarifas.set(true);

    // Construir array de payloads
    const payloads: IConceptRatePayload[] = this.tarifasAgregadas.map(tarifa => {
      const payload: IConceptRatePayload = {
        idEmpresa: empresaId,
        idTipoTarifa: tarifa.tipoTarifaId,
        usuarioCreacion: usuario,
        concepto: {
          idTipoConcepto: tarifa.tipoConceptoId,
          indCalcularMc: true,
        }
      };


      if (tarifa.estratos && tarifa.estratos.length > 0) {
        payload.concepto.indCalcularMc = false;
        payload.concepto.valoresEstrato = tarifa.estratos.map((estrato): IEstratoValue => ({
          estrato: estrato.numero,
          valor: estrato.valor
        }));
      } else {
        payload.concepto.valor = tarifa.valor;
      }

      return payload;
    });

    // Enviar todas las tarifas usando forkJoin
    const requests = payloads.map(payload =>
      this.conceptRateService.saveFeeConceptRate(payload)
    );

    forkJoin(requests).subscribe({
      next: (responses) => {
        const exitosas = responses.filter(response => response.success);
        const fallidas = responses.filter(response => !response.success);

        if (exitosas.length === responses.length) {
          this.toastService.success('Éxito', `Se guardaron ${exitosas.length} tarifas exitosamente`);
          this.tarifasAgregadas = [];
          // Los datos del popup de conceptos empresa se actualizarán automáticamente
        } else if (exitosas.length > 0) {
          this.toastService.success('Parcial',
            `Se guardaron ${exitosas.length} de ${responses.length} tarifas. ${fallidas.length} fallaron.`);
          this.tarifasAgregadas = this.tarifasAgregadas.slice(exitosas.length);
        } else {
          this.toastService.error('Error', 'No se pudo guardar ninguna tarifa');
        }

        this.guardandoTarifas.set(false);
      },
      error: (error) => {
        console.error('Error al guardar las tarifas:', error);
        this.toastService.error('Error', 'Error al guardar las tarifas. Por favor, inténtelo de nuevo.');
        this.guardandoTarifas.set(false);
      },
      complete: () => {
        this.guardandoTarifas.set(false);
      }
    });
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
      this.toastService.error('error','Error: No se pudo obtener el usuario actual');
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
                'El tipo de concepto no se pudo eliminar'
              );
        }
        this.guardandoTipoTarifa.set(false);
      },
      error: (error) => {
             this.toastService.error(
                'error',
                'El tipo de concepto no se pudo eliminar'
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
      this.toastService.error('error','Error: No se pudo obtener el usuario actual');
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
           this.toastService.success(
               'error',
                errorMsg
              );
        }

        this.guardandoTipoConcepto.set(false);
      },
      error: (error) => {
        console.error('Error en la operación concepto:', error);
        const errorMsg = this.editandoTipoConcepto()
          ? 'Error al actualizar el tipo de concepto. Por favor, inténtelo de nuevo.'
          : 'Error al guardar el tipo de concepto. Por favor, inténtelo de nuevo.';
         this.toastService.success(
                'error',
                errorMsg
              );

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
  abrirPopupConceptosTarifaEmpresa(): void {
    this.showPopupConceptosTarifaEmpresa.set(true);
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
              this.toastService.success(
                'error',
                'El tipo de concepto no se pudo eliminar'
              );
            }
          },
          error: (error) => {
           this.toastService.success(
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
}
