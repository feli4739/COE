import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import authRoutes from "./routes/auth.js";
import peopleRoutes from "./routes/people.js";
import statsRoutes from "./routes/stats.js";

const app = express();

/** Detrás de Nginx / Cloudflare: una capa de proxy para X-Forwarded-* */
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/auth", loginLimiter, authRoutes);
app.use("/people", peopleRoutes);
app.use("/", statsRoutes);

app.listen(config.port, "0.0.0.0", () => {
  console.log(`API FireBurst en http://0.0.0.0:${config.port}`);
});
