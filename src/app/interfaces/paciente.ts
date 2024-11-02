export interface Paciente {
    id?: string;
    nombre: string;
    apellido: string;
    email: string;
    dni: string;
    edad: number;
    obraSocial: string;
    fotoPerfil?: string;
    fotoDni?: string;    
}