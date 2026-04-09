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

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    // 直接從 params 拿到 id 並告訴 TS 它是字串
    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({ message: "ID_REQUIRED" });
    }

    const customer = await customerService.findOne(id);
    
    if (!customer) {
      return res.status(404).json({ message: "CLIENT_NOT_FOUND" });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
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

export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!id) {
      return res.status(400).json({ error: "缺少客戶 ID" });
    }

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "請提供有效的客戶名稱" });
    }

    const updatedClient = await customerService.updateClient(
      id as string,
      name,
    );
    res.json(updatedClient);
  } catch (error: any) {
    if (error.message === "CLIENT_NOT_FOUND") {
      return res.status(404).json({ error: "找不到該客戶" });
    }
    if (error.message === "CLIENT_NAME_EXISTS") {
      return res.status(400).json({ error: "該客戶名稱已存在" });
    }
    res.status(500).json({ error: "更新客戶失敗" });
  }
};
