import { Injectable } from '@angular/core';
import { IToast } from '@interfaces/toast/Toast';
import { ToastType } from '@interfaces/toast/ToastType';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toasts$ = new BehaviorSubject<IToast[]>([]);
  readonly toasts$ = this._toasts$.asObservable();

  show(type: ToastType, title: string, message: string, timeout = 4000) {
    const toast: IToast = { id: crypto.randomUUID(), type, title, message, timeout };
    this._toasts$.next([toast, ...this._toasts$.value]);

    setTimeout(() => this.dismiss(toast.id), timeout);
  }
  success(t: string, m: string) {
    this.show('success', t, m);
  }
  error(t: string, m: string) {
    this.show('error', t, m);
  }
  warning(t: string, m: string) {
    this.show('warning', t, m);
  }
  info(t: string, m: string) {
    this.show('info', t, m);
  }

  dismiss(id: string) {
    this._toasts$.next(this._toasts$.value.filter((t) => t.id !== id));
  }
}
