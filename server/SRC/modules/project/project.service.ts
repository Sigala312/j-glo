import { prisma } from "../../lib/prisma.js";

export class ProjectService {
  // 建立新專案
  static async createProject(data: { 
    name: string; 
    projectNo: string; 
    clientId: string; 
    creatorId: string // 💡 前端傳過來的會是 "cmo9tj2rs..." 這種 CUID 字串
  }) {
    
    return await prisma.project.create({
      data: {
        name: data.name,
        projectNo: data.projectNo,
        client: {
          connect: { id: data.clientId }
        },
        // 💡 終極修正：直接使用真實的 User ID 進行綁定！
        creator: {
          connect: { 
            id: data.creatorId // 🔥 這樣就完全符合 Prisma 所規定的 id 欄位了！
          }
        }
      },
      include: { client: true }
    });
  }

  // 取得所有專案 (通常給 Dashboard 看)
  static async findAll(where = {}) {
    return await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: { name: true } // 順便抓出客戶名稱，前端顯示比較方便
        }
      }
    });
  }


  static async findOne(where: { id: string }) {
  return await prisma.project.findUnique({
    where,
    include: {
      client: true,
      purchaseOrders: true,
      order: {
        include: {
          invoices: true // 這樣才能抓到該訂單的所有發票
        }
      }
    }
  });
}

  static async updateStatus(projectId: string, newStatus: "FILLED" | "COMPLETED") {
    // 1. 查找專案並計算關聯的 PO 數量
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        _count: {
          select: { purchaseOrders: true } // 確保名稱與 prisma schema 內的關聯名一致
        }
      }
    });

    if (!project) throw new Error("PROJECT_NOT_FOUND");

    // 2. 業務規則：如果 PO 數量為 0，禁止切換到 FILLED 或 COMPLETED
    if (project._count.purchaseOrders === 0) {
      throw new Error("EMPTY_PROJECT_CANNOT_CHANGE_STATUS");
    }

    // 3. 執行更新
    return await prisma.project.update({
      where: { id: projectId },
      data: { status: newStatus }
    });
  }

}