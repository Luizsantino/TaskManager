import { PrismaClient, Tarefa } from "@prisma/client";

const prisma = new PrismaClient();
const STATUS_ID_TAREFA_INICIAL = 1; // ID 1 para o StatusTarefa 'A FAZER', garantido pelo seed

const tarefaService = {
    
    async createTarefa(data: {
        titulo: string;
        descricao?: string;
        prazo?: Date;
        assigneeId?: number;
        projetoId: number;

    }): Promise<Tarefa> {

        // 1. Separa o projetoId e o assigneeId dos outros dados
        const { projetoId, assigneeId, ...tarefaData } = data;

        // 2. Prepara o objeto de dados com as conexões
        const createData: any = {
            ...tarefaData,

            // Conecta a tarefa ao Projeto (Obrigatório)
            projeto: {
                connect: { id: projetoId },
            },

            // Conecta ao Usuário Responsável (Se fornecido)
            ...(assigneeId && {
                assignee: {
                    connect: { id: assigneeId },
                },
            }),
        };

        // 3. Cria a tarefa e retorna o objeto
        return prisma.tarefa.create({
            data: createData,
            include: {
                statusTarefa: {
                    select: { nome: true}
                }
            }
        });
    }, // createTarefa

    async getTarefas(): Promise<Tarefa[]> {
        return prisma.tarefa.findMany({
            include: {
                statusTarefa: {
                    select: { nome: true }
                },
                assignee: {
                    select: { nome: true, cargo: true }
            },
                projeto: {
                    select: { nome: true }
                },
            }
        });
    }, //getTarefas

    async getTarefaById(id: number): Promise<Tarefa | null> {
        return prisma.tarefa.findUnique({
            where: { id },
            include: {
                statusTarefa: {
                    select: { nome: true }
                },
                assignee: {
                    select: { nome: true, cargo: true }
                },
                projeto: {
                    select: { nome: true }
                },
            }
        });
    }, // getTarefaById

    async updateTarefa(
        id: number,
        data: {
            titulo?: string;
            descricao?: string;
            prazo?: Date;
            statusTarefaId?: number;
            assigneeId?: number | null;
        }
    ): Promise<Tarefa> {
        
        const updateData: any = { ...data };

        // Logica para atualizar o status da tarefa
        if (data.statusTarefaId !== undefined) {
            // Se assigneeId for null, desvincula o responsável
            if (data.assigneeId === null) {
                updateData.assignee = { disconnect: true };
            } else {
                updateData.assignee = { connect: { id: data.assigneeId } };
            }
            delete updateData.assigneeId;
        }

        return prisma.tarefa.update({
            where: { id },
            data: updateData,
            include: {
                statusTarefa: { select: { nome: true } },
                assignee: { select: { nome: true, cargo: true } }
            }
        });
    }, // updateTarefa

    async deleteTarefa(id: number): Promise<void> {
        await prisma.tarefa.delete({
            where: { id },
        });
    }    
}; 

export default tarefaService;