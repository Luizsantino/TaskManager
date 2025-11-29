import { Router } from "express";
import userController from "../controllers/userController"; // Ou authController
import validate from "../middlewares/validate";
import { loginSchema } from "../schemas/loginSchema"; // O schema que valida email/senha

const authRoutes = Router();

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autentica o usuário e retorna um JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@email.com
 *               senha:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login bem-sucedido, retorna JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Credenciais inválidas
 */
authRoutes.post("/login", validate(loginSchema), userController.login); 
// Assumindo que a função se chama 'login' no seu userController

export default authRoutes;