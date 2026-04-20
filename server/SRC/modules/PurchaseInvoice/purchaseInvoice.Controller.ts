import { Request, Response } from "express";
import { PurchaseInvoiceService } from "./PurchaseInvoice.Service.js";

export class PurchaseInvoiceController {
  static async create(req: Request, res: Response) {
    try {
      const result = await PurchaseInvoiceService.create(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ message: "建立採購發票失敗", error: error.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const result = await PurchaseInvoiceService.findAll();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "讀取採購發票失敗", error: error.message });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await PurchaseInvoiceService.updateStatus(id as string, status);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "更新狀態失敗", error: error.message });
    }
  }
}