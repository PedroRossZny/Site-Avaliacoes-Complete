import { Router } from "express";
import reviewRoutes from "./reviewRoutes.js";
import commentRoutes from "./commentRoutes.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Servidor rodando! 🚀" });
});

router.use("/reviews", reviewRoutes);
router.use("/comments", commentRoutes);

export default router;
