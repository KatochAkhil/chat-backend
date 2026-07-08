import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

export function createAuthRoutes(authController: AuthController) {
  const router = Router();
  /**
   * @swagger
   * /api/auth/google:
   *   post:
   *     summary: Login with Google ID token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [credential]
   *             properties:
   *               credential:
   *                 type: string
   *     responses:
   *       200:
   *         description: Authenticated user
   */
  router.post("/google", authController.loginWithGoogle);
  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     summary: Logout current user
   *     responses:
   *       200:
   *         description: Logged out
   */
  router.post("/logout", authController.logout);
  return router;
}
