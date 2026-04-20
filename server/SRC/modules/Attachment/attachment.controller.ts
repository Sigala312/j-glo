import { Request, Response } from "express";
import { AttachmentService } from "./attachment.service.js";

export class AttachmentController {
  static async upload(req: Request, res: Response) {
    try {
      const file = req.file;
      const { targetId, targetType } = req.body;

      if (!file) return res.status(400).json({ error: "未接收到檔案" });
      if (!targetId || !targetType) return res.status(400).json({ error: "缺失目標 ID 或類型" });

      // 辨識檔案類型 (簡單分類)
      const isExcel = file.mimetype.includes("spreadsheet") || file.originalname.endsWith(".xlsx");
      const fileType = isExcel ? "EXCEL" : "FILE";

      const attachment = await AttachmentService.createAttachment({
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`, // 這是對應靜態資源的路徑
        fileType,
        targetId,
        targetType,
      });

      return res.status(201).json({
        message: "檔案上傳成功",
        data: attachment
      });
    } catch (error: any) {
      console.error("Upload Error:", error);
      return res.status(500).json({ error: "上傳過程中發生錯誤" });
    }
  }

  static async getFiles(req: Request, res: Response) {
  try {
    const { targetId, targetType } = req.query; // 從 Query String 拿
    
    if (!targetId || !targetType) {
      return res.status(400).json({ error: "缺少查詢參數" });
    }

    const files = await AttachmentService.getAttachmentsByTarget(
      targetId as string, 
      targetType as "ORDER" | "PURCHASE_ORDER"
    );

    return res.status(200).json(files);
  } catch (error) {
    return res.status(500).json({ error: "讀取檔案清單失敗" });
  }
}

static async getByTarget(req: Request, res: Response) {
    try {
      const { targetId, targetType } = req.query;
      
      if (!targetId || !targetType) {
        return res.status(400).json({ error: "Missing parameters" });
      }

      const list = await AttachmentService.getAttachmentsByTarget(
        targetId as string, 
        targetType as "ORDER" | "PURCHASE_ORDER"
      );
      
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch attachments" });
    }
  }
}