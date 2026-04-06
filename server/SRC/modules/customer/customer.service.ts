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
  }
};