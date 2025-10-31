import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common'
import { inject, Injectable, PLATFORM_ID } from '@angular/core'

/**
 * Service to manage preconnect links and dynamic script loading for improving performance.
 * This service adds preconnect links and loads external scripts when needed.
 */
@Injectable({ providedIn: 'root' })
export class PreconnetManager {
  private readonly platformId = inject(PLATFORM_ID)
  private readonly document = inject(DOCUMENT)

  /**
   * Sets preconnect links for external domains to improve performance.
   * This method runs on both server and browser for maximum compatibility.
   */
  setDomainPreconnet(): void {
    const domains = [
      'https://cdn.jsdelivr.net',
      'https://unpkg.com'
    ]

    domains.forEach(domain => {
      // Check if preconnect already exists
      const existingPreconnect = this.document.querySelector(`link[rel="preconnect"][href="${domain}"]`)

      if (!existingPreconnect) {
        const preconnectLink = this.document.createElement('link')
        preconnectLink.rel = 'preconnect'
        preconnectLink.href = domain
        preconnectLink.crossOrigin = 'anonymous'
        this.document.head.appendChild(preconnectLink)

        // Also add dns-prefetch as fallback
        const dnsPrefetchLink = this.document.createElement('link')
        dnsPrefetchLink.rel = 'dns-prefetch'
        dnsPrefetchLink.href = domain
        this.document.head.appendChild(dnsPrefetchLink)
      }
    })
  }

  /**
   * Loads external scripts dynamically in the browser.
   * This method only runs on the browser platform.
   */
  loadExternalScripts(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadApexCharts()
      this.loadSplineViewer()
    }
  }

  /**
   * Loads ApexCharts library if not already loaded.
   */
  private loadApexCharts(): void {
    if (!this.document.querySelector('script[src*="apexcharts"]')) {
      const script = this.document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/apexcharts@3.46.0/dist/apexcharts.min.js'
      script.async = true
      this.document.head.appendChild(script)
    }
  }

  /**
   * Loads Spline Viewer library if not already loaded.
   */
  private loadSplineViewer(): void {
    if (!this.document.querySelector('script[src*="spline-viewer"]')) {
      const script = this.document.createElement('script')
      script.src = 'https://unpkg.com/@splinetool/viewer@1.10.48/build/spline-viewer.js'
      script.type = 'module'
      script.async = true
      this.document.head.appendChild(script)
    }
  }
}
