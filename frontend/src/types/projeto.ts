/**
 * Representa um projeto no sistema.
 */
export interface Projeto {
    id: number;
    nome: string;
    descricao: string;
    dataInicio: string;      // ISO String
    dataFimPrevista: string; // ISO String
    statusId: number;        // O status do projeto

    status: ProjetoStatus;
}
export interface ProjetoStatus {
    id: number;
    nome: string; // Ex: "Em Andamento", "Concluído"
    // Adicione outros campos do status, se existirem (ex: cor)
}

/**
 * Payload para criar ou atualizar um projeto.
 * Não inclui `id` nem `statusId` (statusId será definido pela API).
 */
export type ProjetoPayload = Omit<Projeto, 'id' | 'statusId' | 'status' | 'membrosIds'>;