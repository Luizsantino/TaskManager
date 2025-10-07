import { PrismaClient, Projeto } from '@prisma/client';
const STATUS_ID_PENDENTE = 1;
const prisma = new PrismaClient();

const projetoService = {
    async getProjetos(): Promise<Projeto[]> {
        return prisma.projeto.findMany();
    }, //getProjetos

    async getProjetoById(id: number): Promise<Projeto | null> {
        return prisma.projeto.findUnique({ where: { id } });
    }, //getProjetoById

    async createProjeto(data: {
        nome: string;
        descricao: string;
        dataInicio: Date;
        dataFimPrevista: Date;
    }): Promise<Projeto> {
        return prisma.projeto.create({
            data: {
                //1. Spreads os campos nome, descricao, dataInicio, dataFimPrevista
                ...data,
                //2. Adciona o relacionamento obrigatório (statusId = 1)
                status: {
                    connect: { id: STATUS_ID_PENDENTE },
                },

            },
        
         });
    }, //criar o projeto

    //atualizar o projeto
    async updateProjeto(
        id: number,
        data: { 
        nome?: string;
        descricao?: string;
        dataInicio?: Date;
        dataFimPrevista?: Date;
        statusId?: number
        }
    ): Promise<Projeto> {
        // Se houver um statusId na entrada
        if(data.statusId){
            const { statusId, ...restOfData } = data; //separa statusId dos outros dados
            return prisma.projeto.update({
                where: { id },
                data: {
                    ...restOfData, // Campos como nome, descricao, datas
                    status: {
                        connect: { id: statusId }, //Conecta o projeto ao novo status
                    }
                }
        });
    }
        // Se o statusId não for enviado, faz a atualização padrão
        return prisma.projeto.update({
            where: { id },
            data, // Atualiza nome, datas, etc., se forem fornecidos
        });

    }, //updateProjeto

    async deleteProjeto(id: number): Promise<void> {
        await prisma.projeto.delete({ where: { id } });
    }, //deleteProjeto
};

export default projetoService;