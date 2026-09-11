import { Router } from "express";
import { emergency, stats } from "../controllers/aiController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth);

router.post("/emergency", emergency);
router.get("/stats", stats);
export default router;
