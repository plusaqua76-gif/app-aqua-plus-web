import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../service/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-recover-password',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './recover-password.html',
  styleUrl: './recover-password.css'
})
export class RecoverPassword {
   showPassword: boolean = false;
   showConfirmPassword: boolean = false;
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  form: FormGroup;
  token: string = '';

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  constructor() {
    this.form = this.fb.group({
  password: ['', [
    Validators.required,
    Validators.minLength(8),
    Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_.])[A-Za-z\d@$!%*?&\-_.]{8,}$/)
  ]],
  confirmPassword: ['', Validators.required],
});

    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';

    });
  }

  onSubmit(): void {
  const { password, confirmPassword } = this.form.value;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_.])[A-Za-z\d@$!%*?&\-_.]{8,}$/;
  if (!passwordRegex.test(password)) {
    this.toast.error('Error','La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, un número y un carácter especial.');

    return;
  }

  if (password !== confirmPassword) {
    this.toast.error('Error', 'Las contraseñas no coinciden');
    return;
  }

  this.userService.updatePasswordByToken(this.token, password).subscribe({
    next: res => {
      if (res.success) {
        this.toast.success('Éxito', res.message);
        this.router.navigate(['/auth/login']);
            } else {
        this.toast.error('Error', res.message);
      }
    },
    error: err => {
      console.error(err);
      this.toast.error('Error', 'Ocurrió un error al actualizar la contraseña. Por favor, intenta de nuevo más tarde.');
    }
  });
}

}
