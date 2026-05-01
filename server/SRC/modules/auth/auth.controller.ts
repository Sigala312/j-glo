import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";

export class AuthController {
  static async googleLogin(req: Request, res: Response) {
    console.log("📥 收到 Google 登入請求！內容:", req.body);
    try {
      // 🚀 1. 解構出前端傳來的「第一步」資料
      const { accessToken, name, departmentId } = req.body; 

      if (!accessToken) return res.status(400).json({ error: "缺少 Google Token" });

      // 🚀 2. 將 extraData (姓名, 部門) 傳給 Service
      const result = await AuthService.verifyGoogleAndLogin(accessToken, { 
        name, 
        departmentId 
      });
      
      return res.status(200).json({
        message: "Google 登入成功",
        ...result
      });
    } catch (error: any) {
      return res.status(401).json({ error: "認證失敗: " + error.message });
    }
  };

  static async microsoftLogin(req: Request, res: Response) {
    console.log("📥 收到 Microsoft 登入請求！內容:", req.body);
    try {
      // 🚀 1. 同樣解構出附加資料
      const { accessToken, name, departmentId } = req.body; 
      
      if (!accessToken) return res.status(400).json({ error: "缺少 Microsoft Access Token" });

      // 🚀 2. 傳入 Service 進行 upsert
      const result = await AuthService.verifyMicrosoftAndLogin(accessToken, { 
        name, 
        departmentId 
      });
      
      return res.status(200).json({
        message: "Microsoft 登入成功",
        ...result
      });
    } catch (error: any) {
      console.error("Microsoft Login Controller Error:", error);
      return res.status(401).json({ error: "Microsoft 認證失敗: " + error.message });
    }
  };

  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.registerLocal(req.body);
      res.status(201).json({ message: "註冊成功，請等待管理員審核", ...result });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.loginLocal(email, password);
      res.status(200).json({ message: "登入成功", ...result });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  // getMe 保持不變，但可以考慮多回傳 status 給前端判斷是否「待審核」
  static async getMe(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: "找不到使用者資訊" });

      return res.status(200).json({
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status, // 🚀 讓前端知道使用者是否為 PENDING
      });
    } catch (error) {
      return res.status(500).json({ error: "伺服器內部錯誤" });
    }
  }
}