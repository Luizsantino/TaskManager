import { Router } from "express";
import tarefaController from "../controllers/tarefaController";

const routes = Router();

/**
 * @swagger
 * tags:
 *   name: Tarefas
 *   description: Gerenciamento de Tarefas
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
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pendente, em_andamento, concluida]
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
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pendente, em_andamento, concluida]
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
 *       200:
 *         description: Tarefa removida com sucesso
 *       404:
 *         description: Tarefa não encontrada
 *       500:
 *         description: Erro interno do servidor
 */

routes.post("/tarefas", tarefaController.createTarefa);
routes.get("/tarefas", tarefaController.getTarefas);
routes.get("/tarefas/:id", tarefaController.getTarefaById);
routes.put("/tarefas/:id", tarefaController.updateTarefa);
routes.delete("/tarefas/:id", tarefaController.deleteTarefa);

export default routes;
