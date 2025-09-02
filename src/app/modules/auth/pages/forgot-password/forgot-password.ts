import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../service/user.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  form: FormGroup;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.form = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      const control = this.form.get('correo');

      if (control?.errors?.['required']) {
        // Swal.fire({
        //   icon: 'warning',
        //   title: 'Correo requerido',
        //   text: 'Por favor, ingresa tu dirección de correo electrónico.',
        // });
      } else if (control?.errors?.['email']) {
        // Swal.fire({
        //   icon: 'error',
        //   title: 'Correo no válido',
        //   text: 'Por favor, ingresa una dirección de correo válida.',
        // });
      }
      return;
    }
    const correo = this.form.get('correo')?.value;
    this.userService.recoverPassword(correo).subscribe({
      next: (res) => {
        if (res.success) {
          // Swal.fire({
          //   icon: 'success',
          //   title: 'Correo enviado',
          //   text: res.message,
          // });
        } else {
          // Swal.fire({
          //   icon: 'warning',
          //   title: 'No se pudo enviar',
          //   text: res.message,
          // });
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error en el backend:', err);
        if (err.status === 404) {
          const errorMessage = err.error && err.error.message ? err.error.message : 'Correo no encontrado o inactivo.';
          // Swal.fire({
          //   icon: 'error',
          //   title: 'Correo no encontrado',
          //   text: errorMessage,
          //   confirmButtonColor: '#d33',
          // });
        } else {
          // Swal.fire({
          //   icon: 'error',
          //   title: 'Error de servidor',
          //   text: 'Ocurrió un error al intentar enviar el correo. Por favor, intenta de nuevo más tarde.',
          //   confirmButtonColor: '#d33',
          // });
        }
      }
    });
  }
}
