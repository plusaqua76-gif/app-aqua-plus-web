import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IBillBackResponse } from '@interfaces/bill/Ibill-back';

interface IBillBackTemplateData {
  htmlContent: string;
  empresa: {
    nombre: string;
    nit: string;
    direccion: string;
  };
}

@Component({
  selector: 'app-bill-back',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bill-back.html',
  styleUrl: './bill-back.css'
})
export class BillBack {
  // Input para datos dummy (retrocompatibilidad)
  backData = input<IBillBackResponse | null>(null);

  // Input para el contenido HTML de la plantilla
  templateData = input<IBillBackTemplateData | null>(null);

  constructor(private sanitizer: DomSanitizer) {}

  // Computed para sanitizar el HTML de forma segura
  safeHtmlContent = computed<SafeHtml | null>(() => {
    const data = this.templateData();
    if (!data?.htmlContent) {
      return null;
    }
    return this.sanitizer.sanitize(1, data.htmlContent)
      ? this.sanitizer.bypassSecurityTrustHtml(data.htmlContent)
      : null;
  });

  // Computed para determinar si se usa la plantilla HTML o los datos dummy
  useTemplate = computed(() => {
    return !!this.templateData()?.htmlContent;
  });
}
