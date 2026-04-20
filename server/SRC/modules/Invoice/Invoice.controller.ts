import { Request, Response } from "express";
import { InvoiceService } from "./Invoice.service.js";

export class InvoiceController {
  // 建立發票
  static async create(req: Request, res: Response) {
    try {
      const { orderId, amount, dueDate } = req.body;
      if (!orderId || !amount) {
        return res.status(400).json({ message: "REQUIRED_FIELDS_MISSING" });
      }
      const invoice = await InvoiceService.create({ orderId, amount, dueDate });
      return res.status(201).json(invoice);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // 根據訂單取得發票
  static async getByOrder(req: Request, res: Response) {
    try {
      const orderId = req.query.orderId as string;
      const invoices = await InvoiceService.getByOrder(orderId);
      return res.json(invoices);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // 標記為已付款 (確認入帳)
  static async markAsPaid(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await InvoiceService.markAsPaid(id as string);
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  // 取得全系統逾期發票 (Dashboard 使用)
  static async getOverdueInvoices(req: Request, res: Response) {
    try {
      const overdue = await InvoiceService.findOverdue();
      return res.json(overdue);
    } catch (error: any) {
      console.error("Fetch overdue error:", error);
      return res.status(500).json({ error: "無法取得逾期發票資料" });
    }
  }

  // 更新發票
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { amount, dueDate } = req.body;
      const updated = await InvoiceService.update(id as string, { amount, dueDate });
      return res.json(updated);
    } catch (error: any) {
      const status = error.message.includes("PAID") ? 403 : 500;
      return res.status(status).json({ message: error.message });
    }
  }

  // 刪除發票
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await InvoiceService.delete(id as string);
      return res.json({ message: "INVOICE_DELETED_SUCCESSFULLY" });
    } catch (error: any) {
      const status = error.message.includes("PAID") ? 403 : 500;
      return res.status(status).json({ message: error.message });
    }
  }
}