import { z } from "zod";

export const createOrderSchema = z.object({
  projectId: z.string().cuid("ID 格式錯誤"),
  
  // 修正處：直接傳入一個包含 message 的物件
  amount: z.number({
    message: "金額為必填欄位且必須是數字",
  }).positive("金額必須大於 0"),
});