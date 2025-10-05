export interface ContactoEmergencia {
  id?: number;
  nombreCompleto: string;
  relacion: 'Padre' | 'Madre' | 'Tutor' | 'Abuelo/a' | 'Tío/a' | 'Hermano/a' | 'Otro';
  telefono: string;
}

export interface Miembro {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  tipoDocumento: 'CC' | 'TI' | 'RC' | 'CE' | 'PA' | 'PEP' | 'PPT' | 'NIT' | 'NUIP';
  identification: string;
  genero: 'Masculino' | 'Femenino' | 'Otro';
  fechaNacimiento: string;
  telefono: string;
  direccion: string;
  rol?: string;
  fechaAceptacion: string;
  isActive: boolean;
  peso?: string;
  altura?: string;
  hobbies?: string;
  deportes?: string;
  instrumentos?: string;
  contactosEmergencia: ContactoEmergencia[];
  createdAt: string;
  city: string;
  rama: string;
  edad?: number;
}

export interface MiembroFormData {
  firstName: string;
  lastName: string;
  email: string;
  tipoDocumento: 'CC' | 'TI' | 'RC' | 'CE' | 'PA' | 'PEP' | 'PPT' | 'NIT' | 'NUIP';
  identification: string;
  genero: 'Masculino' | 'Femenino' | 'Otro';
  fechaNacimiento: string;
  telefono: string;
  direccion: string;
  rol?: string;
  fechaAceptacion: string;
  isActive: boolean;
  peso?: string;
  altura?: string;
  hobbies?: string;
  deportes?: string;
  instrumentos?: string;
  contactosEmergencia: ContactoEmergencia[];
}