import { z } from "zod";

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "客戶名稱不能為空"),
  }),
});

export type CreateClientInput = z.infer<typeof createCustomerSchema>["body"];