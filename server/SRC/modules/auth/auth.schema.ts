import { z } from "zod";

export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email("請輸入正確的 Email 格式"),
    name: z.string().optional(),
    image: z.string().url().optional(),
  }),
});