import { Injectable } from '@angular/core';

/**
 * Servicio para generación de PDFs con lazy loading.
 * Las librerías pesadas (jsPDF y html2canvas) se cargan solo cuando se necesitan,
 * reduciendo el bundle inicial en ~700KB.
 */
@Injectable({
  providedIn: 'root'
})
export class PdfService {
  // Cache de las librerías cargadas dinámicamente
  private html2canvasPromise: Promise<typeof import('html2canvas').default> | null = null;
  private jsPDFPromise: Promise<typeof import('jspdf').default> | null = null;

  constructor() {}

  /**
   * Carga html2canvas de forma lazy (solo la primera vez)
   */
  private async loadHtml2Canvas(): Promise<typeof import('html2canvas').default> {
    if (!this.html2canvasPromise) {
      this.html2canvasPromise = import('html2canvas').then(module => module.default);
    }
    return this.html2canvasPromise;
  }

  /**
   * Carga jsPDF de forma lazy (solo la primera vez)
   */
  private async loadJsPDF(): Promise<typeof import('jspdf').default> {
    if (!this.jsPDFPromise) {
      this.jsPDFPromise = import('jspdf').then(module => module.default);
    }
    return this.jsPDFPromise;
  }

  async convertElementToPdf(element: HTMLElement, filename: string = 'factura.pdf'): Promise<void> {
    try {
      const jsPDF = await this.loadJsPDF();
      const capture = await this.captureElement(element);

      const pdf = new jsPDF({
        orientation: capture.height > capture.width ? 'portrait' : 'landscape',
        unit: 'px',
        format: [capture.width, capture.height],
      });

      pdf.addImage(capture.imgData, 'PNG', 0, 0, capture.width, capture.height);
      pdf.save(filename);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw error;
    }
  }

  /**
   * Convierte un elemento HTML a PDF y lo abre en una nueva ventana
   * @param element - El elemento HTML a convertir
   */
  async convertElementToPdfAndOpen(element: HTMLElement): Promise<void> {
    try {
      const jsPDF = await this.loadJsPDF();
      const capture = await this.captureElement(element);

      const pdf = new jsPDF({
        orientation: capture.height > capture.width ? 'portrait' : 'landscape',
        unit: 'px',
        format: [capture.width, capture.height],
      });

      pdf.addImage(capture.imgData, 'PNG', 0, 0, capture.width, capture.height);

      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error al abrir PDF:', error);
      throw error;
    }
  }

  /**
   * Convierte un elemento HTML a PDF y lo imprime directamente
   * @param element - El elemento HTML a convertir
   */
  async convertElementToPdfAndPrint(element: HTMLElement): Promise<void> {
    try {
      const jsPDF = await this.loadJsPDF();
      const capture = await this.captureElement(element);

      const pdf = new jsPDF({
        orientation: capture.height > capture.width ? 'portrait' : 'landscape',
        unit: 'px',
        format: [capture.width, capture.height],
      });

      pdf.addImage(capture.imgData, 'PNG', 0, 0, capture.width, capture.height);

      pdf.autoPrint();
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl, '_blank');

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error('Error al imprimir PDF:', error);
      throw error;
    }
  }

  /**
   * Convierte dos elementos HTML (frente y reverso) a un PDF de dos páginas
   * @param frontElement - El elemento HTML del frente de la factura
   * @param backElement - El elemento HTML del reverso de la factura
   * @param filename - Nombre del archivo PDF
   */
  async convertTwoPagesToPdf(
    frontElement: HTMLElement,
    backElement: HTMLElement,
    filename: string = 'factura-completa.pdf'
  ): Promise<void> {
    try {
      // Cargar jsPDF (html2canvas se carga en captureElement)
      const jsPDF = await this.loadJsPDF();

      // Capturar el frente
      const frontCapture = await this.captureElement(frontElement);

      // Capturar el reverso
      const backCapture = await this.captureElement(backElement);

      // Dimensiones de la hoja personalizada: 27 cm de ancho (270 mm)
      const pageWidthMm = 270; // 27 cm
      // Calcular alto proporcionalmente según el contenido
      const pageHeightMm = (frontCapture.height / frontCapture.width) * pageWidthMm;

      // Crear PDF con dimensiones personalizadas
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pageWidthMm, pageHeightMm]
      });

      // Agregar primera página (frente) - ajustada al tamaño de la página
      pdf.addImage(frontCapture.imgData, 'PNG', 0, 0, pageWidthMm, pageHeightMm, undefined, 'FAST');

      // Calcular alto de la segunda página
      const backPageHeightMm = (backCapture.height / backCapture.width) * pageWidthMm;

      // Agregar segunda página (reverso)
      pdf.addPage([pageWidthMm, backPageHeightMm], 'portrait');
      pdf.addImage(backCapture.imgData, 'PNG', 0, 0, pageWidthMm, backPageHeightMm, undefined, 'FAST');

      // Descargar el PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error al generar PDF de dos páginas:', error);
      throw error;
    }
  }

  /**
   * Convierte dos elementos HTML (frente y reverso) a un PDF y lo abre en nueva ventana
   * @param frontElement - El elemento HTML del frente de la factura
   * @param backElement - El elemento HTML del reverso de la factura
   */
  async convertTwoPagesToPdfAndOpen(
    frontElement: HTMLElement,
    backElement: HTMLElement
  ): Promise<void> {
    try {
      // Cargar jsPDF (html2canvas se carga en captureElement)
      const jsPDF = await this.loadJsPDF();

      // Capturar el frente
      const frontCapture = await this.captureElement(frontElement);

      // Capturar el reverso
      const backCapture = await this.captureElement(backElement);

      // Dimensiones de la hoja personalizada: 27 cm de ancho (270 mm)
      const pageWidthMm = 270; // 27 cm
      // Calcular alto proporcionalmente según el contenido
      const pageHeightMm = (frontCapture.height / frontCapture.width) * pageWidthMm;

      // Crear PDF con dimensiones personalizadas
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pageWidthMm, pageHeightMm]
      });

      // Agregar primera página (frente) - ajustada al tamaño de la página
      pdf.addImage(frontCapture.imgData, 'PNG', 0, 0, pageWidthMm, pageHeightMm, undefined, 'FAST');

      // Calcular alto de la segunda página
      const backPageHeightMm = (backCapture.height / backCapture.width) * pageWidthMm;

      // Agregar segunda página (reverso)
      pdf.addPage([pageWidthMm, backPageHeightMm], 'portrait');
      pdf.addImage(backCapture.imgData, 'PNG', 0, 0, pageWidthMm, backPageHeightMm, undefined, 'FAST');

      // Abrir en nueva ventana
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error al abrir PDF de dos páginas:', error);
      throw error;
    }
  }

  /**
   * Convierte dos elementos HTML (frente y reverso) a un PDF y lo imprime
   * @param frontElement - El elemento HTML del frente de la factura
   * @param backElement - El elemento HTML del reverso de la factura
   */
  async convertTwoPagesToPdfAndPrint(
    frontElement: HTMLElement,
    backElement: HTMLElement
  ): Promise<void> {
    try {
      // Cargar jsPDF (html2canvas se carga en captureElement)
      const jsPDF = await this.loadJsPDF();

      // Capturar el frente
      const frontCapture = await this.captureElement(frontElement);

      // Capturar el reverso
      const backCapture = await this.captureElement(backElement);

      // Dimensiones de la hoja personalizada: 27 cm de ancho (270 mm)
      const pageWidthMm = 270; // 27 cm
      // Calcular alto proporcionalmente según el contenido
      const pageHeightMm = (frontCapture.height / frontCapture.width) * pageWidthMm;

      // Crear PDF con dimensiones personalizadas
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pageWidthMm, pageHeightMm]
      });

      // Agregar primera página (frente) - ajustada al tamaño de la página
      pdf.addImage(frontCapture.imgData, 'PNG', 0, 0, pageWidthMm, pageHeightMm, undefined, 'FAST');

      // Calcular alto de la segunda página
      const backPageHeightMm = (backCapture.height / backCapture.width) * pageWidthMm;

      // Agregar segunda página (reverso)
      pdf.addPage([pageWidthMm, backPageHeightMm], 'portrait');
      pdf.addImage(backCapture.imgData, 'PNG', 0, 0, pageWidthMm, backPageHeightMm, undefined, 'FAST');

      // Abrir diálogo de impresión
      pdf.autoPrint();
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl, '_blank');

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error('Error al imprimir PDF de dos páginas:', error);
      throw error;
    }
  }

  /**
   * Captura un elemento HTML clonándolo y renderizándolo fuera de pantalla
   * Esto evita problemas con transformaciones, visibilidad y animaciones
   */
  private async captureElement(element: HTMLElement): Promise<{ imgData: string; width: number; height: number }> {
    // Cargar html2canvas dinámicamente
    const html2canvas = await this.loadHtml2Canvas();

    // Crear un contenedor temporal para el clon
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    // Copiar el ancho del elemento original para mantener el layout
    container.style.width = `${Math.max(element.offsetWidth, element.scrollWidth, 400)}px`;

    // Clonar el elemento
    const clone = element.cloneNode(true) as HTMLElement;

    // Resetear transformaciones y asegurar visibilidad en el clon
    clone.style.transform = 'none';
    clone.style.visibility = 'visible';
    clone.style.opacity = '1';
    clone.style.display = 'block';
    clone.style.background = '#ffffff';
    clone.style.backdropFilter = 'none';
    clone.style.setProperty('-webkit-backdrop-filter', 'none');

    container.appendChild(clone);
    document.body.appendChild(container);

    try {
      this.stripUnsupportedStyles(clone);
      await this.waitForImages(clone);
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: clone.scrollWidth,
        height: clone.scrollHeight,
        windowWidth: clone.scrollWidth,
        windowHeight: clone.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedTarget =
            clonedDoc.querySelector('.abono-receipt-content, .sale-receipt-content') ??
            clonedDoc.body.firstElementChild;
          if (clonedTarget instanceof HTMLElement) {
            this.stripUnsupportedStyles(clonedTarget);
          }
        },
      });

      return {
        imgData: canvas.toDataURL('image/png'),
        width: canvas.width,
        height: canvas.height
      };
    } finally {
      document.body.removeChild(container);
    }
  }

  private stripUnsupportedStyles(element: HTMLElement): void {
    element.style.backdropFilter = 'none';
    element.style.setProperty('-webkit-backdrop-filter', 'none');
    element.style.filter = 'none';

    element.querySelectorAll<HTMLElement>('*').forEach((el) => {
      el.style.backdropFilter = 'none';
      el.style.setProperty('-webkit-backdrop-filter', 'none');
      el.style.filter = 'none';
    });
  }

  /**
   * Método privado para esperar a que todas las imágenes de un elemento se carguen
   * @param element - El elemento HTML que contiene las imágenes
   */
  private async waitForImages(element: HTMLElement): Promise<void> {
    const promises: Promise<void>[] = [];

    // 1. Esperar imágenes <img>
    const images = element.querySelectorAll('img');
    images.forEach((img: HTMLImageElement) => {
      if (img.complete) {
        promises.push(Promise.resolve());
      } else {
        promises.push(
          new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
        );
      }
    });

    // 2. Esperar imágenes de fondo (background-image)
    const elementsWithBackground = element.querySelectorAll('*');
    elementsWithBackground.forEach((el: Element) => {
      const style = window.getComputedStyle(el);
      const bgImage = style.backgroundImage;
      if (bgImage && bgImage !== 'none') {
        const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('data:')) {
           const img = new Image();
           promises.push(new Promise<void>((resolve) => {
             img.onload = () => resolve();
             img.onerror = () => resolve();
             img.src = urlMatch[1];
           }));
        }
      }
    });

    await Promise.all(promises);
  }
}
