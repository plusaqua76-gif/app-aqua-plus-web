import { Injectable, afterNextRender, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

/**
 * Servicio seguro para manejar sessionStorage/localStorage en entornos SSR.
 * Usa afterNextRender para garantizar que solo se accede al storage en el navegador.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Signal para rastrear si el storage está disponible
  private storageReady = signal<boolean>(false);

  // Cache temporal para valores antes de que el storage esté disponible
  private temporaryCache = new Map<string, string>();

  constructor() {
    // Usar afterNextRender para inicializar el acceso al storage
    if (this.isBrowser) {
      afterNextRender(() => {
        this.storageReady.set(true);
        // Volcar el cache temporal al sessionStorage real
        this.flushTemporaryCache();
      });
    }
  }

  /**
   * Verifica si el storage está disponible
   */
  isStorageAvailable(): boolean {
    return this.isBrowser && this.storageReady();
  }

  /**
   * Obtiene un item del sessionStorage de forma segura
   */
  getItem(key: string): string | null {
    if (!this.isBrowser) {
      return null;
    }

    if (!this.storageReady()) {
      // Si aún no está listo, intentar obtener del cache temporal
      return this.temporaryCache.get(key) || null;
    }

    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading from sessionStorage (key: ${key}):`, error);
      return null;
    }
  }

  /**
   * Guarda un item en sessionStorage de forma segura
   */
  setItem(key: string, value: string): void {
    if (!this.isBrowser) {
      return;
    }

    if (!this.storageReady()) {
      // Si aún no está listo, guardar en cache temporal
      this.temporaryCache.set(key, value);
      return;
    }

    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error writing to sessionStorage (key: ${key}):`, error);
    }
  }

  /**
   * Elimina un item del sessionStorage de forma segura
   */
  removeItem(key: string): void {
    if (!this.isBrowser) {
      return;
    }

    if (!this.storageReady()) {
      this.temporaryCache.delete(key);
      return;
    }

    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from sessionStorage (key: ${key}):`, error);
    }
  }

  /**
   * Limpia todo el sessionStorage de forma segura
   */
  clear(): void {
    if (!this.isBrowser) {
      return;
    }

    if (!this.storageReady()) {
      this.temporaryCache.clear();
      return;
    }

    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }

  /**
   * Obtiene un objeto parseado del sessionStorage
   */
  getObject<T>(key: string): T | null {
    const item = this.getItem(key);
    if (!item) {
      return null;
    }

    try {
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error parsing JSON from sessionStorage (key: ${key}):`, error);
      return null;
    }
  }

  /**
   * Guarda un objeto en sessionStorage como JSON
   */
  setObject<T>(key: string, value: T): void {
    try {
      const jsonString = JSON.stringify(value);
      this.setItem(key, jsonString);
    } catch (error) {
      console.error(`Error stringifying object for sessionStorage (key: ${key}):`, error);
    }
  }

  /**
   * Vuelca el cache temporal al sessionStorage real
   */
  private flushTemporaryCache(): void {
    if (!this.storageReady() || !this.isBrowser) {
      return;
    }

    try {
      this.temporaryCache.forEach((value, key) => {
        sessionStorage.setItem(key, value);
      });
      this.temporaryCache.clear();
    } catch (error) {
      console.error('Error flushing temporary cache to sessionStorage:', error);
    }
  }

  /**
   * Ejecuta una función después de que el storage esté disponible
   */
  whenReady(callback: () => void): void {
    if (!this.isBrowser) {
      return;
    }

    if (this.storageReady()) {
      callback();
    } else {
      afterNextRender(() => {
        callback();
      });
    }
  }
}
