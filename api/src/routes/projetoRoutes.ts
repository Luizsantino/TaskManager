import { Router } from "express";
import projetoController from "../controllers/projetoController";

const routes = Router();

/**
 * @swagger
 * tags:
 *   name: Projetos
 *   description: Gerenciamento de Projetos
 */

/**
 * @swagger
 * /projetos:
 *   get:
 *     summary: Retorna todos os projetos
 *     tags: [Projetos]
 *     responses:
 *       200:
 *         description: Lista de projetos
 *       500:
 *         description: Erro interno do servidor
 *   post:
 *     summary: Cria um novo projeto
 *     tags: [Projetos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *     responses:
 *       201:
 *         description: Projeto criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /projetos/{id}:
 *   get:
 *     summary: Retorna um projeto pelo ID
 *     tags: [Projetos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Projeto encontrado
 *       404:
 *         description: Projeto não encontrado
 *   put:
 *     summary: Atualiza um projeto pelo ID
 *     tags: [Projetos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Projeto atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Projeto não encontrado
 *       500:
 *         description: Erro interno do servidor
 *   delete:
 *     summary: Exclui um projeto pelo ID
 *     tags: [Projetos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Projeto removido com sucesso
 *       404:
 *         description: Projeto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

routes.post("/projetos", projetoController.createProjeto);
routes.get("/projetos", projetoController.getProjetos);
routes.get("/projetos/:id", projetoController.getProjetoById);
routes.put("/projetos/:id", projetoController.updateProjeto);
routes.delete("/projetos/:id", projetoController.deleteProjeto);

export default routes;
