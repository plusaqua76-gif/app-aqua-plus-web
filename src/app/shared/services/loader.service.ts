import { Injectable, signal } from '@angular/core';

export interface LoaderState {
  isLoading: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private readonly loaderState = signal<LoaderState>({
    isLoading: false,
    message: undefined
  });

  // Contador para manejar múltiples peticiones simultáneas
  private requestCount = 0;

  // Readonly accessor para el estado
  readonly state = this.loaderState.asReadonly();

  /**
   * Muestra el loader
   * @param message Mensaje opcional a mostrar
   */
  show(message?: string): void {
    this.requestCount++;
    this.loaderState.set({
      isLoading: true,
      message: message || 'Cargando...'
    });
  }

  /**
   * Oculta el loader
   */
  hide(): void {
    this.requestCount = Math.max(0, this.requestCount - 1);

    // Solo ocultar si no hay más peticiones pendientes
    if (this.requestCount === 0) {
      this.loaderState.set({
        isLoading: false,
        message: undefined
      });
    }
  }

  /**
   * Fuerza el ocultamiento del loader (útil para casos excepcionales)
   */
  forceHide(): void {
    this.requestCount = 0;
    this.loaderState.set({
      isLoading: false,
      message: undefined
    });
  }

  /**
   * Actualiza solo el mensaje sin cambiar el estado de loading
   * @param message Nuevo mensaje
   */
  updateMessage(message: string): void {
    if (this.loaderState().isLoading) {
      this.loaderState.update(current => ({
        ...current,
        message
      }));
    }
  }

  /**
   * Ejecuta una operación async mostrando el loader automáticamente
   * @param operation Función async a ejecutar
   * @param message Mensaje opcional
   * @returns Promise con el resultado de la operación
   */
  async withLoader<T>(
    operation: () => Promise<T>,
    message?: string
  ): Promise<T> {
    try {
      this.show(message);
      return await operation();
    } finally {
      this.hide();
    }
  }

  /**
   * Obtiene el número de peticiones activas (útil para debugging)
   */
  getActiveRequestCount(): number {
    return this.requestCount;
  }
}
