/**
 * Define a estrutura de uma Tarefa (Task) conforme retornada pela API.
 * Corresponde ao modelo Prisma Tarefa.
 */
export interface Tarefa {
    id: number;
    titulo: string;
    descricao: string | null;
    prazo: string | null; // Usamos string para representar DateTime (ISO 8601)
    concluida: boolean;

    // Relacionamentos (IDs)
    projetoId: number;
    assigneeId: number | null;
    statusTarefaId: number;

    // Relacionamentos (Opcional: se o seu endpoint os incluir)
    // projeto?: Projeto;
    // assignee?: User | null;
    // statusTarefa?: StatusTarefa; 
}

/**
 * Define a estrutura de dados para criar uma nova Tarefa (Payload de Criação).
 * Excluímos 'id', 'concluida' (que tem default no backend), e os objetos de relacionamento.
 */
export type TarefaCreatePayload = {
    titulo: string;
    descricao?: string | null;
    prazo?: string | null;
    projetoId: number;
    assigneeId?: number | null;
    statusTarefaId: number;
};

/**
 * Define a estrutura de dados para atualizar uma Tarefa (Payload de Atualização).
 * Todos os campos são opcionais, permitindo a atualização parcial.
 */
export type TarefaUpdatePayload = Partial<TarefaCreatePayload> & {
    concluida?: boolean; // Pode ser atualizado individualmente
};

/**
 * Define a estrutura para o StatusTarefa, usado para o relacionamento.
 * (Você deve ter um modelo StatusTarefa no seu backend.)
 */
export interface StatusTarefa {
    id: number;
    nome: string; // Ex: "A Fazer", "Em Andamento", "Concluído"
    // Outros campos como cor, ordem, etc.
}
