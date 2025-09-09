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
  private readonly toast = inject(ToastService);
  private readonly service = inject(PasswordRecoveryService);
  readonly form: FormGroup = this.fb.group(
    {
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_.]).{8,}$/
          ),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    {
      validators: this.match('password', 'confirmPassword'),
    }
  );

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;

    const allKeys = qp.keys;
    const keyAuth = allKeys.find((k) => k.toLowerCase() === 'authorization');
    const keyToken = allKeys.find((k) => k.toLowerCase() === 'token');

    const raw =
      (keyAuth ? qp.get(keyAuth) : null) ??
      (keyToken ? qp.get(keyToken) : null) ??
      '';

    if (!raw) {
      this.toast.error(
        'Error',
        'Token de recuperación no encontrado en la URL'
      );
      this.router.navigate(['/auth/forgot-password']);
      return;
    }

    this.recoveryToken = raw.replace(/^Bearer\s+/i, '').trim();

    if (!this.recoveryToken) {
      this.toast.error('Error', 'Token de recuperación inválido');
      this.router.navigate(['/auth/forgot-password']);
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
    return this.form.valid && !!this.recoveryToken;
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

    try {
      this.isLoading = true;
      const password = this.passwordCtrl?.value as string;

      const res = await firstValueFrom(
        this.service.updatePasswordWithToken(this.recoveryToken, password)
      );

      this.isLoading = false;

      if (res?.success) {
        this.toast.success(
          '¡Éxito!',
          'Tu contraseña ha sido actualizada correctamente'
        );
        this.router.navigate(['/auth/login']);
      } else {
        this.toast.error(
          'Error',
          res?.message || 'Error al actualizar la contraseña'
        );
      }
    } catch (e: any) {
      this.isLoading = false;
      const status = e?.status;
      const message =
        e?.error?.message ??
        (status === 401
          ? 'El token de recuperación ha expirado o es inválido'
          : status === 400
          ? 'Los datos enviados no son válidos'
          : 'Ocurrió un error al actualizar la contraseña');
      this.toast.error('Error', message);
    }
  }
}
