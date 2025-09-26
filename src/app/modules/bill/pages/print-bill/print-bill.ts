import { Component } from '@angular/core';
import { LegendsHistoryBill } from "@components/charts/legens-bill-history";
import { PdfBill } from "@components/pdf-bill";


@Component({
  selector: 'app-print-bill',
  imports: [ PdfBill],
  template: `
    <app-pdf-bill></app-pdf-bill>
  `,
})
export class PrintBill  {





}
