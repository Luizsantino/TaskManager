import axios from "axios";
import type { User } from "../types/user";
import { API_ENDPOINTS } from "../config/api";

export const login = async (email: string, senha: string): Promise<User> => {
  const response = await axios.post<User>(API_ENDPOINTS.LOGIN, {
    email,
    senha,
  });
  return response.data;
};