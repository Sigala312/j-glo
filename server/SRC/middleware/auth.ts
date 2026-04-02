import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1]; // 格式: Bearer <TOKEN>

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: "Token 無效或已過期" });
      
      req.user = user as any; // 將解出來的資訊塞入 req.user
      next();
    });
  } else {
    res.status(401).json({ error: "未提供認證 Token" });
  }
};

// 角色檢查中間件
export const authorizeRole = (role: "ADMIN") => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: "權限不足，僅限管理員操作" });
    }
    next();
  };
};