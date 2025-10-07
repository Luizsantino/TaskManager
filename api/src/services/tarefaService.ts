import { PrismaClient, Tarefa } from "@prisma/client";

const prisma = new PrismaClient();
// ID 1 é o StatusTarefa 'A Fazer', garantido pelo seu seed.
const STATUS_ID_TAREFA_INICIAL = 1; 

const tarefaService = {
    
    async createTarefa(data: {
        titulo: string;
        descricao?: string;
        prazo?: Date;
        projetoId: number;
        assigneeId?: number; // Mudado de 'responsavelId' para 'assigneeId' (consistente com o schema)
    }): Promise<Tarefa> {

        // --- VALIDAÇÃO DE EXISTÊNCIA DE CHAVES ESTRANGEIRAS ---
        
        // 1. Verificar se o projetoId existe
        const projetoExiste = await prisma.projeto.findUnique({
            where: { id: data.projetoId },
        });

        if (!projetoExiste) {
            throw new Error(`Projeto com ID ${data.projetoId} não encontrado.`);
        }

        // 2. Verificar se o assigneeId (responsável) existe, SE for fornecido
        if (data.assigneeId) {
            const assigneeExiste = await prisma.user.findUnique({
                where: { id: data.assigneeId },
            });

            if (!assigneeExiste) {
                 throw new Error(`Usuário responsável (assignee) com ID ${data.assigneeId} não encontrado.`);
            }
        }
        
        // --- FIM DA VALIDAÇÃO ---


        // Separa os IDs e os outros dados
        const { projetoId, assigneeId, ...tarefaData } = data;

        // Prepara o objeto de criação
        const createData: any = {
            ...tarefaData,

            // Conexão com o Status Inicial (CORREÇÃO CRUCIAL)
            statusTarefa: { 
                connect: { id: STATUS_ID_TAREFA_INICIAL } 
            },

            // Conecta a tarefa ao Projeto (Obrigatório)
            projeto: {
                connect: { id: projetoId },
            },
            
            // Conecta ao Usuário Responsável (Se fornecido e existir)
            ...(assigneeId && {
                assignee: {
                    connect: { id: assigneeId },
                },
            }),
        };

        return prisma.tarefa.create({
            data: createData,
            include: {
                statusTarefa: {
                    select: { nome: true}
                }
            }
        });
    }, // createTarefa

    async getTarefas(filtros?: { projetoId?: number, assigneeId?: number }): Promise<Tarefa[]> {
        
        const whereClause: any = {};
        
        if (filtros?.projetoId) {
            whereClause.projetoId = filtros.projetoId;
        }

        if (filtros?.assigneeId) {
            whereClause.assigneeId = filtros.assigneeId;
        }

        return prisma.tarefa.findMany({
            where: whereClause,
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
            assigneeId?: number | null; // Pode ser number, null (desconectar) ou undefined (ignorar)
        }
    ): Promise<Tarefa> {
        
        const { statusTarefaId, assigneeId, ...restOfData } = data;
        const updateData: any = { ...restOfData };
        
        // 1. Lógica de atualização de Status
        if (statusTarefaId !== undefined) {
            updateData.statusTarefa = { connect: { id: statusTarefaId } };
        }
        
        // 2. Lógica de atualização de Responsável
        if (assigneeId !== undefined) {
            if (assigneeId === null) {
                // Desconecta o responsável (assignee)
                updateData.assignee = { disconnect: true };
            } else {
                // Conecta o novo responsável (assume-se que ele existe)
                updateData.assignee = { connect: { id: assigneeId } };
            }
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
        // A tarefa não tem dependentes, então deleta diretamente.
        await prisma.tarefa.delete({
            where: { id },
        });
    } 
}; 

export default tarefaService;