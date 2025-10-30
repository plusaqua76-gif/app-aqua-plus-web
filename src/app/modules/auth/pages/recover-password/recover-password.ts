import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { PasswordRecoveryService } from '../../service/password-recovery.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recover-password.html',
  styleUrl: './recover-password.css',
})
export class RecoverPassword implements OnInit {
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  private recoveryToken = '';
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly passwordRecoveryService = inject(PasswordRecoveryService);
  private readonly toast = inject(ToastService);
  readonly form: FormGroup = this.fb.group(
    {
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    {
      validators: this.match('password', 'confirmPassword'),
    }
  );

  ngOnInit(): void {
    const token = this.passwordRecoveryService.getTokenFromRoute(this.route);

    if (token) {
      this.recoveryToken = token.trim();
    }
  }

  private match(a: string, b: string) {
    return (control: AbstractControl) => {
      const form = control as FormGroup;
      const x = form.get(a)?.value;
      const y = form.get(b)?.value;
      return x && y && x !== y ? { passwordMismatch: true } : null;
    };
  }

  get passwordCtrl() {
    return this.form.get('password');
  }
  get confirmCtrl() {
    return this.form.get('confirmPassword');
  }
  get isFormValid() {
    return this.form.valid;
  }

  get passwordErrors(): string[] {
    const c = this.passwordCtrl;
    if (!c || (!c.touched && !c.dirty)) return [];

    const errs: string[] = [];
    if (c.hasError('required')) errs.push('La contraseña es obligatoria');
    if (c.hasError('minlength')) errs.push('Debe tener al menos 8 caracteres');
    if (c.hasError('pattern')) {
      errs.push(
        'Debe incluir mayúscula, minúscula, número y carácter especial (@$!%*?&-_.)'
      );
    }
    return errs;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid || this.isLoading) return;

    if (!this.recoveryToken) {
      this.toast.error('Error', 'No se encontró el token de activación en la URL');
      return;
    }

    this.isLoading = true;
    const password = this.passwordCtrl?.value as string;

    try {
      const res = await firstValueFrom(
        this.passwordRecoveryService.updatePasswordWithToken(this.recoveryToken, password)
      );

      if (res?.success) {
        this.toast.success(
          '¡Cuenta Activada!',
          'Tu contraseña ha sido configurada. Ya puedes iniciar sesión.'
        );
        // Redirigir al login después del éxito
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      } else {
        this.toast.error(
          'Error',
          res?.message || 'Error al configurar la contraseña'
        );
      }
    } finally {
      this.isLoading = false;
    }
  }
}
