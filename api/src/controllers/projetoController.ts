import { Request, Response } from "express";
import projetoService from "../services/projetoService";
import { Projeto } from '@prisma/client';

const projetoController = {

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
