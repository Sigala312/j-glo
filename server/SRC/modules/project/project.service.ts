import { prisma } from "../../lib/prisma.js";

export class ProjectService {
  // 建立新專案
  static async createProject(data: { 
    name: string; 
    projectNo: string; 
    clientId: string; 
    creatorId: string 
  }) {
    return await prisma.project.create({
      data: {
        name: data.name,
        projectNo: data.projectNo,
        clientId: data.clientId,
        creatorId: data.creatorId,
      },
      include: { client: true } // 回傳時順便帶出客戶資料
    });
  }

  // 取得所有專案 (通常給 Dashboard 看)
  static async getAllProjects() {
    return await prisma.project.findMany({
      include: { client: true, creator: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}