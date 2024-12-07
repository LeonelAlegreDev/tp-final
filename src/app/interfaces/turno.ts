import { Especialista } from "./especialista";
import { Paciente } from "./paciente";

export interface Turno {
    especialista: Especialista;
    paciente: Paciente;
    fecha: string;
    hora: string;
    estado: string;
}
