import { Router } from "express";
import * as c from "../controllers/taskController.js";
import * as ai from "../controllers/aiController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth);

router.get("/", c.listTasks);
router.get("/:id", c.getTask);
router.post("/", c.createTask);
router.patch("/:id", c.updateTask);
router.delete("/:id", c.deleteTask);
router.patch("/:id/start", c.startTask);
router.patch("/:id/complete", c.completeTask);
router.post("/:id/ai-message", ai.taskAiMessage);
export default router;
