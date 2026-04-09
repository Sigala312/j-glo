import { Router } from "express";
import { getCustomers, getCustomerById,createCustomer, updateClient } from "./customer.controller.js";
import { authenticateJWT } from "../../middleware/auth.js"; // 確保已登入

const router: Router = Router();

router.get("/", authenticateJWT, getCustomers);
router.get("/:id", authenticateJWT, getCustomerById);
router.post("/", authenticateJWT, createCustomer);
router.patch("/:id", authenticateJWT, updateClient);

export default router;