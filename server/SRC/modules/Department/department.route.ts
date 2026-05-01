import { Router } from "express";
import { getDepartments } from "./department.controller.js";

const router: Router = Router();

router.get("/", getDepartments);

export default router;