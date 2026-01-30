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
      // Cargar librerías dinámicamente
      const [html2canvas, jsPDF] = await Promise.all([
        this.loadHtml2Canvas(),
        this.loadJsPDF()
      ]);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Crear el PDF en formato A4
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'px',
        format: [imgWidth, imgHeight]
      });


      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);


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
      // Cargar librerías dinámicamente
      const [html2canvas, jsPDF] = await Promise.all([
        this.loadHtml2Canvas(),
        this.loadJsPDF()
      ]);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'px',
        format: [imgWidth, imgHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Abrir en nueva ventana
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
      // Cargar librerías dinámicamente
      const [html2canvas, jsPDF] = await Promise.all([
        this.loadHtml2Canvas(),
        this.loadJsPDF()
      ]);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'px',
        format: [imgWidth, imgHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

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

      // Crear PDF con la primera página (frente)
      const pdf = new jsPDF({
        orientation: frontCapture.height > frontCapture.width ? 'portrait' : 'landscape',
        unit: 'px',
        format: [frontCapture.width, frontCapture.height]
      });

      // Agregar primera página (frente)
      pdf.addImage(frontCapture.imgData, 'PNG', 0, 0, frontCapture.width, frontCapture.height);

      // Agregar segunda página (reverso)
      pdf.addPage([backCapture.width, backCapture.height], backCapture.height > backCapture.width ? 'portrait' : 'landscape');
      pdf.addImage(backCapture.imgData, 'PNG', 0, 0, backCapture.width, backCapture.height);

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

      // Crear PDF con la primera página (frente)
      const pdf = new jsPDF({
        orientation: frontCapture.height > frontCapture.width ? 'portrait' : 'landscape',
        unit: 'px',
        format: [frontCapture.width, frontCapture.height]
      });

      // Agregar primera página (frente)
      pdf.addImage(frontCapture.imgData, 'PNG', 0, 0, frontCapture.width, frontCapture.height);

      // Agregar segunda página (reverso)
      pdf.addPage([backCapture.width, backCapture.height], backCapture.height > backCapture.width ? 'portrait' : 'landscape');
      pdf.addImage(backCapture.imgData, 'PNG', 0, 0, backCapture.width, backCapture.height);

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

      // Crear PDF con la primera página (frente)
      const pdf = new jsPDF({
        orientation: frontCapture.height > frontCapture.width ? 'portrait' : 'landscape',
        unit: 'px',
        format: [frontCapture.width, frontCapture.height]
      });

      // Agregar primera página (frente)
      pdf.addImage(frontCapture.imgData, 'PNG', 0, 0, frontCapture.width, frontCapture.height);

      // Agregar segunda página (reverso)
      pdf.addPage([backCapture.width, backCapture.height], backCapture.height > backCapture.width ? 'portrait' : 'landscape');
      pdf.addImage(backCapture.imgData, 'PNG', 0, 0, backCapture.width, backCapture.height);

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
    container.style.width = `${element.offsetWidth || element.scrollWidth}px`;

    // Clonar el elemento
    const clone = element.cloneNode(true) as HTMLElement;

    // Resetear transformaciones y asegurar visibilidad en el clon
    clone.style.transform = 'none';
    clone.style.visibility = 'visible';
    clone.style.opacity = '1';
    clone.style.display = 'block';

    container.appendChild(clone);
    document.body.appendChild(container);

    try {
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
        windowHeight: clone.scrollHeight
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
