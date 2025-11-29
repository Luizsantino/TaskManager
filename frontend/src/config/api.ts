// config/api.ts

// Use a URL completa do seu Back-end, que é a porta 3000
const API_URL_ABSOLUTA = 'https://3000-firebase-taskmanager1-1764173036529.cluster-gizzoza7hzhfyxzo5d76y3flkw.cloudworkstations.dev';

export const getApiUrl = (): string => {
    // Para ambientes de desenvolvimento, use a URL absoluta
    if (import.meta.env.DEV) {
        return API_URL_ABSOLUTA;
    }
    // ...
    return ''; // URL relativa para produção
};

export const API_BASE_URL = getApiUrl();
 
// URLs dos endpoints (mantém o prefixo /api)
export const API_ENDPOINTS = {
    // LOGIN: 'https://3000-.../api/login'
    LOGIN: `${API_BASE_URL}/api/login`, 
    // USERS: 'https://3000-.../api/users'
    USERS: `${API_BASE_URL}/api/users`, 
    // ...
};