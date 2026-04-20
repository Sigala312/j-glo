export interface CreatePurchaseInvoiceInput {
  amount: number;
  invoiceNo?: string;
  purchaseOrderId: string;
  status?: string;
}