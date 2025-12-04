import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
// Importando os tipos canônicos da Tarefa e seus payloads
import type { Tarefa, TarefaCreatePayload, TarefaUpdatePayload, StatusTarefa } from "../types/tarefa"; 

// --- Funções de Serviço ---

/**
 * Busca a lista de todas as tarefas, opcionalmente filtrada por projeto.
 * @param projetoId - Opcional. ID do projeto para filtrar as tarefas.
 */
export const getTarefas = async (projetoId?: number): Promise<Tarefa[]> => {
    const url = projetoId 
        ? `${API_ENDPOINTS.TAREFAS}?projetoId=${projetoId}`
        : API_ENDPOINTS.TAREFAS;

    const res = await axios.get<Tarefa[]>(url);
    return res.data;
};

/**
 * Cria uma nova tarefa.
 */
export const createTarefa = async (dados: TarefaCreatePayload): Promise<Tarefa> => {
    const res = await axios.post<Tarefa>(API_ENDPOINTS.TAREFAS, dados);
    return res.data;
};

/**
 * Atualiza uma tarefa existente (campos parciais).
 * Usa Partial<TarefaCreatePayload> para permitir a atualização de campos básicos.
 * @param id - ID da tarefa a ser atualizada
 * @param dados - Dados da tarefa para atualizar (parcial)
 */
export const updateTarefa = async (id: number, dados: Partial<TarefaCreatePayload>): Promise<Tarefa> => {
    const res = await axios.put<Tarefa>(`${API_ENDPOINTS.TAREFAS}/${id}`, dados);
    return res.data;
};

/**
 * Atualiza o status (concluída e/ou statusTarefaId) de uma tarefa.
 * Usa TarefaUpdatePayload (que inclui 'concluida') para flexibilidade.
 * @param id - ID da tarefa
 * @param dados - Objeto contendo `concluida` e/ou `statusTarefaId`
 */
export const updateTarefaStatus = async (id: number, dados: TarefaUpdatePayload): Promise<Tarefa> => {
    // Geralmente, PATCH é usado para updates parciais de campos
    const res = await axios.patch<Tarefa>(`${API_ENDPOINTS.TAREFAS}/${id}`, dados);
    return res.data;
};

/**
 * Deleta uma tarefa pelo ID.
 * @param id - ID da tarefa a ser removida
 */
export const deleteTarefa = async (id: number): Promise<void> => {
    await axios.delete(`${API_ENDPOINTS.TAREFAS}/${id}`);
};

/**
 * Busca a lista de todos os status disponíveis para tarefas.
 */
export const getStatusTarefas = async (): Promise<StatusTarefa[]> => {
    // Assumimos que o endpoint para StatusTarefa é genérico (API_ENDPOINTS.STATUSES)
    const res = await axios.get<StatusTarefa[]>(API_ENDPOINTS.TAREFAS);
    return res.data;
};


// --- Exportação Padrão ---

/**
 * Exportando todas as funções no default para facilitar import.
 */
export default {
    getTarefas,
    createTarefa,
    updateTarefa,
    updateTarefaStatus,
    deleteTarefa,
    getStatusTarefas,
};