import { Router } from "express";
import { emergency, stats } from "../controllers/aiController.js";
const router = Router();
router.post("/emergency", emergency);
router.get("/stats", stats);
export default router;
