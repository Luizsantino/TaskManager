import { Request, Response } from "express";
import tarefaService from "../services/tarefaService";
import { Tarefa } from "@prisma/client";

const tarefaController = {
  async createTarefa(req: Request, res: Response): Promise<void> {
    try {
      const novaTarefa = await tarefaService.createTarefa(req.body);
      res.status(201).json(novaTarefa);
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      res.status(500).json({
        message: "Ocorreu um erro interno ao criar a tarefa.",
        details: "Verifique se o projetoId e o assigneeId existem.",
      });
    }
  },

  async getTarefas(req: Request, res: Response): Promise<void> {
    try {
      const tarefas: Tarefa[] = await tarefaService.getTarefas();
      res.json(tarefas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar tarefas." });
    }
  },

  async getTarefaById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const tarefa: Tarefa | null = await tarefaService.getTarefaById(id);
      if (!tarefa) {
        res.status(404).json({ message: "Tarefa não encontrada." });
        return;
      }
      res.json(tarefa);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar a tarefa." });
    }
  },

  async updateTarefa(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const tarefaAtualizada = await tarefaService.updateTarefa(id, req.body);
      res.json(tarefaAtualizada);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao atualizar a tarefa." });
    }
  },

  async deleteTarefa(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await tarefaService.deleteTarefa(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Tarefa não encontrada ou erro na exclusão." });
    }
  },
};

export default tarefaController;
