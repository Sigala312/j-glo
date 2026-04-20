import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class PurchaseOrderRemarkService {
  // 1. 新增備註
  static async create(data: {
    content: string;
    category?: string;
    purchaseOrderId: string;
  }) {
    return await prisma.purchaseOrderRemark.create({
      data: {
        content: data.content,
        category: data.category ?? null,
        purchaseOrderId: data.purchaseOrderId,
      },
    });
  }

  // 2. 取得特定採購單的所有備註 (依照時間由新到舊)
  static async getByPO(purchaseOrderId: string) {
    return await prisma.purchaseOrderRemark.findMany({
      where: { purchaseOrderId },
      orderBy: { createdAt: "desc" },
    });
  }

  // 3. 更新備註內容或分類
  static async update(
    id: string,
    data: { content?: string; category?: string },
  ) {
    return await prisma.purchaseOrderRemark.update({
      where: { id },
      data,
    });
  }

  // 4. 刪除備註
  static async delete(id: string) {
    return await prisma.purchaseOrderRemark.delete({
      where: { id },
    });
  }
}
