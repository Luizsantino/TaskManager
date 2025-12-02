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
}

/**
 * Payload para criar ou atualizar um projeto.
 * Não inclui `id` nem `statusId` (statusId será definido pela API).
 */
export type ProjetoPayload = Omit<Projeto, 'id' | 'statusId'>;