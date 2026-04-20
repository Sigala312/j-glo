import { Request, Response } from "express";
import { PurchaseOrderRemarkService } from "./PurchaseOrderRemark.service.js";

export class PurchaseOrderRemarkController {
  // 新增
  static async create(req: Request, res: Response) {
    try {
      const { content, category, purchaseOrderId } = req.body;
      if (!content || !purchaseOrderId) {
        return res.status(400).json({ message: "REQUIRED_FIELDS_MISSING" });
      }
      const remark = await PurchaseOrderRemarkService.create({ content, category, purchaseOrderId });
      return res.status(201).json(remark);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // 取得 (透過 Query String 傳遞 poId)
  static async getByPO(req: Request, res: Response) {
    try {
      const { poId } = req.query;
      if (!poId) return res.status(400).json({ message: "PO_ID_REQUIRED" });
      
      const remarks = await PurchaseOrderRemarkService.getByPO(poId as string);
      return res.json(remarks);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // 更新
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { content, category } = req.body;
      const updated = await PurchaseOrderRemarkService.update(id as string, { content, category });
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // 刪除
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await PurchaseOrderRemarkService.delete(id as string);
      return res.json({ message: "REMARK_DELETED_SUCCESSFULLY" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}