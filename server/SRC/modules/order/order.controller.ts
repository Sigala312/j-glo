import { Request, Response } from "express";
import { OrderService } from "./order.service.js";

export class OrderController {
  /**
   * GET /api/orders
   * 取得所有狀態為 COMPLETED 的專案及其訂單狀態
   */
  static async getOrders(req: Request, res: Response) {
    try {
      const projectsWithOrders = await OrderService.findAll();
      return res.status(200).json(projectsWithOrders);
    } catch (error: any) {
      return res.status(500).json({ error: "無法取得訂單清單" });
    }
  }

  /**
   * POST /api/orders/finalize
   * 管理員核定訂單金額，狀態由 PENDING 轉為 COMPLETED
   */
  static async finalizeOrder(req: Request, res: Response) {
    try {
      const { projectId, amount } = req.body;

      if (!projectId || amount === undefined) {
        return res.status(400).json({ error: "請提供專案 ID 與核定金額" });
      }

      const result = await OrderService.finalizeOrder(projectId, Number(amount));
      
      return res.status(200).json({
        message: "訂單核定成功",
        data: result
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * PATCH /api/orders/:id
   * 單純修改現有訂單的金額
   */
  static async updateAmount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      if (amount === undefined) {
        return res.status(400).json({ error: "請提供修改金額" });
      }

      const updatedOrder = await OrderService.updateAmount(id as string, Number(amount));
      
      return res.status(200).json({
        message: "金額修改成功",
        data: updatedOrder
      });
    } catch (error: any) {
      return res.status(400).json({ error: "更新失敗，請檢查訂單編號" });
    }
  }

  /**
   * DELETE /api/orders/:id
   * 刪除財務紀錄
   */
  static async deleteOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await OrderService.deleteOrder(id as string);
      
      return res.status(200).json({ message: "訂單紀錄已刪除" });
    } catch (error: any) {
      return res.status(400).json({ error: "刪除失敗" });
    }
  }
}