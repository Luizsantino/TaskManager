import { Router } from "express";
import projetoController from "../controllers/projetoController";
import validate from "../middlewares/validate";
import { projetoSchema, projetoUpdateSchema } from "../schemas/projetoSchema";

const routes = Router();

/**
 * @swagger
 * tags:
 *   name: Projetos
 *   description: Gerenciamento de Projetos
 * 
 * components:
 *   schemas:
 *     Projeto:
 *       type: object
 *       required:
 *         - nome
 *         - descricao
 *         - dataInicio
 *         - dataFimPrevista
 *       properties:
 *         nome:
 *           type: string
 *           example: "Projeto API"
 *         descricao:
 *           type: string
 *           example: "Projeto para gerenciar tarefas e usuários"
 *         dataInicio:
 *           type: string
 *           format: date
 *           example: "1970-01-01T00:00:00.000Z"
 *         dataFimPrevista:
 *           type: string
 *           format: date
 *           example: "1970-01-01T00:00:00.000Z"
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
 *             $ref: '#/components/schemas/Projeto'
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
 *             $ref: '#/components/schemas/Projeto'
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
 *       204:
 *         description: Projeto removido com sucesso
 *       404:
 *         description: Projeto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

routes.post("/projetos", validate(projetoSchema), projetoController.createProjeto);
routes.get("/projetos", projetoController.getProjetos);
routes.get("/projetos/:id", projetoController.getProjetoById);
routes.put("/projetos/:id", validate(projetoUpdateSchema), projetoController.updateProjeto);
routes.delete("/projetos/:id", projetoController.deleteProjeto);

export default routes;
