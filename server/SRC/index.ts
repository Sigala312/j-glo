import express, { Express, Request, Response } from "express"; 
import cors from "cors";
import dotenv from "dotenv";
import path from 'path';

import { initCronJobs } from './modules/Invoice/cron.js';

import authRoutes from "./modules/auth/auth.route.js";
import attachmentRoutes from './modules/Attachment/attachment.routes.js'; // 確保路徑正確
import customerRoutes from "./modules/customer/customer.route.js";
import orderRoutes from "./modules/order/order.routes.js";
import IncoiceRoutes from "./modules/Invoice/Invoice.route.js";
import projectRoutes from "./modules/project/project.route.js";
import purchaseOrderRoutes from "./modules/PurchaseOrder/purchaseOrder.routes.js";
import purchaseInvoiceRoutes from "./modules/PurchaseInvoice/purchaseInvoice.Routes.js";
import remarkRoutes from "./modules/Remark/PurchaseOrderRemark.route.js";

// 1. 初始化環境變數 (讀取 .env 檔案)
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// 2. 中間件 (Middleware)
// 允許來自 Next.js 前端 (localhost:3000) 的跨域請求
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://j-glo-client.vercel.app" 
  ],
  credentials: true
}));

app.use((req, res, next) => {
  console.log(`[Incoming Request]: ${req.method} ${req.url}`);
  next();
});


// 解析 JSON 格式的 Request Body
app.use(express.json());


app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
// 3. 路由註冊 (Routes)
app.get("/", (req: Request, res: Response) => {
  res.send("J-GLOBAL API Server is running...");
});

// 認證相關 (Google Login / Me)
app.use("/api/auth", authRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use("/api/customer", customerRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/purchaseOrder", purchaseOrderRoutes);
app.use("/api/purchaseInvoice", purchaseInvoiceRoutes);
// 訂單相關 (管理員修改金額)
 app.use("/api/order", orderRoutes);
 app.use("/api/Invoice", IncoiceRoutes);
 app.use("/api/Remark", remarkRoutes);
// 4. 啟動伺服器
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[server]: 🚀 Local Server running at http://localhost:${PORT}`);
    // 本地環境才跑 Cron
    try {
      initCronJobs();
    } catch (err) {
      console.error(err);
    }
  });
}

export default app;