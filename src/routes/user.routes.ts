import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticateUser } from "../middlewares/authenticate-user";

export function createUserRoutes(userController: UserController) {
  const router = Router();
  /**
   * @swagger
   * /api/me:
   *   get:
   *     security:
   *       - cookieAuth: []
   *     summary: Get current authenticated user
   *     responses:
   *       200:
   *         description: Current user
   */
  router.get("/", authenticateUser, userController.me);
  return router;
}
