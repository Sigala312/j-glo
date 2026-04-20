import { prisma } from "../../lib/prisma.js";
import { CreatePurchaseInvoiceInput } from "./purchaseInvoice.js";

export class PurchaseInvoiceService {
  /**
   * 建立採購發票
   */
  static async create(data: CreatePurchaseInvoiceInput) {
    return await prisma.purchaseInvoice.create({
      data: {
        amount: data.amount,
        invoiceNo: data.invoiceNo ?? null,
        purchaseOrderId: data.purchaseOrderId,
        status: data.status || "PENDING",
      },
    });
  }

  /**
   * 取得所有採購發票（包含關聯的採購單與供應商）
   */
  static async findAll() {
    return await prisma.purchaseInvoice.findMany({
      include: {
        purchaseOrder: {
          include: {
            // 假設你的 PO 有關聯供應商，這裡可以抓出來顯示在前端
            // supplier: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * 更新發票狀態 (例如：改為 PAID)
   */
  static async updateStatus(id: string, status: string) {
    return await prisma.purchaseInvoice.update({
      where: { id },
      data: { status },
    });
  }
}
