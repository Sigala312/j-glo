import { prisma } from "../../lib/prisma.js";

export const customerService = {
  // 取得所有客戶與專案計數
  async getAllCustomers() {
    return await prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { projects: true }
        }
      }
    });
  },

  // 建立客戶（包含重複檢查邏輯）
  async createCustomer(name: string) {
    const existing = await prisma.client.findUnique({ where: { name } });
    if (existing) {
      throw new Error("CLIENT_EXISTS");
    }
    return await prisma.client.create({ data: { name } });
  },

  async findOne(id: string) {
  return await prisma.client.findUnique({
    where: { id },
    include: {
      projects: {
        orderBy: { createdAt: 'desc' },
        // include: {
        //   // 如果你的 Project 與 Quote 有關聯，這樣寫可以抓到數量
        //   _count: {
        //     select: { quotes: true } 
        //   }
        // }
      }
    }
  });
},

  async updateClient(id: string, name: string) {
    // 1. 檢查該 ID 是否存在
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) throw new Error("CLIENT_NOT_FOUND");

    // 2. 檢查新名稱是否已被其他客戶佔用
    const existing = await prisma.client.findUnique({ where: { name } });
    if (existing && existing.id !== id) {
      throw new Error("CLIENT_NAME_EXISTS");
    }

    // 3. 執行更新
    return await prisma.client.update({
      where: { id },
      data: { name },
    });
  }
};