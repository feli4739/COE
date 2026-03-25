import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { personBodySchema } from "../validation/people.js";
import * as peopleService from "../services/peopleService.js";

const router = Router();
router.use(authMiddleware);

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
  nombre: z.string().optional(),
  dni: z.string().optional(),
  barrio: z.string().optional(),
  activo: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});

router.get("/", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Query inválida", details: parsed.error.flatten() });
  }
  const result = await peopleService.listPeople(parsed.data);
  return res.json({
    items: result.items,
    total: result.total,
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
  });
});

router.get("/:id", async (req, res) => {
  const row = await peopleService.getPersonById(req.params.id);
  if (!row) return res.status(404).json({ error: "No encontrado" });
  return res.json(row);
});

router.post("/", async (req, res) => {
  const parsed = personBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validación", details: parsed.error.flatten() });
  }
  try {
    const id = await peopleService.createPerson(parsed.data);
    const row = await peopleService.getPersonById(id);
    return res.status(201).json(row);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "23505") {
      return res.status(409).json({ error: "DNI o legajo duplicado" });
    }
    throw e;
  }
});

router.put("/:id", async (req, res) => {
  const parsed = personBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validación", details: parsed.error.flatten() });
  }
  try {
    const n = await peopleService.updatePerson(req.params.id, parsed.data);
    if (!n) return res.status(404).json({ error: "No encontrado" });
    const row = await peopleService.getPersonById(req.params.id);
    return res.json(row);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "23505") {
      return res.status(409).json({ error: "DNI o legajo duplicado" });
    }
    throw e;
  }
});

router.delete("/:id", async (req, res) => {
  const n = await peopleService.softDeletePerson(req.params.id);
  if (!n) return res.status(404).json({ error: "No encontrado" });
  return res.status(204).send();
});

export default router;
