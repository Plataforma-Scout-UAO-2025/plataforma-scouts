import api from "./axios";
import type { MedicalApi, MedicalDB } from '@/types/medical-form.type';

interface ApiResponse {
    content: MedicalDB[];
}

// Crear un nuevo registro médico
export const createMedicalRecordApi = async (id: number, data: MedicalApi, tenantId: string) => {
    const response = await api.post(
        `/medical_record/create_record/${id}`,
        data,
        {
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-Id': tenantId
            },
        }
    );

    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error del servidor: ${response.status}`);
    }
};

// Obtener registros médicos por tenant
export const getMedicalRecordsByTenantApi = async (tenantId: string) => {
    const response = await api.get<ApiResponse>('/medical_record/list_by_tenant', 
        {
            headers: {
                'X-Tenant-Id': tenantId
            },
            params: {
                page: 0,
                size: 50
            }
        }
    );

    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error del servidor: ${response.status}`);
    }
};

// Obtener un registro médico individual por id de miembro
export const getMedicalRecordApi = async (id: number, tenantId: string) => {
    const response = await api.get<MedicalDB>(`/medical_record/list_record/${id}`, 
    {
        headers: {
            'X-Tenant-Id': tenantId
        }
    });

    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error del servidor: ${response.status}`);
    }
};

// Actualizar un registro médico
export const updateMedicalRecordApi = async (id: number, data: MedicalApi, tenantId: string) => {
    const response = await api.put(
        `/medical_record/update_record/${id}`,
        data,
        {
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-Id': tenantId
            },
        }
    );

    if (response.status === 200) {
    return response.data;
    } else {
    throw new Error(`Error del servidor: ${response.status}`);
    }
};
