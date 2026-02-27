import { Injectable, inject } from '@angular/core'
import { Meta, Title } from '@angular/platform-browser'
import { Router, NavigationEnd } from '@angular/router'
import { filter } from 'rxjs/operators'

/**
 * Service for managing SEO optimized for SSR.
 * Simple, centralized, and automatically updates based on routes.
 */
@Injectable({
  providedIn: 'root',
})
export class Seo {
  private meta = inject(Meta)
  private title = inject(Title)
  private router = inject(Router)

  /**
   * Initialize SEO with default configuration and route-based updates
   */
  init() {
    // Set default SEO
    this.setDefaultSEO()

    // Listen to route changes and update SEO automatically
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateSEOBasedOnRoute(event.url)
      })
  }

  /**
   * Set the title of the document.
   * @param title - The title to set.
   */
  setTitle(title: string) {
    const fullTitle = title ? `${title} | AquaPlus` : 'AquaPlus'
    this.title.setTitle(fullTitle)
  }

  /**
   * Add or update a meta tag.
   * @param name - The name of the meta tag.
   * @param content - The content of the meta tag.
   */
  updateMetaTag(name: string, content: string) {
    this.meta.updateTag({ name, content })
  }

  /**
   * Add or update multiple meta tags.
   * @param tags - An array of meta tag objects.
   */
  updateMetaTags(tags: { name: string; content: string }[]) {
    tags.forEach((tag) => this.meta.updateTag(tag))
  }

  /**
   * Remove a meta tag by name.
   * @param name - The name of the meta tag to remove.
   */
  removeMetaTag(name: string) {
    this.meta.removeTag(`name='${name}'`)
  }

  /**
   * Set complete SEO for the current page
   */
  private setSEO(config: {
    title: string
    description: string
    keywords: string
    image?: string
  }) {
    const { title, description, keywords, image = '/images/logoAquaplus.webp' } = config

    // Set title
    this.setTitle(title)

    // Set basic meta tags
    this.updateMetaTags([
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'author', content: 'AquaPlus Team' },
      { name: 'robots', content: 'index, follow' }
    ])

    // Open Graph tags for social sharing
    this.meta.updateTag({ property: 'og:title', content: `${title} | AquaPlus` })
    this.meta.updateTag({ property: 'og:description', content: description })
    this.meta.updateTag({ property: 'og:image', content: image })
    this.meta.updateTag({ property: 'og:type', content: 'website' })
    this.meta.updateTag({ property: 'og:site_name', content: 'AquaPlus' })

    // Twitter Card tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' })
    this.meta.updateTag({ name: 'twitter:title', content: `${title} | AquaPlus` })
    this.meta.updateTag({ name: 'twitter:description', content: description })
    this.meta.updateTag({ name: 'twitter:image', content: image })
  }

  /**
   * Set default SEO for the application
   */
  private setDefaultSEO() {
    this.setSEO({
      title: '',
      description: 'AquaPlus - Sistema integral para la gestión de servicios de agua. Facturación, lecturas, reportes y gestión de clientes de forma eficiente y moderna.',
      keywords: 'agua, facturación, gestión, servicios públicos, lecturas, reportes, clientes, AquaPlus, sistema integral'
    })
  }

  /**
   * Update SEO based on current route automatically
   */
  private updateSEOBasedOnRoute(url: string) {
    if (url.includes('/bill') || url.includes('/print-bill')) {
      this.setSEO({
        title: 'Gestión de Facturas',
        description: 'Consulta, gestiona y descarga tus facturas de agua. Sistema completo de facturación con historial de pagos y deudas pendientes.',
        keywords: 'facturas, agua, pagos, deudas, facturación, servicios públicos, AquaPlus'
      })
    } else if (url.includes('/client')) {
      this.setSEO({
        title: 'Gestión de Clientes',
        description: 'Administra la información de clientes, historial de consumo y datos personales. Gestión completa de la base de clientes.',
        keywords: 'clientes, gestión, información personal, historial, consumo, AquaPlus'
      })
    } else if (url.includes('/reading')) {
      this.setSEO({
        title: 'Gestión de Lecturas',
        description: 'Registro y consulta de lecturas de contadores de agua. Control y seguimiento del consumo de agua de todos los clientes.',
        keywords: 'lecturas, contadores, consumo, agua, medición, registro, AquaPlus'
      })
    } else if (url.includes('/counter')) {
      this.setSEO({
        title: 'Gestión de Contadores',
        description: 'Administración de contadores de agua. Registro, mantenimiento y control de dispositivos de medición de consumo.',
        keywords: 'contadores, medidores, agua, dispositivos, medición, mantenimiento, AquaPlus'
      })
    } else if (url.includes('/employee')) {
      this.setSEO({
        title: 'Gestión de Empleados',
        description: 'Administración del personal y empleados. Control de roles, asignaciones y gestión del equipo de trabajo.',
        keywords: 'empleados, personal, roles, asignaciones, equipo, gestión, AquaPlus'
      })
    } else if (url.includes('/enterprise')) {
      this.setSEO({
        title: 'Gestión de Empresas',
        description: 'Administración de empresas y entidades. Configuración de datos corporativos y gestión empresarial.',
        keywords: 'empresas, entidades, corporativo, gestión empresarial, configuración, AquaPlus'
      })
    } else if (url.includes('/accounting')) {
      this.setSEO({
        title: 'Contabilidad',
        description: 'Módulo de contabilidad y gestión financiera. Control de ingresos, gastos y balance financiero del sistema.',
        keywords: 'contabilidad, finanzas, ingresos, gastos, balance, gestión financiera, AquaPlus'
      })
    } else if (url.includes('/user-access')) {
      this.setSEO({
        title: 'Administración de Usuarios',
        description: 'Panel de super administrador para gestión de usuarios. Control de accesos, permisos y administración del sistema.',
        keywords: 'super admin, usuarios, accesos, permisos, administración, control, AquaPlus'
      })
    } else if (url.includes('/fee')) {
      this.setSEO({
        title: 'Gestión de Tarifas',
        description: 'Configuración y administración de tarifas de agua. Establecimiento de precios y estructura tarifaria.',
        keywords: 'tarifas, precios, agua, configuración, estructura tarifaria, costos, AquaPlus'
      })
    } else if (url.includes('/Inventory')) {
      this.setSEO({
        title: 'Inventario',
        description: 'Control de inventario y materiales. Gestión de existencias, equipos y recursos del sistema.',
        keywords: 'inventario, materiales, existencias, equipos, recursos, control, AquaPlus'
      })
    } else if (url.includes('/pqr-client')) {
      this.setSEO({
        title: 'PQR Clientes',
        description: 'Gestión de Peticiones, Quejas y Reclamos de clientes. Atención al cliente y resolución de solicitudes.',
        keywords: 'PQR, peticiones, quejas, reclamos, atención cliente, solicitudes, AquaPlus'
      })
    } else if (url.includes('/configuration-roles')) {
      this.setSEO({
        title: 'Configuración de Roles',
        description: 'Administración y configuración de roles de usuario. Gestión de permisos y niveles de acceso.',
        keywords: 'roles, permisos, configuración, acceso, niveles, administración, AquaPlus'
      })
    } else if (url.includes('/profile')) {
      this.setSEO({
        title: 'Perfil de Usuario',
        description: 'Gestión del perfil personal. Actualización de datos, configuración de cuenta y preferencias del usuario.',
        keywords: 'perfil, usuario, datos personales, configuración, cuenta, preferencias, AquaPlus'
      })
    } else if (url.includes('/bills-users')) {
      this.setSEO({
        title: 'Facturas de Usuarios',
        description: 'Consulta de facturas por usuario. Historial de facturación y estado de pagos de clientes específicos.',
        keywords: 'facturas usuarios, historial facturación, pagos, consulta, clientes, AquaPlus'
      })
    } else if (url.includes('/reports')) {
      this.setSEO({
        title: 'Reportes y Estadísticas',
        description: 'Reportes detallados de consumo, facturación y análisis estadísticos. Información clave para la toma de decisiones.',
        keywords: 'reportes, estadísticas, análisis, consumo, facturación, datos, AquaPlus'
      })
    } else if (url.includes('/welcome')) {
      this.setSEO({
        title: 'Bienvenido',
        description: 'Bienvenido a AquaPlus, el sistema de gestión de agua más completo. Accede a todas las funcionalidades para gestionar tus servicios.',
        keywords: 'bienvenida, acceso, login, AquaPlus, gestión agua'
      })
    } else if (url.includes('/start') || url.includes('/home')) {
      this.setSEO({
        title: 'Panel Principal',
        description: 'Panel de control principal de AquaPlus. Accede rápidamente a facturas, clientes, reportes y todas las funcionalidades del sistema.',
        keywords: 'panel, dashboard, inicio, control, gestión, AquaPlus'
      })
    } else if (url.includes('/auth')) {
      this.setSEO({
        title: 'Iniciar Sesión',
        description: 'Accede a tu cuenta de AquaPlus. Ingresa con tus credenciales para gestionar tus servicios de agua.',
        keywords: 'login, acceso, credenciales, autenticación, AquaPlus'
      })
    } else {
      this.setDefaultSEO()
    }
  }
}
