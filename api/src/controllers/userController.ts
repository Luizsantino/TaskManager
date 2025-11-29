import { Request, Response } from "express";
import userService, { UserPublic } from "../services/userService";
import { User } from "@prisma/client";
import * as bcrypt from 'bcrypt'; // Importe para comparação de senhas
import * as jwt from 'jsonwebtoken'; // Importe para geração de token

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_padrao_muito_forte';

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
        // 2. Mude o tipo da variável 'users' para o tipo público
        const users: UserPublic[] = await userService.getUsers(); 
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

  async login(req: Request, res: Response): Promise<Response> { // Retorna Promise<Response>
    try {
      const { email, senha } = req.body;

      // 1. Buscar o usuário. Assumindo que userService tem a função findByEmail
      const user = await userService.findByEmail(email); 

      if (!user) {
        return res.status(401).json({ message: "E-mail ou senha inválidos." });
      }

      // 2. Comparar a senha
      // Assumindo que a senha armazenada no banco é 'user.senhaHash'
      const passwordMatch = await bcrypt.compare(senha, user.senhaHash); 

      if (!passwordMatch) {
        return res.status(401).json({ message: "E-mail ou senha inválidos." });
      }

      // 3. Gerar o Token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '1d' } // Expira em 1 dia
      );

      // 4. Remover o hash da senha antes de enviar a resposta
      const { senhaHash, ...userData } = user; 

      // 5. Enviar a resposta
      return res.status(200).json({
        token,
        user: userData,
      });

    } catch (error) {
      console.error("Erro no processo de login:", error);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
  },
};

export default userController;
