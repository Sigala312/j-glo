import { prisma } from "../../lib/prisma.js";

export class AttachmentService {
  /**
   * 建立附件紀錄並關聯至目標實體
   */
  static async createAttachment(params: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    targetId: string;
    targetType: "ORDER" | "PURCHASE_ORDER";
  }) {
    const { fileName, fileUrl, fileType, targetId, targetType } = params;

    // 根據目標類型動態構建 data 物件
    const data: any = {
      fileName,
      fileUrl,
      fileType,
    };

    if (targetType === "ORDER") {
      data.orderId = targetId;
    } else if (targetType === "PURCHASE_ORDER") {
      data.purchaseOrderId = targetId;
    }

    return await prisma.attachment.create({
      data,
    });
  }

  static async getAttachmentsByTarget(targetId: string, targetType: "ORDER" | "PURCHASE_ORDER") {
  return await prisma.attachment.findMany({
    where: {
      // 根據類型決定要找哪個外鍵
      ...(targetType === "ORDER" ? { orderId: targetId } : { purchaseOrderId: targetId })
    },
    orderBy: { createdAt: 'desc' }
  });
}

  /**
   * 刪除附件與實體檔案
   */
  static async deleteAttachment(id: string) {
    // 這裡可以先撈出 fileUrl 來刪除實體檔案 (fs.unlink)
    return await prisma.attachment.delete({
      where: { id },
    });
  }
}