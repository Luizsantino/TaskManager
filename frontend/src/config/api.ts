// config/api.ts

/**
 * Como estamos usando o proxy do Vite, não devemos usar a URL completa
 * A partir de agora, basta usar "/api", que será redirecionado para localhost:3000
 */

export const API_BASE_URL = "/api";

export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/login`,
    USERS: `${API_BASE_URL}/users`,
    // ...
};
