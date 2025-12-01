import axios from "axios";
// Assumindo que você tem um arquivo de configuração de endpoints
import { API_ENDPOINTS } from "../config/api"; 
// Importe o tipo User (sem a senha)
import type { User } from "../types/user"; 

// Define o formato da resposta esperada da API, que é o que seu userController retorna:
interface LoginResponse {
    token: string;
    user: User; // O tipo User deve refletir o UserPublic do Back-end (sem senhaHash)
}

/**
 * Realiza o login, armazena o token de autenticação e configura o Axios.
 * @param email - O email do usuário.
 * @param senha - A senha do usuário.
 * @returns Os dados do usuário logado (sem a senha).
 */
export const login = async (email: string, senha: string): Promise<User> => {
    try {
      // Chama o endpoint de login com as credenciais
      const response = await axios.post<LoginResponse>(API_ENDPOINTS.LOGIN, {
        email,
        senha,
      });
  
      const { token, user } = response.data;
  
      // 1. Armazenar o token para manter a sessão após recarregar a página
      localStorage.setItem("authToken", token);
  
      // 2. Configurar o cabeçalho de autenticação para TODAS as chamadas futuras
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  
      return user;
  
    } catch (error) {
      // Log detalhado para debugging
      if (axios.isAxiosError(error)) {
        console.error(
          "Erro detalhado no login:",
          error.response?.data || error.message
        );
      }
  
      // Trata erros comuns (credenciais inválidas)
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error("E-mail ou senha inválidos. Tente novamente.");
      }
  
      // Se vier outro tipo de erro, relança para o componente tratar
      throw error;
    }
  };

// Adicione esta função para facilitar o Logoff
export const logout = () => {
    // 1. Remove o token armazenado
    localStorage.removeItem("authToken");
    // 2. Remove o cabeçalho de autenticação do Axios
    delete axios.defaults.headers.common["Authorization"];
};