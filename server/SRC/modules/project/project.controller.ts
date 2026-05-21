import { Request, Response } from "express";
import { ProjectService } from "./project.service.js";
import { updateStatusSchema } from "./project.schema.js";
import { string } from "zod";

// 定義 Request Query 的類型，增加型別安全性
interface ProjectQuery {
  clientId?: string;
}

export class ProjectController {
  /**
   * 建立新專案
   */
  // 🟢 正確的 Controller 修正寫法
static async create(req: Request, res: Response) {
    try {
      // 💡 1. 確保從 req.body 精準拿取前端傳來的 creatorId
      const { name, projectNo, clientId, creatorId } = req.body;

      // 💡 2. 安全防禦：如果前端沒傳，直接在 Controller 攔截並報錯，不讓 Prisma 崩潰
      if (!creatorId) {
        return res.status(400).json({ 
          error: "BAD_REQUEST", 
          message: "後端 Controller 拒絕對接：接收到的 creatorId 為空，請檢查前端 Token 狀態。" 
        });
      }

      // 💡 3. 呼叫 Service 建立專案
      const result = await ProjectService.createProject({
        name,
        projectNo,
        clientId,
        creatorId
      });

      // 💡 4. 回傳成功結果
      return res.status(201).json(result);
    } catch (error: any) {
      console.error("[Project Create Error]:", error);
      return res.status(500).json({ 
        error: "INTERNAL_SERVER_ERROR", 
        message: error.message || "建立專案時伺服器發生未知錯誤" 
      });
    }
  }

  /**
   * 取得專案列表 (支援按客戶 ID 篩選)
   */
  static async getProjects(
    req: Request<{}, {}, {}, ProjectQuery>,
    res: Response,
  ) {
    try {
      const { clientId } = req.query;

      // 建立查詢條件
      const whereCondition = clientId ? { clientId: clientId as string } : {};

      const projects = await ProjectService.findAll(whereCondition);

      return res.status(200).json(projects);
    } catch (error: any) {
      console.error("[Fetch Projects Error]:", error);
      return res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
    }
  }

  static async updateProjectStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // 1. Zod 格式驗證
      const validationResult = updateStatusSchema.safeParse(req.body);

      if (!validationResult.success) {
        // 修正處：使用 issues 而非 errors
        return res.status(400).json({
          error: validationResult.error.issues[0].message,
        });
      }

      // 2. 呼叫 Service
      const updatedProject = await ProjectService.updateStatus(
        id as string,
        validationResult.data.status,
      );

      return res.status(200).json({
        status: "success",
        message: `專案狀態已更新為 ${validationResult.data.status}`,
        data: updatedProject,
      });
    } catch (error: any) {
      console.error("[UpdateStatus_Error]:", error.message);

      if (error.message === "EMPTY_PROJECT_CANNOT_CHANGE_STATUS") {
        return res.status(422).json({
          error: "專案內無採購資料，請先新增採購單後再儲存。",
        });
      }

      if (error.message === "PROJECT_NOT_FOUND") {
        return res.status(404).json({ error: "找不到該專案" });
      }

      return res.status(500).json({ error: "伺服器內部錯誤" });
    }
  }

  static async getAllProjects(req: Request, res: Response) {
    try {
      const { status } = req.query; // 接收前端傳來的 ?status=...
      const where = status ? { status: status as any } : {};

      const projects = await ProjectService.findAll(where);
      return res.json(projects);
    } catch (error) {
      return res.status(500).json({ error: "無法取得專案列表" });
    }
  }

  static async getProjectById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      // 呼叫 Service 並傳入 id 查詢條件
      const project = await ProjectService.findOne({ id });

      if (!project) {
        return res.status(404).json({ error: "找不到該專案" });
      }

      return res.json(project);
    } catch (error) {
      return res.status(500).json({ error: "無法取得專案詳細資料" });
    }
  }
}
