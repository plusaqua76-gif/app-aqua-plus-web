export interface CreditNoteRequest {
  id: number;
  company: Company;
  customer: Customer;
  items: Item[];
  payments: Payment[];
  totalAmounts: TotalAmounts;
  discountsAndCharges: DiscountOrCharge[];
  invoicePeriod: InvoicePeriod;
  associatedDocuments: AssociatedDocument[];
  conceptCode: string;
  note: string;
  idEmpresa: number;
  idCliente: number;
  usuario: string;
}

export interface Company {
  id: string;
  organizationType: number;
  identificationType: number;
  identificationNumber: string;
  name: string;
  taxCode: TaxCode;
}

export interface TaxCode {
  id: string;
}

export interface Customer {
  name: string;
  id: string;
  organizationType: number;
  identificationType: string;
  identificationNumber: string;
  email: string;
}

export interface Item {
  standardCode: StandardCode;
  taxes: ItemTax[];
  description: string;
  price: number;
  discount: number;
  discountAmount: number;
  charge: number;
  chargeAmount: number;
  quantity: number;
  unitCode: string;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface StandardCode {
  id: string;
  identificationId: string;
}

export interface ItemTax {
  taxCode: string;
  taxAmount: number;
  taxPercentage: string;
  taxableAmount: number;
}

export interface Payment {
  paymentForm: string;
  paymentMethod: string;
  paymentDueDate: string; // ISO Date (YYYY-MM-DD)
}

export interface TotalAmounts {
  grossTotal: number;
  taxableTotal: number;
  taxTotal: number;
  discountTotal: number;
  chargeTotal: number;
  advanceTotal: number;
  payableTotal: number;
  currencyCode: string;
}

export interface DiscountOrCharge {
  isCharge: boolean;
  reasonCode: string;
  percentageAmount: number;
  amount: number;
  baseAmount: number;
  reason: string;
}

export interface InvoicePeriod {
  startDate: string; // ISO Date
  endDate: string;   // ISO Date
}

export interface AssociatedDocument {
  date: string; // ISO Date
  documentType: string;
  number: number;
  uuid: string;
}
