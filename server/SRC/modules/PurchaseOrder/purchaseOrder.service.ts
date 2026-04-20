// purchaseOrder.service.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createPurchaseOrder = async (data: any) => {
   const { projectId, item, vendor, amount } = data;

  // 1. 取得專案編號 (projectNo)
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { projectNo: true }
  });

  if (!project) throw new Error("PROJECT_NOT_FOUND");

  // 2. 計算該專案目前有幾張採購單 (序號)
  const count = await prisma.purchaseOrder.count({
    where: { projectId }
  });
  const sequence = (count + 1).toString().padStart(2, '0'); // 轉為 01, 02...

  // 3. 取得當前日期資訊
  const now = new Date();
  const year = now.getFullYear(); // 2026
  const monthDay = `${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`; // 0408

  // 4. 組合編號：年度-專案編號-序號-月日
  // 範例：2026-GOO-40646-01-0408
  const poNumber = `${year}-${project.projectNo}-${sequence}-${monthDay}`;

  // 5. 寫入資料庫
  return await prisma.purchaseOrder.create({
    data: {
      poNumber,
      item,
      // quantity,
      vendor,
      amount,
      projectId
    }
  });
};

// 取得特定專案下的所有採購單
export const getPOsByProject = async (projectId: string) => {
  return await prisma.purchaseOrder.findMany({
    where: { projectId },
    include: {
      attachments: true ,
      remarks: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

// 取得單筆採購單詳情
// export const getPOById = async (id: string) => {
//   return await prisma.purchaseOrder.findUnique({
//     where: { id },
//     include: { project: true } 
//   });
// };

// 更新採購單 (Patch)
export const updatePurchaseOrder = async (id: string, updateData: any) => {
  // 注意：通常 poNumber (編號) 生成後就不隨便更改，所以我們只更新內容
  return await prisma.purchaseOrder.update({
    where: { id },
    data: updateData
  });
};

// 刪除採購單
export const deletePurchaseOrder = async (id: string) => {
  return await prisma.purchaseOrder.delete({
    where: { id }
  });
};

export const getPOById = async (id: string) => {
  return await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      // 🚀 這裡很重要！要把這筆 PO 旗下的所有發票一起抓出來
      purchaseInvoices: true, 
      project: true, // 選配：如果想顯示專案名稱也可以抓
    },
  });
};