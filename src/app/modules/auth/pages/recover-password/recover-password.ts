import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { PasswordRecoveryService } from '../../service/password-recovery.service';
import { ToastService } from '@services/toast.service';

@Component({
  selector: 'app-recover-password',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './recover-password.html',
  styleUrl: './recover-password.css'
})
export class RecoverPassword implements OnInit, OnDestroy {
  // Visibility toggles
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  // Form and loading state
  form!: FormGroup;
  isLoading: boolean = false;

  // Token from URL
  private recoveryToken: string = '';

  // Services
  private readonly fb = inject(FormBuilder);
  private readonly passwordRecoveryService = inject(PasswordRecoveryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  // Destroy subject for cleanup
  private readonly destroy$ = new Subject<void>();

  constructor() {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.extractTokenFromUrl();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa el formulario con validaciones
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordValidator
      ]],
      confirmPassword: ['', [
        Validators.required
      ]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Extrae el token de los parámetros de la URL
   */
  private extractTokenFromUrl(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const rawToken = params['Authorization'] || params['token'] || '';

        if (!rawToken) {
          this.toast.error('Error', 'Token de recuperación no encontrado en la URL');
          this.router.navigate(['/auth/forgot-password']);
          return;
        }

        // Decodificar el token
        this.recoveryToken = decodeURIComponent(rawToken);

        if (!this.recoveryToken) {
          this.toast.error('Error', 'Token de recuperación inválido');
          this.router.navigate(['/auth/forgot-password']);
        }
      });
  }

  /**
   * Validador personalizado para contraseñas
   */
  private passwordValidator(control: any) {
    const password = control.value;
    if (!password) return null;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&\-_.]/.test(password);
    const isValidLength = password.length >= 8;

    const isValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isValidLength;

    return isValid ? null : {
      passwordStrength: {
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSpecialChar,
        isValidLength
      }
    };
  }

  /**
   * Validador para verificar que las contraseñas coincidan
   */
  private passwordMatchValidator(form: any) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  /**
   * Toggle para mostrar/ocultar contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Toggle para mostrar/ocultar confirmación de contraseña
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Obtiene los errores de validación de contraseña para mostrar al usuario
   */
  getPasswordErrors(): string[] {
    const errors: string[] = [];
    const passwordControl = this.form.get('password');

    if (!passwordControl?.errors || !passwordControl.touched) {
      return errors;
    }

    const strengthErrors = passwordControl.errors['passwordStrength'];
    if (!strengthErrors) {
      return errors;
    }

    const errorMessages = [
      { condition: !strengthErrors.isValidLength, message: 'Debe tener al menos 8 caracteres' },
      { condition: !strengthErrors.hasUpperCase, message: 'Debe contener al menos una letra mayúscula' },
      { condition: !strengthErrors.hasLowerCase, message: 'Debe contener al menos una letra minúscula' },
      { condition: !strengthErrors.hasNumber, message: 'Debe contener al menos un número' },
      { condition: !strengthErrors.hasSpecialChar, message: 'Debe contener al menos un carácter especial (@$!%*?&-_.)' }
    ];

    return errorMessages
      .filter(error => error.condition)
      .map(error => error.message);
  }

  /**
   * Verifica si el formulario es válido
   */
  get isFormValid(): boolean {
    return this.form.valid && this.recoveryToken.length > 0;
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (!this.isFormValid || this.isLoading) {
      return;
    }

    const { password } = this.form.value;
    this.isLoading = true;

    this.passwordRecoveryService.updatePasswordWithToken(this.recoveryToken, password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;

          if (response?.success) {
            this.toast.success('¡Éxito!', 'Tu contraseña ha sido actualizada correctamente');
            this.router.navigate(['/auth/login']);
          } else {
            this.toast.error('Error', response?.message || 'Error al actualizar la contraseña');
          }
        },
        error: (error: any) => {
          this.isLoading = false;

          let errorMessage = 'Ocurrió un error al actualizar la contraseña';

          if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.status === 401) {
            errorMessage = 'El token de recuperación ha expirado o es inválido';
          } else if (error?.status === 400) {
            errorMessage = 'Los datos enviados no son válidos';
          }

          this.toast.error('Error', errorMessage);
        }
      });
  }
}
