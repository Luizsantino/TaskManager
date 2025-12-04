import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
// Importando os tipos canônicos de Projeto e ProjetoPayload que incluem a interface ProjetoStatus
import type { Projeto, ProjetoPayload } from "../types/projeto"; 

/**
 * Busca a lista de todos os projetos do usuário.
 * O tipo de retorno 'Projeto[]' agora exige que o objeto 'status' esteja incluído na resposta da API.
 */
export const getProjetos = async (): Promise<Projeto[]> => {
    // É crucial que o endpoint API_ENDPOINTS.PROJETOS retorne o objeto 'status' aninhado.
    const res = await axios.get<Projeto[]>(API_ENDPOINTS.PROJETOS);
    return res.data;
};

/**
 * Cria um novo projeto.
 */
export const createProjeto = async (dados: ProjetoPayload): Promise<Projeto> => {
    // O retorno é 'Projeto', exigindo o objeto 'status'.
    const res = await axios.post<Projeto>(API_ENDPOINTS.PROJETOS, dados);
    return res.data;
};

/**
 * Atualiza um projeto existente.
 * * NOTA: Para atualizações, é melhor usar 'Partial<ProjetoPayload>' (ou o tipo de schema de atualização Zod)
 * para permitir o envio de apenas alguns campos. Mantive 'ProjetoPayload' conforme o original,
 * mas adicionei um comentário para sugerir a tipagem parcial.
 * * @param id - ID do projeto a ser atualizado
 * @param dados - Dados do projeto para atualizar
 */
export const updateProjeto = async (id: number, dados: Partial<ProjetoPayload>): Promise<Projeto> => {
    // Usando Partial<ProjetoPayload> para permitir atualizações parciais (melhor prática).
    const res = await axios.put<Projeto>(`${API_ENDPOINTS.PROJETOS}/${id}`, dados);
    return res.data;
};


export const deleteProjeto = async (id: number): Promise<void> => {
    await axios.delete(`${API_ENDPOINTS.PROJETOS}/${id}`);
};

// Exportando todas as funções no default para facilitar import
export default {
    getProjetos,
    createProjeto,
    updateProjeto,
    deleteProjeto,
};