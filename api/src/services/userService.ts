import { User } from '@prisma/client';
import prisma from '../db/prisma';
import * as bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;
export type UserPublic = Omit<User, 'senhaHash'>;

const userService = {
    async getUsers(): Promise<UserPublic[]> {
        
        const users = await prisma.user.findMany({
            select: {
                id: true,
                nome: true,
                cargo: true,
                email: true,
            }
        });
        return users as UserPublic[];
    },

    async getUserById(id: number): Promise<User | null> {
        return prisma.user.findUnique({ where: { id } });
    },

    async createUser(data: { nome: string; cargo: string; email: string; senha: string }): Promise<User> {
        // 1. Desestrutura o objeto para separar a senha
        const { senha, ...userData } = data; 
        
        // 2. Gera o hash da senha
        const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

        // 3. Cria o usuário no banco, salvando o hash
        return prisma.user.create({ 
            data: { 
                ...userData, // nome, cargo, email
                senhaHash, // Armazena o hash
            }, 
        });
    },

    async updateUser(id: number, data: { nome?: string; cargo?: string; email: string; senha: string;}): Promise<User> {
        return prisma.user.update({
            where: { id },
            data,
        });
    },

    async deleteUser(id: number): Promise<void> {
        await prisma.user.delete({ where: { id } });
    },
    // ----------------------------------------------------------------
    // 1. FUNÇÃO DE BUSCA POR EMAIL (Necessário para o Login)
    // ----------------------------------------------------------------
    async findByEmail(email: string): Promise<User | null> {
        // CORREÇÃO: Usamos findFirst, que aceita qualquer campo na cláusula 'where',
        // resolvendo o erro de tipagem do findUnique.
        return prisma.user.findFirst({ 
            where: { 
                email: email 
            },
        });
    },
};

export default userService;