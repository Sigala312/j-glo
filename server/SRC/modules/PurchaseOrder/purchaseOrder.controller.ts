// purchaseOrder.controller.ts
import { Request, Response } from "express";
import * as poService from "./purchaseOrder.service.js";

export const addPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const po = await poService.createPurchaseOrder(req.body);
    res.status(201).json(po);
  } catch (error: any) {
    console.error("建立採購單失敗:", error);
    res.status(500).json({ message: error.message || "INTERNAL_SERVER_ERROR" });
  }
};

export const getProjectPOs = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query; // 從 Query String 拿 projectId
    const pos = await poService.getPOsByProject(projectId as string);
    res.json(pos);
  } catch (error) {
    res.status(500).json({ error: "FETCH_POS_FAILED" });
  }
};

// 更新
export const updatePO = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await poService.updatePurchaseOrder(id as string, req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "UPDATE_PO_FAILED" });
  }
};

// 刪除
export const removePO = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await poService.deletePurchaseOrder(id as string);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(500).json({ error: "DELETE_PO_FAILED" });
  }


};

export const getPODetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // 從路徑 /api/purchaseOrder/:id 拿 ID
    const po = await poService.getPOById(id as string);
    
    if (!po) {
      return res.status(404).json({ error: "PURCHASE_ORDER_NOT_FOUND" });
    }
    
    res.json(po);
  } catch (error) {
    res.status(500).json({ error: "FETCH_PO_DETAIL_FAILED" });
  }
};