import { Request, Response } from 'express';
import tarefaService from '../services/tarefaService';
import { PrismaClient, Tarefa } from '@prisma/client';
import prisma from '../db/prisma';

const tarefaController = {

    
    async createTarefa(req: Request, res: Response): Promise<void> {
        try {
            // campos obrigatórios no corpo da requisição: titulo, projetoId
            const { titulo, descricao, prazo, projetoId, assigneeId } = req.body;

            // --- VALIDAÇÕES ---
            if(!titulo || typeof titulo !== 'string' || titulo.trim() === '') {
                res.status(400).json({ message: 'O título da tarefa é obrigatório. '});
                return;
            }

            // Validação da chave estrangeira obrigatória (projetoId)
            if (!projetoId || typeof projetoId !== 'number') {
                res.status(400).json({ message: 'O projetoId é obrigatório e deve ser um número. '});
                return;
            }
            // NOTE: Não validamos prazo, descricao ou assigneeId, pois são opcionais no service

            // Prepara os dados para o Service
            const tarefaData = {
                titulo,
                descricao,
                prazo,
                projetoId,
                assigneeId // Este campo é opcional e será tratado como tal no Service
            };

            const novaTarefa = await tarefaService.createTarefa(tarefaData);

            res.status(201).json(novaTarefa);
        } catch (error) {
            console.error('Erro ao criar tarefa: ', error);

            // Tratamento de erro comum do Prisma (ex: ProjetoId ou assigneeId não existe)
            res.status(500).json({
                message: 'Ocorreu um erro interno ao criar a tarefa. ',
                details: 'Verifique se o projetoId e o assigneeId existem no banco de dados. '
            });
        }
    }, //createTarefa

    // Requisitar todos os projetoss
    async getTarefas(req: Request, res: Response): Promise<void> {
        try {
            const tarefas: Tarefa[] = await tarefaService.getTarefas();
            res.json(tarefas);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro ao buscar as Tarefas. "});
        }
    },

    // Requisitar Taregas por ID
    async getTarefaById(req: Request, res: Response): Promise<void> {
        try {
            const id: number = parseInt(req.params.id, 10);
            if (isNaN(id) || id <= 0) {
                res.status(400).json({ message: "ID inválido. Deve ser um número inteiro positivo. "});
                return;
            }
            const tarefa: Tarefa | null = await tarefaService.getTarefaById(id);
            if (!tarefa) {
                res.status(404).json({ message: "Tarefa não encontrada. "});
                return;
            }
            res.json(tarefa);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro ao buscar a Tarefa. "});
        }
    },// getTarefasById

    async updateTarefa(req: Request, res: Response): Promise<void> {
        try {
            const id: number = parseInt(req.params.id, 10);
            const data = req.body;

            if (isNaN(id) || id <= 0) {
                res.status(400).json({ message: "ID inválido. "});
                return;
            }
            
            const tarefaAtualizada = await tarefaService.updateTarefa(id, data);

            res.json(tarefaAtualizada);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro ao atualizar a tarefa. Verifique se o ID e o statusId existem. "});
            return;
        }
    }, //updateTarefa

    async deleteTarefa(req: Request, res: Response): Promise<void> {
        const id: number = parseInt(req.params.id, 10);
        if (isNaN(id) || id <= 0) {
            res.status(400).json({ message: "Id inválido. Deve ser um número inteiro positivo. "});
            return;
        }
        try {
            await tarefaService.deleteTarefa(id);
            res.status(204).send(); //204 no Content
        } catch (error) {
            // O service agora cuida da deleção de tarefas aninhadas
            res.status(404).json({ message: "Tarefa não encontrada ou ocorreu um erro na exclusão. "})
        }
    }, //deleteTarefa

};


export default tarefaController;