export interface Schedule {
    Lunes: DaySchedule;
    Martes: DaySchedule;
    Miércoles: DaySchedule;
    Jueves: DaySchedule;
    Viernes: DaySchedule;
    Sabado: DaySchedule;
    Domingo: DaySchedule;
    idEspecialista: string;
    especialidad: string;
}
export interface DaySchedule {
    horasDisponible: string[];
}
