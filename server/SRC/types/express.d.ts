import { Role } from "@prisma/client";

// 這段代碼會告訴 TypeScript：我要在 Express 的 Request 介面裡多加一個 user 屬性
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
      };
    }
  }
}

// 必須加上這行，讓 TS 把這個檔案當成一個 Module 處理
export {};