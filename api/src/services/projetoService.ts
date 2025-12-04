import { PrismaClient, Projeto } from '@prisma/client';
const STATUS_ID_PENDENTE = 1;
const prisma = new PrismaClient();

// Interface para os dados de criação no backend, incluindo os IDs dos membros
interface CreateProjetoData {
    nome: string;
    descricao: string;
    dataInicio: Date;
    dataFimPrevista: Date;
    membrosIds?: number[]; 
}

// Interface de atualização combinada (incluindo membros)
interface UpdateProjetoData {
    nome?: string;
    descricao?: string;
    dataInicio?: Date;
    dataFimPrevista?: Date;
    statusId?: number;
    membrosIds?: number[]; // Novo campo para atualização de membros
}

// --- INCLUDE PADRÃO ---
const projetoInclude = {
    status: true, 
    projetoUsuarios: { 
        include: {
            usuario: true, 
        }
    }
};


const projetoService = {
    
    async getProjetos(): Promise<Projeto[]> {
        return prisma.projeto.findMany({
            include: projetoInclude
        });
    }, //getProjetos

    async getProjetoById(id: number): Promise<Projeto | null> {
        return prisma.projeto.findUnique({ 
            where: { id }, 
            include: {
                tarefas: true,
                ...projetoInclude
            }, 
        });
    }, //getProjetoById

    async createProjeto(data: CreateProjetoData): Promise<Projeto> {
        const { membrosIds, ...restOfData } = data;

        const membrosToConnect = membrosIds 
            ? membrosIds.map(id => ({ userId: id })) 
            : [];

        return prisma.projeto.create({
            data: {
                ...restOfData,
                
                status: {
                    connect: { id: STATUS_ID_PENDENTE },
                },

                projetoUsuarios: {
                    createMany: {
                        data: membrosToConnect,
                    },
                },
            },
            include: projetoInclude
        });
    }, //criar o projeto

    // atualizar o projeto
    async updateProjeto(
        id: number,
        data: UpdateProjetoData 
    ): Promise<Projeto> {
        // Separa os campos de relacionamentos que exigem gerenciamento M:N
        const { statusId, membrosIds, ...restOfData } = data;

        // Monta o objeto de dados a ser enviado ao Prisma
        const updateData: any = { ...restOfData };

        // 1. Lógica de atualização de Status
        if (statusId !== undefined) {
            updateData.status = {
                connect: { id: statusId },
            };
        }

        // 2. Lógica de atualização de Membros (M:N Explícito)
        if (membrosIds !== undefined) {
            // Utilizamos uma transação para garantir que o DELETE e o CREATE sejam atômicos.
            // Se o set falhou, esta é a solução mais segura.
            
            // a) Deleta todos os registros antigos de junção para este projeto
            const deleteAction = prisma.projetoUsuarios.deleteMany({
                where: { projetoId: id },
            });
            
            // b) Cria novos registros de junção com os IDs fornecidos
            const createAction = prisma.projetoUsuarios.createMany({
                data: membrosIds.map(userId => ({ userId, projetoId: id })),
                skipDuplicates: true,
            });

            // c) Executa as ações de deleção/criação em transação.
            // NOTA: Adicionamos a execução dentro do array de ações que será passado para o update
            // para que toda a lógica seja executada em sequência.
            
            // Já que não podemos executar await aqui, vamos fazer o update do projeto APÓS
            // as operações de exclusão/criação.
            await prisma.$transaction([deleteAction, createAction]);
        }

        // 3. Executa o UPDATE do Projeto base (agora sem o campo projetoUsuarios)
        return prisma.projeto.update({
            where: { id },
            data: updateData, // Contém apenas dados base e a conexão de status (se houver)
            include: projetoInclude
        });
    }, //updateProjeto

    async deleteProjeto(id: number): Promise<void> {
        // NOTA: Prisma deve lidar com o CASCADE DELETE na tabela de junção
        await prisma.projeto.delete({ where: { id } });
    }, //deleteProjeto
};

export default projetoService;