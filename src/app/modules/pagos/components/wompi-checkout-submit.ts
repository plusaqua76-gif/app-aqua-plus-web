import { afterNextRender, Component, input } from '@angular/core';
import { CheckoutPagoResponse } from '@interfaces/pago/checkout-pago-response';

/**
 * Redirige al Web Checkout de Wompi.
 * Preferimos paymentUrl (URL completa del backend). Fallback: form GET clásico.
 */
@Component({
  selector: 'app-wompi-checkout-submit',
  standalone: true,
  template: `
    @if (!checkout().paymentUrl) {
      <form #wompiForm [attr.action]="checkout().checkoutUrl" method="GET" class="hidden">
        <input type="hidden" name="public-key" [value]="checkout().publicKey" />
        <input type="hidden" name="currency" [value]="checkout().currency" />
        <input type="hidden" name="amount-in-cents" [value]="checkout().amountInCents" />
        <input type="hidden" name="reference" [value]="checkout().reference" />
        <input type="hidden" name="signature:integrity" [value]="checkout().signatureIntegrity" />
        <input type="hidden" name="redirect-url" [value]="checkout().redirectUrl" />
      </form>
    }
  `,
})
export class WompiCheckoutSubmit {
  readonly checkout = input.required<CheckoutPagoResponse>();
  private submitted = false;

  constructor() {
    afterNextRender(() => {
      if (this.submitted) {
        return;
      }
      this.submitted = true;
      const data = this.checkout();
      if (data.paymentUrl) {
        globalThis.location.assign(data.paymentUrl);
        return;
      }
      const form = document.querySelector(
        'app-wompi-checkout-submit form'
      ) as HTMLFormElement | null;
      form?.submit();
    });
  }
}
