import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

export interface Projeto {
    id: number;
    nome: string;
    descricao: string;
    dataInicio: string; // ISO String
    dataFimPrevista: string; // ISO String
    statusId: number;
}

export type ProjetoPayload = Omit<Projeto, 'id' | 'statusId'>;

/**
 * Busca a lista de todos os projetos do usuário.
 */
export const getProjetos = async (): Promise<Projeto[]> => {
    const res = await axios.get<Projeto[]>(API_ENDPOINTS.PROJETOS);
    return res.data;
};

/**
 * Cria um novo projeto.
 */
export const createProjeto = async (dados: ProjetoPayload): Promise<Projeto> => {
    const res = await axios.post<Projeto>(API_ENDPOINTS.PROJETOS, dados);
    return res.data;
};

/**
 * Atualiza um projeto existente.
 * @param id - ID do projeto a ser atualizado
 * @param dados - Dados do projeto para atualizar
 */
export const updateProjeto = async (id: number, dados: ProjetoPayload): Promise<Projeto> => {
    const res = await axios.put<Projeto>(`${API_ENDPOINTS.PROJETOS}/${id}`, dados);
    return res.data;
};

/**
 * Deleta um projeto pelo ID.
 * @param id - ID do projeto a ser removido
 */
export const deleteProjeto = async (id: number): Promise<void> => {
    await axios.delete(`${API_ENDPOINTS.PROJETOS}/${id}`);
};

/**
 * Adiciona um usuário a um projeto.
 * @param projetoId - ID do projeto
 * @param userId - ID do usuário que será vinculado
 */
export const addUsuarioToProjeto = async (projetoId: number, userId: number): Promise<void> => {
    await axios.post(`${API_ENDPOINTS.PROJETOS}/${projetoId}/usuarios`, { userId });
};

// Exportando todas as funções no default para facilitar import
export default {
    getProjetos,
    createProjeto,
    updateProjeto,
    deleteProjeto,
    addUsuarioToProjeto,
};
