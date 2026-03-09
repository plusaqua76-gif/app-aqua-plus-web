import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    APP_CONFIG?: AppConfig;
  }
  var APP_CONFIG: AppConfig | undefined;
}

export interface AppConfig {
  apiUrl: string;
  azureBlobStorageUrl: string;
  environment: 'development' | 'test' | 'production';
  production: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly config: AppConfig;

  constructor() {
    console.log('cons config service')
    if (isPlatformBrowser(this.platformId)) {
      this.config = (window as any).APP_CONFIG || this.getDefaultConfig();
    } else {
      this.config = (globalThis as any).APP_CONFIG || this.getDefaultConfig();
    }

    // Fallback para desarrollo local
    if (!this.config.apiUrl) {
      this.config.apiUrl = 'http://localhost:8080/api/v1';
    }

    if (!this.config.production) {
      console.log('🔧 AppConfig loaded:', this.config);
    }
  }

  private getDefaultConfig(): AppConfig {
    return {
      apiUrl: 'http://localhost:8080/api/v1',
      azureBlobStorageUrl: '',
      environment: 'development',
      production: false
    };
  }


  get apiUrl(): string {
    return this.config.apiUrl;
  }

  get azureBlobStorageUrl(): string {
    return this.config.azureBlobStorageUrl;
  }

  get environment(): string {
    return this.config.environment;
  }

  get isProduction(): boolean {
    return this.config.production;
  }

  get isTest(): boolean {
    return this.config.environment === 'test';
  }

  get isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }

  buildApiUrl(endpoint: string): string {
    const baseUrl = this.apiUrl.endsWith('/') ? this.apiUrl.slice(0, -1) : this.apiUrl;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${path}`;
  }

  buildBlobUrl(path: string): string {
    if (!this.azureBlobStorageUrl) return path;
    const baseUrl = this.azureBlobStorageUrl.endsWith('/')
      ? this.azureBlobStorageUrl.slice(0, -1)
      : this.azureBlobStorageUrl;
    const filePath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${filePath}`;
  }
}
