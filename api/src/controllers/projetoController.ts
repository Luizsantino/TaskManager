import { Request, Response } from "express";
import projetoService from "../services/projetoService";
import { Projeto } from "@prisma/client";

const projetoController = {
  async createProjeto(req: Request, res: Response): Promise<void> {
    try {
      // req.body já validado pelo Zod
      const novoProjeto = await projetoService.createProjeto(req.body);
      res.status(201).json(novoProjeto);
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      res.status(500).json({
        message: "Ocorreu um erro interno ao criar o projeto.",
        details: "Verifique a integridade dos dados e se o BD está ativo.",
      });
    }
  },

  async getProjetos(req: Request, res: Response): Promise<void> {
    try {
      const projetos: Projeto[] = await projetoService.getProjetos();
      res.json(projetos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ocorreu um erro ao buscar os projetos." });
    }
  },

  async getProjetoById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const projeto: Projeto | null = await projetoService.getProjetoById(id);
      if (!projeto) {
        res.status(404).json({ message: "Projeto não encontrado." });
        return;
      }
      res.json(projeto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ocorreu um erro ao buscar o projeto." });
    }
  },

  async updateProjeto(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const projetoAtualizado = await projetoService.updateProjeto(id, req.body);
      res.json(projetoAtualizado);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Ocorreu um erro ao atualizar o projeto. Verifique se o ID e o statusId existem.",
      });
    }
  },

  async deleteProjeto(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await projetoService.deleteProjeto(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Projeto não encontrado ou erro na exclusão." });
    }
  },
};

export default projetoController;
