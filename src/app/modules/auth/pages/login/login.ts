import { CommonModule } from '@angular/common';
import {Component,signal,effect,inject, ChangeDetectionStrategy,} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Buttoon } from '@shared/components/button';
import { Link } from '@shared/components/link';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@services/toast.service';
import { AuthService } from '../../service/auth.service';
import { ApiResponse } from '@interfaces/Iresponse';
import { IAuthResponse } from '@interfaces/Iuser';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';

type Creds = { user: string; pass: string };

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Buttoon, Link],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly toast  = inject(ToastService);
  private readonly router = inject(Router);
  private readonly auth   = inject(AuthService);

  showPassword = false;
  username = signal('');
  password = signal('');

  creds = signal<Creds | undefined>(undefined);

  attempted = signal(false);

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  readonly login = rxResource<ApiResponse<IAuthResponse>, Creds | undefined>({
    stream: ({ params }) => {
      if (!params) return EMPTY;
      return this.auth.login(params.user, params.pass);
    },
    params: () => this.creds(),
    defaultValue: undefined,
  });

  onSubmit(): void {
    if (!this.username() || !this.password()) {
      this.toast.error('Error', 'Por favor, completa ambos campos');
      return;
    }
    this.attempted.set(true);
    this.creds.set({ user: this.username(), pass: this.password() });
  }

  readonly loginFx = effect(() => {
    if (!this.attempted()) return;

    switch (this.login.status()) {
      case 'loading':
        return;

      case 'resolved': {
        const resp = this.login.value()!;
        if (resp.code === 200 && resp.response?.token) {
          this.toast.success('Bienvenido', 'Inicio de sesión exitoso');
          this.router.navigate(['/start']);
        } else {
          this.toast.error(
            'Error de autenticación',
            resp.message ?? 'Credenciales inválidas'
          );
        }
        break;
      }

      case 'error': {
        const err: any = this.login.error();
        const msg =
          err?.status === 401
            ? err.error?.message ?? 'Credenciales inválidas'
            : 'Problema de conexión. Inténtalo más tarde.';
        const title =
          err?.status === 401
            ? 'Credenciales incorrectas'
            : 'Error de conexión';
        this.toast.error(title, msg);
        break;
      }
    }
  });
}
