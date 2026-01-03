import { Component, computed, effect, inject, PLATFORM_ID, signal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { RouterLink } from "@angular/router";
import { ToastService } from "@services/toast.service";
import { rxResource } from "@angular/core/rxjs-interop";
import { LocationDianService } from "../../services/locations.service";
import { TypeDocumentService } from "../../../client/service/typeDocument.service";
import { catchError, of } from "rxjs";
import { GeneralsParamsService } from "@shared/services/generals-params.service";
import { InvoiceService } from "../../services/invoice.service";

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invoice.html',
})
export class Invoice {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private locationDianService = inject(LocationDianService);
  private typeDocumentService = inject(TypeDocumentService);
  private generalsParamsService = inject(GeneralsParamsService);
  private invoiceService = inject(InvoiceService);
  protected platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);
  testId = signal<string>('');
  companyId = signal<string | null>(null);

  dianForm!: FormGroup;
  resolutionForm!: FormGroup;
  testSetForm!: FormGroup;
  isLoading = false;
  isLoadingResolution = false;
  isLoadingTestSet = false;
  selectedDepartment = signal<string>('');
  showRegimeCodeHelp = signal<boolean>(false);

  // Control de habilitación DIAN - solo una vez por sesión
  isDianProcessStarted = signal<boolean>(false);
  private readonly DIAN_PROCESS_KEY = 'aquaplus_dian_process_started';

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


  constructor() {
    this.initializeForm();
    this.initializeResolutionForm();
    this.initializeTestSetForm();
    // Verificar si el proceso ya fue iniciado en esta sesión
    this.checkDianProcessStatus();
  }

  /**
   * Verifica si el proceso de habilitación ya fue iniciado en esta sesión
   */
  private checkDianProcessStatus(): void {
    if (this.isBrowser) {
      const processStarted = sessionStorage.getItem(this.DIAN_PROCESS_KEY);
      if (processStarted === 'true') {
        this.isDianProcessStarted.set(true);
      }
    }
  }

  /**
   * Marca el proceso de habilitación como iniciado
   */
  private markDianProcessAsStarted(): void {
    if (this.isBrowser) {
      sessionStorage.setItem(this.DIAN_PROCESS_KEY, 'true');
      this.isDianProcessStarted.set(true);
    }
  }

  /**
   * Limpia el flag del proceso de habilitación
   * Se llama después de completar exitosamente el registro de la resolución
   */
  private clearDianProcessFlag(): void {
    if (this.isBrowser) {
      sessionStorage.removeItem(this.DIAN_PROCESS_KEY);
      this.isDianProcessStarted.set(false);
    }
  }

  private initializeForm(): void {
    this.dianForm = this.fb.group({
      useAlegraCertificate: [true],
      notificationEnabled: [true],
      identificationType: ['', Validators.required],
      identification: ['', Validators.required],
      dv: ['', Validators.required],
      regimeCode: ['', Validators.required],
      name: ['', Validators.required],
      tradeName: ['', Validators.required],
      type: ['associated'],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      country: ['CO', Validators.required],
      department: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
    });

    // Auto-prellenar DV cuando se ingrese un NIT
    this.dianForm.get('identification')?.valueChanges.subscribe(value => {
      const identificationType = this.dianForm.get('identificationType')?.value;
      // Solo auto-prellenar si el tipo es NIT (código 31)
      if (identificationType === '31' && value && value.length > 0) {
        const lastDigit = value.toString().slice(-1);
        // Prellenar el DV con el último dígito del NIT
        this.dianForm.get('dv')?.setValue(lastDigit, { emitEvent: false });
      }
    });

    // Limpiar DV si cambia el tipo de documento
    this.dianForm.get('identificationType')?.valueChanges.subscribe(value => {
      if (value !== '31') {
        this.dianForm.get('dv')?.setValue('', { emitEvent: false });
      }
    });
  }

  private initializeResolutionForm(): void {
    this.resolutionForm = this.fb.group({
      numero: ['', [
        Validators.required,
        Validators.pattern(/^1876[0-9]+$/),
        Validators.minLength(10)
      ]],
      prefijo: ['', [
        Validators.required,
        Validators.pattern(/^[A-Z]{2,4}$/),
        Validators.maxLength(4)
      ]],
      numeroMinimo: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]+$/),
        Validators.min(1)
      ]],
      numeroMaximo: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]+$/),
        Validators.min(1)
      ]],
      numeroActual: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]+$/)
      ]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      claveTecnica: ['', [
        Validators.required,
        Validators.minLength(32),
        Validators.maxLength(64),
        Validators.pattern(/^[a-zA-Z0-9]+$/)
      ]],
      activo: [true]
    }, { validators: this.resolutionValidator.bind(this) });
  }

  private resolutionValidator(form: FormGroup) {
    const errors: any = {};

    const numeroMinimo = form.get('numeroMinimo')?.value;
    const numeroMaximo = form.get('numeroMaximo')?.value;
    const numeroActual = form.get('numeroActual')?.value;
    const fechaInicio = form.get('fechaInicio')?.value;
    const fechaFin = form.get('fechaFin')?.value;

    // Validar que el mínimo sea menor que el máximo
    if (numeroMinimo && numeroMaximo && parseInt(numeroMinimo) >= parseInt(numeroMaximo)) {
      errors['rangoInvalido'] = true;
    }

    // Validar que el número actual esté en el rango
    if (numeroMinimo && numeroMaximo && numeroActual) {
      const actual = parseInt(numeroActual);
      const minimo = parseInt(numeroMinimo);
      const maximo = parseInt(numeroMaximo);
      if (actual < minimo || actual > maximo) {
        errors['numeroActualFueraDeRango'] = true;
      }
    }

    // Validar fechas
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (inicio >= fin) {
        errors['fechasInvalidas'] = true;
      }

      if (fin < hoy) {
        errors['resolucionVencida'] = true;
      }
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  get resolutionFormErrors() {
    return this.resolutionForm.errors || {};
  }

  private initializeTestSetForm(): void {
    this.testSetForm = this.fb.group({
      testSetId: ['', Validators.required]
    });
  }


  dataTypeDocument = rxResource({
    stream: () => this.typeDocumentService.getAllTypeDocument().pipe(
      catchError((error) => {
        console.error('Error loading type documents:', error);
        return of({ success: false, response: [] });
      })
    )
  })


  typeDocumentsDian = rxResource({
    stream: () => this.locationDianService.getTypeDocumentsDian().pipe(
      catchError((error) => {
        console.error('Error loading type documents DIAN:', error);
        return of({ success: false, message: 'Error', code: 500, response: [] });
      })
    )
  })

  dataDepartamentsDian = rxResource({
    stream: () => this.locationDianService.GetDepartmentsDian().pipe(
      catchError((error) => {
        console.error('Error loading departments:', error);
        return of({ success: false, message: 'Error', code: 500, response: [] });
      })
    )
  })

  dataMunicipalitiesDian = rxResource({
    params: () => ({ departmentCode: this.selectedDepartment() }),
    stream: ({ params }) => {
      const { departmentCode } = params;
      if (!departmentCode) {
        return of({ success: false, message: 'No department selected', code: 400, response: [] });
      }
      return this.locationDianService.GetMunicipalitiesByDepartment(departmentCode).pipe(
        catchError((error) => {
          console.error('Error loading municipalities:', error);
          return of({ success: false, message: 'Error', code: 500, response: [] });
        })
      );
    }
  })

  //   ParamsGeneral = rxResource({
  //   stream: () => this.generalsParamsService.getGeneralsParams(),
  // });

  onDepartmentChange(departmentCode: string): void {
    this.selectedDepartment.set(departmentCode);
    this.dianForm.patchValue({ city: '' });
  }

  onTestSetIdInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  this.testId.set(value);
  console.log('TestSetId:', value);
}


  onSubmit(): void {
    if (this.dianForm.invalid) {
      this.toast.warning('Formulario Incompleto', 'Por favor complete todos los campos requeridos');
      return;
    }

    // Verificar si el proceso ya fue iniciado
    if (this.isDianProcessStarted()) {
      this.toast.info('Proceso en curso', 'La habilitación de facturación electrónica ya fue iniciada en esta sesión. Completa los pasos restantes.');
      return;
    }

    // Prevenir múltiples clics mientras se procesa
    if (this.isLoading) {
      return;
    }

    // Marcar el proceso como iniciado ANTES de la llamada HTTP
    this.markDianProcessAsStarted();
    this.isLoading = true;
    const formValue = this.dianForm.value;
    const payload = {
      useAlegraCertificate: formValue.useAlegraCertificate,
      notificationByEmail: {
        enabled: formValue.notificationEnabled
      },
      address: {
        city: formValue.city,
        department: formValue.department,
        country: formValue.country,
        address: formValue.address
      },
      regimeCode: formValue.regimeCode,
      identificationType: formValue.identificationType,
      name: formValue.name,
      identification: formValue.identification,
      tradeName: formValue.tradeName,
      dv: formValue.dv,
      type: formValue.type,
      email: formValue.email,
      phone: formValue.phone
    };

    this.invoiceService.creteCompany(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        const idCompany = response.response.company.id;
        this.companyId.set(idCompany);
        this.toast.success('¡Empresa registrada!', 'Empresa habilitada correctamente en la DIAN');
      },
      error: (error) => {
        this.isLoading = false;
        // Si falla el registro, permitir reintentar limpiando el flag
        this.clearDianProcessFlag();
        this.toast.error('Error al registrar empresa', 'Por favor verifica los datos e intenta nuevamente');
        console.error('Error:', error);
      }
    });

  }

  onSubmitResolution(): void {
    if (this.resolutionForm.invalid) {
      this.resolutionForm.markAllAsTouched();
      this.toast.warning('Formulario Incompleto', 'Por favor verifica que todos los campos estén correctamente diligenciados');
      return;
    }

    this.isLoadingResolution = true;
    const formValue = this.resolutionForm.value;
    const payload = {
      numero: formValue.numero,
      prefijo: formValue.prefijo.toUpperCase(),
      numeroMinimo: parseInt(formValue.numeroMinimo),
      numeroMaximo: parseInt(formValue.numeroMaximo),
      numeroActual: parseInt(formValue.numeroActual),
      fechaInicio: formValue.fechaInicio,
      fechaFin: formValue.fechaFin,
      claveTecnica: formValue.claveTecnica.trim(),
      empresa: {
        id: this.empresaId()
      },
      activo: true,
      usuarioCreacion: this.nombreUsuario()
    };

    this.invoiceService.resolutionInvoiceDian(payload).subscribe({
      next: (response) => {
        this.isLoadingResolution = false;

        // Limpiar el flag del proceso de habilitación después del último paso exitoso
        this.clearDianProcessFlag();

        // Mostrar mensajes de éxito y siguiente paso
        this.toast.success('¡Resolución registrada!', 'Ya puedes comenzar a emitir facturas electrónicas');
        this.toast.info('info', 'Cierra sesión y vuelve a iniciar, Para que la facturación electrónica quede completamente habilitada, por favor cierra tu sesión actual y vuelve a iniciar sesión.');
      },
      error: (error) => {
        this.isLoadingResolution = false;
        this.toast.error('Error al registrar resolución', 'Verifica que los datos coincidan exactamente con tu resolución DIAN');
        console.error('Error:', error);
      }
    });
  }

  onSubmitTestSet(): void {
    if (this.testSetForm.invalid) {
      this.testSetForm.markAllAsTouched();
      this.toast.warning('TestSetId inválido', 'Por favor ingresa un TestSetId válido con formato UUID');
      return;
    }

    const empresaId = this.companyId();
    if (!empresaId) {
      this.toast.warning('Empresa no registrada', 'Primero debes completar el registro de la empresa en el formulario de la derecha');
      return;
    }

    this.isLoadingTestSet = true;

    this.invoiceService.sendTestDian(empresaId).subscribe({
      next: (response) => {
        this.isLoadingTestSet = false;
        this.toast.success('¡Set de pruebas enviado!', 'El set de pruebas se ha enviado correctamente a la DIAN. Espera la confirmación por correo.');
        this.testSetForm.reset();
      },
      error: (error) => {
        this.isLoadingTestSet = false;
        this.toast.error('Error al enviar set de pruebas', 'No se pudo enviar el set de pruebas a la DIAN. Verifica que la empresa esté correctamente registrada.');
        console.error('Error:', error);
      }
    });
  }
}
