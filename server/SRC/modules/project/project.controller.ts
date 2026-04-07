import { Request, Response } from "express";
import { ProjectService } from "./project.service.js";

export class ProjectController {
  static async create(req: Request, res: Response) {
    try {
      // 從 authenticateJWT 中間件拿到的使用者資訊
      const creatorId = (req as any).user.userId; 
      const { name, projectNo, clientId } = req.body;

      const project = await ProjectService.createProject({
        name,
        projectNo,
        clientId,
        creatorId
      });

      res.status(201).json(project);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}