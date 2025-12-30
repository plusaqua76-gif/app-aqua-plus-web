import { Component, inject, signal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";
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

  dianForm!: FormGroup;
  isLoading = false;
  selectedDepartment = signal<string>('');

  constructor() {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.dianForm = this.fb.group({
      useAlegraCertificate: [false],
      notificationEnabled: [true],
      identificationType: ['', Validators.required],
      identification: ['', Validators.required],
      dv: ['', Validators.required],
      regimeCode: ['', Validators.required],
      name: ['', Validators.required],
      tradeName: ['', Validators.required],
      type: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      country: ['CO', Validators.required],
      department: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
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

    ParamsGeneral = rxResource({
    stream: () => this.generalsParamsService.getGeneralsParams(),
  });

  onDepartmentChange(departmentCode: string): void {
    this.selectedDepartment.set(departmentCode);
    this.dianForm.patchValue({ city: '' });
  }


  onSubmit(): void {
    if (this.dianForm.invalid) {
      this.toast.warning('Formulario Incompleto', 'Por favor complete todos los campos requeridos');
      return;
    }

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
        const idCompany = response.response.company.id;
        this.invoiceService.sendTestDian(+idCompany).subscribe({
          next: (testResponse) => {
            this.toast.success('Éxito', 'Empresa habilitada para facturación electrónica y prueba enviada a DIAN');
            this.isLoading = false;
          },
          error: (error) => {
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
      }
    });

  }
}
