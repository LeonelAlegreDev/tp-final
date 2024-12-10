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
interface DaySchedule {
    horasDisponible: string[];
}
