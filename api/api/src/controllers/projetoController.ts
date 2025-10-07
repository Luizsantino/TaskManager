import { Request, Response } from "express";
import projetoService from "../services/projetoService";
import { Projeto } from '@prisma/client';

const projetoController = {

    /**
     * @swagger
     * /api/projetos:
     * post:
     * summary: Cria um novo projeto e o inicia com o status Pendente.
     * tags: [Projetos]
     * requestBody:
     * required: true
     * content:
     * application/json:
     * schema:
     * type: object
     * required:
     * - nome
     * - descricao
     * - dataInicio
     * - dataFimPrevista
     * properties:
     * nome:
     * type: string
     * example: Novo E-commerce
     * descricao:
     * type: string
     * example: Desenvolvimento da plataforma de vendas online.
     * dataInicio:
     * type: string
     * format: date-time
     * example: "2025-10-15T00:00:00.000Z"
     * dataFimPrevista:
     * type: string
     * format: date-time
     * example: "2026-03-30T00:00:00.000Z"
     * responses:
     * 201:
     * description: Projeto criado com sucesso.
     * content:
     * application/json:
     * schema:
     * type: object
     * properties:
     * id: { type: integer, example: 1 }
     * nome: { type: string }
     * status: 
     * type: object
     * properties: 
     * nome: { type: string, example: "Pendente" }
     * 400:
     * description: Dados de entrada inválidos.
     * 500:
     * description: Erro interno do servidor.
     */
    async createProjeto(req: Request, res: Response): Promise<void> {
        try {
            // NOTE: A validação de negócio (Pendente) é feita no service.
            const { nome, descricao, dataInicio, dataFimPrevista }: 
                { nome: string; descricao: string; dataInicio: Date; dataFimPrevista: Date; } = req.body;
    
            // Validações de entrada
            if (!nome || typeof nome !== "string" || nome.trim() === "") {
                res.status(400).json({ message: "O nome do projeto é obrigatório." });
                return;
            }
            if (!descricao || typeof descricao !== "string" || descricao.trim() === "") {
                res.status(400).json({ message: "A descrição do projeto é obrigatória." });
                return;
            }
            if (!dataInicio || !dataFimPrevista) {
                res.status(400).json({ message: 'As datas de início e fim prevista são obrigatórias.' });
                return;
            }
            
            // O service agora cuida da criação e do status
            const novoProjeto = await projetoService.createProjeto({ nome, descricao, dataInicio, dataFimPrevista });
            
            res.status(201).json(novoProjeto);
    
        } catch (error) {
            console.error("Erro ao criar projeto:", error);
            res.status(500).json({ 
                message: "Ocorreu um erro interno ao criar o projeto.",
                details: "Verifique a integridade dos dados e se o BD está ativo."
            });
        }
    }, //createProjeto
    
    /**
     * @swagger
     * /api/projetos:
     * get:
     * summary: Lista todos os projetos.
     * tags: [Projetos]
     * responses:
     * 200:
     * description: Lista de projetos retornada com sucesso.
     * content:
     * application/json:
     * schema:
     * type: array
     * items:
     * $ref: '#/components/schemas/Projeto'
     * 500:
     * description: Erro interno do servidor.
     */
    async getProjetos(req: Request, res: Response): Promise<void> {
        try {
            // A tipagem 'Projeto[]' para a resposta do Service é suficiente
            const projetos: Projeto[] = await projetoService.getProjetos();
            res.json(projetos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro ao buscar os projetos." });
        }
    }, //getProjetos

    /**
     * @swagger
     * /api/projetos/{id}:
     * get:
     * summary: Retorna um projeto pelo ID.
     * tags: [Projetos]
     * parameters:
     * - in: path
     * name: id
     * required: true
     * schema:
     * type: integer
     * description: ID do projeto a ser buscado.
     * responses:
     * 200:
     * description: Projeto encontrado.
     * content:
     * application/json:
     * schema:
     * $ref: '#/components/schemas/Projeto'
     * 400:
     * description: ID inválido.
     * 404:
     * description: Projeto não encontrado.
     */
    async getProjetoById(req: Request, res: Response): Promise<void> {
        try {
            const id: number = parseInt(req.params.id, 10);
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ message: "ID inválido. Deve ser um número inteiro positivo." });
                return;
            }
            const projeto: Projeto | null = await projetoService.getProjetoById(id);
            if (!projeto) {
                res.status(404).json({ message: "Projeto não encontrado. " });
                return;
            }
            res.json(projeto);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro ao buscar o projeto." });
        }
    },  //getProjetoById

    /**
     * @swagger
     * /api/projetos/{id}:
     * put:
     * summary: Atualiza um projeto existente (dados ou status).
     * tags: [Projetos]
     * parameters:
     * - in: path
     * name: id
     * required: true
     * schema:
     * type: integer
     * description: ID do projeto a ser atualizado.
     * requestBody:
     * required: true
     * content:
     * application/json:
     * schema:
     * type: object
     * properties:
     * nome: { type: string, example: "Novo Nome" }
     * statusId: { type: integer, example: 5, description: "ID do novo status (ex: 5 para Concluído)" }
     * responses:
     * 200:
     * description: Projeto atualizado com sucesso.
     * 400:
     * description: ID ou dados inválidos.
     * 500:
     * description: Erro interno ou statusId inexistente.
     */
    async updateProjeto(req: Request, res: Response): Promise<void> {
        try {
            const id: number = parseInt(req.params.id, 10);
            const data = req.body;
            
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ message: "ID inválido." });
                return;
            }
            if (Object.keys(data).length === 0) {
                res.status(400).json({ message: "Nenhum dado fornecido para atualização." });
                return;
            }

            const projetoAtualizado = await projetoService.updateProjeto(id, data);

            res.json(projetoAtualizado);
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "Ocorreu um erro ao atualizar o projeto. Verifique se o ID e o statusId existem."});   
        }
    },  //updateProjeto

    /**
     * @swagger
     * /api/projetos/{id}:
     * delete:
     * summary: Deleta um projeto e todas as tarefas relacionadas.
     * tags: [Projetos]
     * parameters:
     * - in: path
     * name: id
     * required: true
     * schema:
     * type: integer
     * description: ID do projeto a ser deletado.
     * responses:
     * 204:
     * description: Projeto e tarefas relacionadas deletados com sucesso (No Content).
     * 400:
     * description: ID inválido.
     * 404:
     * description: Projeto não encontrado.
     */
    async deleteProjeto(req: Request, res: Response): Promise<void> {
        const id: number = parseInt(req.params.id, 10);
        if (isNaN(id) || id <= 0) {
            res.status(400).json({ message: "Id inválido. Deve ser um número inteiro positivo." });
            return;
        }
        try {
            await projetoService.deleteProjeto(id);
            res.status(204).send(); // 204 No Content
        } catch (error) {
            // O service agora cuida da deleção de tarefas aninhadas
            res.status(404).json({ message: "Projeto não encontrado ou ocorreu um erro na exclusão." })
        }
    }, //deleteProjeto
};

export default projetoController;
