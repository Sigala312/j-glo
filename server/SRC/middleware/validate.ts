import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: "error",
          message: "輸入資料格式不正確",
          // ✨ 關鍵修正：將 .errors 改為 .issues
          errors: error.issues.map((issue) => ({
            field: issue.path[1] || issue.path[0],
            message: issue.message,
          })),
        });
      }
      return res.status(500).json({ status: "error", message: "伺服器內部驗證錯誤" });
    }
  };
};