export enum InvoiceStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  CANCELLED = "CANCELLED"
}

export interface CreateInvoiceInput {
  orderId: string;
  amount: number;
  dueDate?: string | Date;
}