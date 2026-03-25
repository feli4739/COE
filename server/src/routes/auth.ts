import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { config } from "../config.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const { rows } = await pool.query(
    `SELECT id, email, password_hash FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );
  const user = rows[0] as { id: string; email: string; password_hash: string } | undefined;
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: "7d" }
  );

  return res.json({
    token,
    user: { id: user.id, email: user.email },
  });
});

export default router;
