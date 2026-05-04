import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { AdminService } from "./auth.service.js";

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

  static async handleGetUsers(req: Request, res: Response) {
    try {
      // 通常這裡建議檢查 req.user.role 是否為 ADMIN
      const users = await AdminService.getAllUsers();
      return res.status(200).json(users);
    } catch (error: any) {
      console.error("Fetch Users Error:", error);
      return res.status(500).json({ error: "無法取得使用者清單" });
    }
  }

  // 🚀 處理狀態更新 (Express 版：用於審核通過或停權離職)
 static async handleUpdateStatus(req: Request, res: Response) {
    try {
      const { userId, newStatus } = req.body;

      // 1. 基本驗證
      if (!userId || !newStatus) {
        return res.status(400).json({ error: "參數不足：需提供 userId 與 newStatus" });
      }

      // 2. 限制只能操作定義好的狀態，避免資料庫噴錯
      const validStatuses = ['PENDING', 'ACTIVE', 'SUSPENDED'];
      if (!validStatuses.includes(newStatus)) {
        return res.status(400).json({ error: `無效的狀態值。可用選項: ${validStatuses.join(', ')}` });
      }

      // 3. 呼叫 Service 更新 Prisma 資料
      const updatedUser = await AdminService.updateUserStatus(userId, newStatus);

      // 4. 回傳結果
      return res.status(200).json({
        message: `使用者 [${updatedUser.name}] 狀態已更新為 ${newStatus}`,
        user: {
          id: updatedUser.id,
          status: updatedUser.status
        }
      });
    } catch (error: any) {
      console.error("Update Status Error:", error);
      return res.status(500).json({ error: "更新失敗：" + error.message });
    }
  }
}