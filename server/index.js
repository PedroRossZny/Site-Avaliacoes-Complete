import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import sequelize from "./utils/db.js";

import "./models/Review.js";
import "./models/Comment.js";

import routes from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));

// routes/index.js mounts /api/reviews and /api/comments.
app.use("/api", routes);

app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function startServer() {
  try {
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not sync the database:", error);
  }
}

startServer();
