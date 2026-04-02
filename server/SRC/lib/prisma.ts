import { PrismaClient } from "@prisma/client";

// 為了避免在開發環境下熱重載 (Hot Reload) 導致重複產生實例
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // 選填：開發時可以在控制台看到實際執行的 SQL 語法
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;