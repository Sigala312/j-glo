import { prisma } from "../../lib/prisma.js";

export class OrderService {
  /**
   * 1. 取得所有「已結案專案」的訂單狀態
   * 邏輯：顯示所有 Project 狀態為 COMPLETED 的資料，並關聯其 Order
   */
  static async findAll() {
    return await prisma.project.findMany({
      where: {
        status: "COMPLETED",
      },
      include: {
        order: true, // 關聯 Order 資料庫內容
        client: {
          select: { name: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  /**
   * 2. 核定訂單 (管理員輸入金額)
   * 邏輯：將原本 PENDING 的 Order 填入金額並改為 COMPLETED
   */
  static async finalizeOrder(projectId: string, amount: number) {
    // 這裡使用 upsert，防止萬一 Project 變 COMPLETED 時 Order 沒建立成功的邊際狀況
    return await prisma.order.upsert({
      where: { projectId: projectId },
      update: {
        amount: amount,
        status: "COMPLETED",
      },
      create: {
        projectId: projectId,
        amount: amount,
        status: "COMPLETED",
      },
    });
  }

  /**
   * 3. 修改金額 (PATCH)
   */
  static async updateAmount(orderId: string, amount: number) {
    return await prisma.order.update({
      where: { id: orderId },
      data: { amount },
    });
  }

  /**
   * 4. 刪除訂單 (DELETE)
   * 邏輯：僅刪除財務紀錄，不影響 Project 本身
   */
  static async deleteOrder(orderId: string) {
    return await prisma.order.delete({
      where: { id: orderId },
    });
  }
}