import { z } from "zod";

export const updateStatusSchema = z.object({
  status: z.enum(["FILLED", "COMPLETED"], {
    // 直接使用 message 屬性即可，不需要 errorMap
    message: "請提供正確的專案狀態（FILLED 或 COMPLETED）",
  }),
});