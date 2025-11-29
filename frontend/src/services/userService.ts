import axios from "axios";
import type { User } from "../types/user";
import { API_ENDPOINTS } from "../config/api";

export const getUsers = async (): Promise<User[]> => {
    const res = await axios.get<User[]>(API_ENDPOINTS.USERS);
    return res.data;
};

export const deleteUser = async (id: number): Promise<void> => {
    await axios.delete(`${API_ENDPOINTS.USERS}/${id}`);
};

export const updateUser = async (id: number, dados: User): Promise<User> => {
    const res = await axios.put<User>(`$A{PI_ENDPOINTS.USERS}/${id}`, dados);
    return res.data;
};

export const createUser = async (dados: Omit<User, "id">): Promise<User> => {
    const res = await axios.post<User>(API_ENDPOINTS.USERS, dados);
    return res.data;
};

export default {
    getUsers,
    deleteUser,
    updateUser,
    createUser,
};