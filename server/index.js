import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import sequelize from "./utils/db.js";

import "./models/Review.js";
import "./models/Comment.js";

import routes from "./routes/index.js";
import commentRoutes from "./routes/commentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.use("/api", routes);                 
app.use("/api/comments", commentRoutes); 
app.use("/api/reviews", reviewRoutes);   

app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function startServer() {
  try {
    await sequelize.sync();
    app.listen(3000, () => {
      console.log("🚀 Servidor rodando em http://localhost:3000");
    });
  } catch (error) {
    console.error("❌ Erro ao sincronizar banco:", error);
  }
}

startServer();
