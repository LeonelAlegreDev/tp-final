export interface Especialista {
    id?: string;
    nombre: string;
    apellido: string;
    email: string;
    dni: string;
    edad: number;
    especialidad?: string;
    fotoPerfil?: string;
    aprobed: boolean;
}