import { PrismaClient, Invoice } from "@prisma/client";
const prisma = new PrismaClient();

export class InvoiceService {
  // 建立發票
  static async create(data: { orderId: string; amount: number; dueDate?: string }): Promise<Invoice> {
    return await prisma.invoice.create({
      data: {
        orderId: data.orderId,
        amount: Number(data.amount), // 強制轉為數字避免型別錯誤
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        invoiceNo: `INV-${Date.now()}`,
        status: "PENDING"
      }
    });
  }

  // 核定收款
  static async markAsPaid(id: string): Promise<Invoice> {
    return await prisma.invoice.update({
      where: { id },
      data: {
        status: "PAID",
        paidAt: new Date()
      }
    });
  }

  // 取得列表
  static async getByOrder(orderId: string): Promise<Invoice[]> {
    return await prisma.invoice.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" }
    });
  }

  
  static async update(id: string, data: { amount?: number; dueDate?: string }): Promise<Invoice> {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new Error("INVOICE_NOT_FOUND");
    
    // 🔒 安全鎖：已付款的發票禁止修改金額
    if (invoice.status === "PAID") {
      throw new Error("CANNOT_UPDATE_PAID_INVOICE");
    }

    return await prisma.invoice.update({
      where: { id },
      data: {
        amount: data.amount ? Number(data.amount) : invoice.amount,
        dueDate: data.dueDate ? new Date(data.dueDate) : invoice.dueDate,
      }
    });
  }

  // 刪除發票
  static async delete(id: string): Promise<Invoice> {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new Error("INVOICE_NOT_FOUND");

    // 🔒 安全鎖：已付款的發票禁止刪除（除非要走作廢流程）
    if (invoice.status === "PAID") {
      throw new Error("CANNOT_DELETE_PAID_INVOICE");
    }

    return await prisma.invoice.delete({ where: { id } });
  }

  static async findOverdue() {
  const now = new Date();
  return await prisma.invoice.findMany({
    where: {
      status: "PENDING",
      dueDate: {
        lt: now, // lt = less than，即期限小於現在時間
        not: null,
      },
    },
    include: {
      order: {
        include: {
          project: {
            include: {
              client: true, // 為了在儀表板顯示廠商名稱
            },
          },
        },
      },
    },
    orderBy: {
      dueDate: "asc", 
    },
  });
}
}