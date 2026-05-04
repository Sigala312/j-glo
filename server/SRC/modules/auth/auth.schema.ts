import { z } from "zod";

// 1. 第三方登入 (Google/Microsoft) 的驗證
// 這些欄位是從前端第一步暫存區傳過來的
export const SocialAuthSchema = z.object({
  body: z.object({
    accessToken: z.string().min(1, "缺少 Access Token"),
    // name: z.string().min(1, "請輸入姓名"),
    // departmentId: z.string().min(1, "請選擇部門"), 
  }),
});

// 2. 訪客註冊 (LOCAL) 的驗證
export const LocalRegisterSchema = z.object({
  body: z.object({
    email: z.string().email("請輸入正確的 Email 格式"),
    password: z.string().min(6, "密碼至少需要 6 位元"),
    name: z.string().min(1, "請輸入姓名"), // 必填
    departmentId: z.string().min(1, "請選擇部門"), // 必填
  }),
});

// 3. 單純的訪客登入 (不需要部門，因為已經註冊過了)
export const LocalLoginSchema = z.object({
  body: z.object({
    email: z.string().email("請輸入正確的 Email 格式"),
    password: z.string().min(1, "請輸入密碼"),
  }),
});