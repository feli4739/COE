import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getDashboardStats } from "../services/statsService.js";

const router = Router();
router.use(authMiddleware);

router.get("/stats", async (_req, res) => {
  const stats = await getDashboardStats();
  res.json(stats);
});

export default router;
