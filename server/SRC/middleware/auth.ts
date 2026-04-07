import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

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
      req.user = decoded as { id: string; email: string; role: Role }; 
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