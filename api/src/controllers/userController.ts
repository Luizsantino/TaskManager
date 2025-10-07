import { Request, Response } from "express";
import userService from "../services/userService";
import { User } from '@prisma/client';

const userController = {

    async createUser(req: Request, res: Response): Promise<void> {
        const { nome, cargo }: { nome: string; cargo: string } = req.body;
        
        if (typeof nome !== "string" || nome.trim() === "") {
            res.status(400).json({ message: "O nome é obrigatório e não pode estar vazio."});
            return;
        } 
        if (typeof cargo !== "string" || cargo.trim() === "") {
            res.status(400).json({ message: "O cargo é obrigatória e deve ser um número inteiro positivo."});
            return;
        }

        try {
            const user: User = await userService.createUser({ nome, cargo });
            res.status(201).json(user);
        } catch (error) {
            res.status(409).json({ message: "Erro ao criar o usuário." });
        } 
    }, //createUser

    //requisitar todos os usuários
    async getUsers(req: Request, res: Response): Promise<void> {
        try{
        const users: User[]  = await userService.getUsers();
        res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Ocorreu um erro ao buscar os usuários. "});
        }
    },//getUsers
    
    async getUserById(req: Request, res: Response): Promise<void> {

        try{
        const id: number = parseInt(req.params.id, 10);
        if (isNaN(id) || id <= 0) {
            res.status(400).json({ message: "ID inválido. Deve ser um número inteiro positivo."});
            return;
        }

        const user: User | null = await userService.getUserById(id);
        if (!user) {
            res.status(404).json({ message: "Usuário não encontrado"});
            return;
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ocorreu um erro ao buscar o usuário. "});
    }
    }, //getUserById

    
    async updateUser(req: Request, res: Response): Promise<void> {
        const id: number = parseInt(req.params.id, 10);
        if (isNaN(id) || id <= 0) {
            res.status(400).json({ message: "ID inválido. Deve ser um número inteiro positivo."});
            return;
        }

        const { nome, cargo }: { nome?: string; cargo?: string } = req.body;
        const dataToUpdate: { nome?: string; cargo?: string } = {};

        if (nome !== undefined) {
            if (typeof nome !== 'string' || nome.trim() === "") {
                res.status(400).json({ message: "O nome, se fornecido, não pode estar vazio."});
                return;
            }
            dataToUpdate.nome = nome;
        }

        if (cargo !== undefined) {
            if (typeof cargo !== 'string' ||  cargo.trim()) {
                res.status(400).json({ message: "O cargo, se fornecida, deve ser um número inteiro positivo."});
                return;
            }
            dataToUpdate.cargo = cargo;
        }

        if (Object.keys(dataToUpdate).length === 0) {
            res.status(400).json({ message: "Nenhum dado para atualizar foi fornecido (nome ou cargo)." });
            return;
        }

        try {
            const user: User = await userService.updateUser(id, dataToUpdate);
            res.json(user);
        } catch (error) {
            res.status(404).json({ message: "Usuário não encontrado" });
        }
    }, //updateUser

    async deleteUser(req: Request, res: Response): Promise<void> {
        const id: number = parseInt(req.params.id, 10);
        if (isNaN(id) || id <= 0) {
            res.status(400).json({ message: "ID inválido. Deve ser um número inteiro positivo." });
            return;
        }
        try {
            await userService.deleteUser(id);
            res.status(204).send();
        } catch (error) {
            res.status(404).json({ message: "Usuário não encontrado. " });
        }
    }, //deleteUser
};

export default userController;
