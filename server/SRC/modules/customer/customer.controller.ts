import { Request, Response } from "express";
import { customerService } from "./customer.service.js";

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const clients = await customerService.getAllCustomers();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "取得客戶列表失敗" });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const client = await customerService.createCustomer(req.body.name);
    res.status(201).json(client);
  } catch (error: any) {
    if (error.message === "CLIENT_EXISTS") {
      return res.status(400).json({ message: "此客戶名稱已存在" });
    }
    res.status(500).json({ message: "新增客戶失敗" });
  }
};