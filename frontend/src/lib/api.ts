import { ENDPOINTS } from './conf';

// Función para obtener el token de autorización (cuando esté disponible)
const getAuthToken = (): string | null => {
    // Aquí puedes implementar la lógica para obtener el token
    // Por ejemplo: return localStorage.getItem('authToken');
    return null;
};

// Función helper para construir headers con autorización
const getHeaders = (additionalHeaders?: Record<string, string>): HeadersInit => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...additionalHeaders,
    };
    
    const token = getAuthToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
};

// Función para manejar la respuesta
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    // Verificar si hay contenido para parsear
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    
    return response.text();
};

// Cliente API principal
export const apiClient = {
    // Método POST
    post: async (endpoint: string = '', data: any, customHeaders?: Record<string, string>) => {
        const url = `${ENDPOINTS.acudiente}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(customHeaders),
            body: JSON.stringify(data),
        });
        
        return handleResponse(response);
    },

    // Método GET
    get: async (endpoint: string = '', customHeaders?: Record<string, string>) => {
        const url = `${ENDPOINTS.acudiente}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders(customHeaders),
        });
        
        return handleResponse(response);
    },

    // Método PUT
    put: async (endpoint: string = '', data: any, customHeaders?: Record<string, string>) => {
        const url = `${ENDPOINTS.acudiente}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: getHeaders(customHeaders),
            body: JSON.stringify(data),
        });
        
        return handleResponse(response);
    },

    // Método PATCH
    patch: async (endpoint: string = '', data: any, customHeaders?: Record<string, string>) => {
        const url = `${ENDPOINTS.acudiente}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'PATCH',
            headers: getHeaders(customHeaders),
            body: JSON.stringify(data),
        });
        
        return handleResponse(response);
    },

    // Método DELETE
    delete: async (endpoint: string = '', customHeaders?: Record<string, string>) => {
        const url = `${ENDPOINTS.acudiente}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: getHeaders(customHeaders),
        });
        
        return handleResponse(response);
    },
};

// Cliente genérico para otros endpoints
export const createApiClient = (baseURL: string) => ({
    post: async (endpoint: string = '', data: any, customHeaders?: Record<string, string>) => {
        const url = `${baseURL}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: getHeaders(customHeaders),
            body: JSON.stringify(data),
        });
        
        return handleResponse(response);
    },

    get: async (endpoint: string = '', customHeaders?: Record<string, string>) => {
        const url = `${baseURL}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders(customHeaders),
        });
        
        return handleResponse(response);
    },

    put: async (endpoint: string = '', data: any, customHeaders?: Record<string, string>) => {
        const url = `${baseURL}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: getHeaders(customHeaders),
            body: JSON.stringify(data),
        });
        
        return handleResponse(response);
    },

    delete: async (endpoint: string = '', customHeaders?: Record<string, string>) => {
        const url = `${baseURL}${endpoint}`;
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: getHeaders(customHeaders),
        });
        
        return handleResponse(response);
    },
});

// Cliente específico para autenticación
export const authClient = createApiClient(ENDPOINTS.auth);
