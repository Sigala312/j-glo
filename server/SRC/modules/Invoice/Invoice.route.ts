// routes/invoice.route.ts
import { Router } from "express";
import { InvoiceController } from "./Invoice.controller.js";

const router: Router = Router();

router.post("/", InvoiceController.create);
router.get("/", InvoiceController.getByOrder);
router.patch("/:id/pay", InvoiceController.markAsPaid);
router.patch("/:id", InvoiceController.update);
router.delete("/:id", InvoiceController.delete);
router.get("/overdue",  InvoiceController.getOverdueInvoices);

export default router;