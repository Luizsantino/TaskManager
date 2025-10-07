import { Router } from "express";
import tarefaController from "../controllers/tarefaController";
import validate from "../middlewares/validate";
import { tarefaSchema, tarefaUpdateSchema } from "../schemas/tarefaSchema";

const routes = Router();

/**
 * @swagger
 * tags:
 *   name: Tarefas
 *   description: Gerenciamento de Tarefas
 * 
 * components:
 *   schemas:
 *     Tarefa:
 *       type: object
 *       required:
 *         - titulo
 *         - projetoId
 *       properties:
 *         titulo:
 *           type: string
 *           example: "Implementar API"
 *         descricao:
 *           type: string
 *           example: "Criar endpoints para gerenciar tarefas"
 *         prazo:
 *           type: string
 *           format: date
 *           example: "1970-01-01T00:00:00.000Z"
 *         projetoId:
 *           type: number
 *           example: 1
 *         assigneeId:
 *           type: number
 *           example: 2
 */

/**
 * @swagger
 * /tarefas:
 *   get:
 *     summary: Retorna todas as tarefas
 *     tags: [Tarefas]
 *     responses:
 *       200:
 *         description: Lista de tarefas
 *       500:
 *         description: Erro interno do servidor
 *   post:
 *     summary: Cria uma nova tarefa
 *     tags: [Tarefas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tarefa'
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /tarefas/{id}:
 *   get:
 *     summary: Retorna uma tarefa pelo ID
 *     tags: [Tarefas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tarefa encontrada
 *       404:
 *         description: Tarefa não encontrada
 *   put:
 *     summary: Atualiza uma tarefa pelo ID
 *     tags: [Tarefas]
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
 *             $ref: '#/components/schemas/Tarefa'
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Tarefa não encontrada
 *       500:
 *         description: Erro interno do servidor
 *   delete:
 *     summary: Exclui uma tarefa pelo ID
 *     tags: [Tarefas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Tarefa removida com sucesso
 *       404:
 *         description: Tarefa não encontrada
 *       500:
 *         description: Erro interno do servidor
 */

routes.post("/tarefas", validate(tarefaSchema), tarefaController.createTarefa);
routes.get("/tarefas", tarefaController.getTarefas);
routes.get("/tarefas/:id", tarefaController.getTarefaById);
routes.put("/tarefas/:id", validate(tarefaUpdateSchema), tarefaController.updateTarefa);
routes.delete("/tarefas/:id", tarefaController.deleteTarefa);

export default routes;
