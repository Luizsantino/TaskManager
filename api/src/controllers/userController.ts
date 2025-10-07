import { Request, Response } from "express";
import userService from "../services/userService";
import { User } from "@prisma/client";

const userController = {
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user: User = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      console.error(error);
      res.status(409).json({ message: "Erro ao criar o usuário." });
    }
  },

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users: User[] = await userService.getUsers();
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar usuários." });
    }
  },

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const user: User | null = await userService.getUserById(id);
      if (!user) {
        res.status(404).json({ message: "Usuário não encontrado." });
        return;
      }
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar usuário." });
    }
  },

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const user: User = await userService.updateUser(id, req.body);
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(404).json({ message: "Usuário não encontrado." });
    }
  },

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await userService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Usuário não encontrado." });
    }
  },
};

export default userController;
