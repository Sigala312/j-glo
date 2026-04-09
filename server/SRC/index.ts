import express, { Express, Request, Response } from "express"; 
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.route.js";
import customerRoutes from "./modules/customer/customer.route.js"
import projectRoutes from "./modules/project/project.route.js";
import purchaseOrderRoutes from "./modules/PurchaseOrder/purchaseOrder.routes.js";
// import orderRoutes from "./routes/order.route";

// 1. 初始化環境變數 (讀取 .env 檔案)
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// 2. 中間件 (Middleware)
// 允許來自 Next.js 前端 (localhost:3000) 的跨域請求
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use((req, res, next) => {
  console.log(`[Incoming Request]: ${req.method} ${req.url}`);
  next();
});

// 解析 JSON 格式的 Request Body
app.use(express.json());

// 3. 路由註冊 (Routes)
app.get("/", (req: Request, res: Response) => {
  res.send("J-GLOBAL API Server is running...");
});

// 認證相關 (Google Login / Me)
app.use("/api/auth", authRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/purchaseOrder", purchaseOrderRoutes);
// 訂單相關 (管理員修改金額)
// app.use("/api/orders", orderRoutes);

// 4. 啟動伺服器
app.listen(PORT, () => {
  console.log(`[server]: 🚀 Server is running at http://localhost:${PORT}`);
  console.log(`[server]: 🔧 Mode: ${process.env.NODE_ENV || 'development'}`);
});