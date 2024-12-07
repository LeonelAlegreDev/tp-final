import { Turno } from "./turno";

export interface Hora{
    hora: string;
    estado: string;
    turno: Turno | null;
}