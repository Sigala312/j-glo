import { Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  static async googleLogin(req: Request, res: Response) {
    try {
      const { idToken } = req.body; // 前端傳來的 Google Token
      if (!idToken) return res.status(400).json({ error: "缺少 Google Token" });

      const result = await AuthService.verifyGoogleAndLogin(idToken);
      
      return res.status(200).json({
        message: "Google 登入成功",
        ...result
      });
    } catch (error: any) {
      return res.status(401).json({ error: "認證失敗: " + error.message });
    }
  };

  static async getMe(req: Request, res: Response) {
    try {
      // 因為有 authenticateJWT，所以可以直接從 req 拿到解析後的使用者資料
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: "找不到使用者資訊" });
      }

      // 回傳給前端，讓前端知道現在是誰在操作（以及是什麼角色）
      return res.status(200).json({
        id: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      return res.status(500).json({ error: "伺服器內部錯誤" });
    }
  }
}