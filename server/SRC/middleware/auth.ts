import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role , Status} from "@prisma/client";

const JWT_SECRET = (process.env.JWT_SECRET || "MAX&CHLOE") as string;



export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_SECRET as string, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Token 無效或已過期" });
      }
      
      // 這裡現在會有型別提示了，不再需要 as any
const payload = decoded as { 
        id: string; 
        email: string; 
        role: Role; 
        status: Status 
      };
        req.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        status: payload.status
      };
      next();
    });
  } else {
    res.status(401).json({ error: "未提供認證 Token" });
  }
};

export const authorizeRole = (role: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 因為擴充了 Request，這裡 req.user?.role 不會再報錯
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: "權限不足，僅限管理員操作" });
    }
    next();
  };
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // 1. 檢查使用者是否存在（必須先過 authenticateToken）
  if (!req.user) {
    return res.status(401).json({ error: "請先登入" });
  }

  // 2. 判斷角色是否為 ADMIN
  // 注意：這裡的 "ADMIN" 要對應你資料庫或 Enum 裡定義的值
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ 
      error: "權限不足：此操作僅限管理員執行。" 
    });
  }

  // 3. 驗證通過，繼續執行下一個動作
  next();
};