import { Router, Request, Response, NextFunction } from "express";

import { authorize } from "../../middleware/auth";
import { seedDatabase } from "./admin.seed.service";
import { clearDatabase } from "./admin.clear.service";
import { HttpError } from "../../middleware/error-handler";
import { isSuperAdmin } from "../../lib/super-admin";

export const adminRouter = Router();

function requireSuperAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user || !isSuperAdmin(req.user.email)) {
    return next(new HttpError(403, "Forbidden"));
  }
  return next();
}

adminRouter.post("/seed", authorize("Admin"), requireSuperAdmin, async (_req: Request, res: Response) => {
  const result = await seedDatabase();

  res.status(201).json({ status: "success", data: result });
});

adminRouter.post("/clear", authorize("Admin"), requireSuperAdmin, async (req: Request, res: Response) => {
  if (!req.user) throw new HttpError(401, "Not authenticated");

  await clearDatabase(BigInt(req.user.userId));

  res.status(200).json({ status: "success", data: { cleared: true } });
});
