import { prisma } from "../../lib/prisma.js";
import { del } from "@vercel/blob";

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

  static async getPurchaseOrders(projectId: string) {
  return await prisma.purchaseOrder.findMany({
    where: { projectId },
    include: {
      attachments: true,
    },
    orderBy: { createdAt: 'desc' }
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
  // 1. 先從資料庫找出該附件的 URL
  const attachment = await prisma.attachment.findUnique({
    where: { id }
  });

  if (attachment?.fileUrl) {
    // 2. 刪除 Vercel Blob 上的實體檔案
    await del(attachment.fileUrl);
  }

  // 3. 刪除資料庫紀錄
  return await prisma.attachment.delete({
    where: { id },
  });
}
}