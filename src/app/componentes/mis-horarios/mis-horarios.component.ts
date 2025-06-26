import { Component, ElementRef, HostListener, inject, NgModule, ViewChild } from '@angular/core';
import { FireAuthService } from '../../servicios/fire-auth.service';
import { CapitalizePipe } from '../../pipes/capitalize.pipe';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { TurnoService } from '../../servicios/turno.service';
import { ScheduleService } from '../../servicios/schedule.service';
import { Schedule } from '../../interfaces/schedule';

@Component({
  selector: 'app-mis-horarios',
  standalone: true,
  imports: [CapitalizePipe, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './mis-horarios.component.html',
  styleUrl: './mis-horarios.component.css'
})
export class MisHorariosComponent {
  @ViewChild('horarios') horariosER?: ElementRef;
  @ViewChild('modal') modalER?: ElementRef;
  @ViewChild('disponibilidad') disponibilidadER?: ElementRef;

  // Servicios
  fireAutService = inject(FireAuthService);
  scheduleService = inject(ScheduleService);

  especialidades: any[] = [];
  formulario: FormGroup;
  errorMessage = "";
  modalActive = false;

  schedule!: Schedule;
  schedules: Schedule[] = [];

  horarios: any = [];

  bufferHorario = {
    dia: "",
    hora: "",
    especialidad: "",
    estado: "",
    idEspecialista: ""
  }

  constructor() {
    this.especialidades.push(this.fireAutService.GetEspecialidad());

    this.formulario = new FormGroup({
      especialidad: new FormControl(['']),
    });
  }

  ngOnInit() {
    this.CargarSchedules();
  }

  async CargarSchedules() {
    this.scheduleService.schedule$.subscribe((schedules: Schedule[]) => {
      // obtener los schedules cuyo campo idEspecialista coincida con el id del usuario
      schedules = schedules.filter(schedule => schedule.idEspecialista == this.fireAutService.user?.id);
      this.schedules = schedules;
    });
  }

  async ElegirEspecialidad() {
    // Verificar que se haya elegido una especialidad
    if (this.formulario.get('especialidad')?.value != '') {
      this.errorMessage = "";
      let createSchedule = true;

      // Verifica si el usuario tiene algun schedule
      if (this.schedules.length > 0) {
        console.log("Schedules del usuario", this.schedules);
        // Verificar si el usuario ya tiene un schedule para la especialidad elegida
        for (const schedule of this.schedules) {
          if (schedule.especialidad == this.formulario.get('especialidad')?.value) {
            console.log("Schedule encontrado", schedule);
            this.schedule = schedule;
            createSchedule = false;
            this.MostrarHorarios();
            return;
          }
        }
      }
      if (createSchedule) {
        console.log("No se encontró un schedule para el especialista");
        const schedule: Schedule = {
          Lunes: { horasDisponible: [] },
          Martes: { horasDisponible: [] },
          Miércoles: { horasDisponible: [] },
          Jueves: { horasDisponible: [] },
          Viernes: { horasDisponible: [] },
          Sabado: { horasDisponible: [] },
          Domingo: { horasDisponible: [] },
          idEspecialista: this.fireAutService.user?.id!,
          especialidad: this.formulario.get('especialidad')?.value
        }
        try {
          await this.scheduleService.Create(schedule, this.fireAutService.user?.id!);

          this.MostrarHorarios();
        }
        catch (error) {
          console.error("Error al crear el schedule");
        }
      }
    }
    else this.errorMessage = "Debe elegir una especialidad";
  }

  MostrarHorarios() {
    this.horariosER!.nativeElement.style.display = 'flex';
  }

  ObtenerDisponibilidad(hora: number, dia: string) {
    const numberToHora = hora.toString().length == 1 ? `0${hora}:00` : `${hora}:00`;
    // Verificar si el día existe en el schedule
    if (this.schedule && this.schedule[dia as keyof Schedule]) {
      const daySchedule = this.schedule[dia as keyof Schedule];
      return typeof daySchedule !== 'string' && daySchedule.horasDisponible.includes(numberToHora) ? "Disponible" : "No disponible";
    } else {
      return "No disponible";
    }
  }

  SeleccionarHorario(hora: number, dia: string) {
    const numberToHora = hora.toString().length == 1 ? `0${hora}:00` : `${hora}:00`;
    this.bufferHorario.dia = dia;
    this.bufferHorario.hora = numberToHora;
    this.bufferHorario.especialidad = this.formulario.get('especialidad')?.value;
    this.bufferHorario.estado = this.ObtenerDisponibilidad(hora, dia);
    this.disponibilidadER!.nativeElement.value = this.bufferHorario.estado;
    this.bufferHorario.idEspecialista = this.fireAutService.user?.id!;
    this.MostrarModal();
  }

  MostrarModal() {
    setTimeout(() => {
      this.modalER!.nativeElement.style.display = 'flex';
      this.modalActive = true;
    }, 10);
  }

  CerrarModal() {
    this.modalER!.nativeElement.style.display = 'none';
    this.modalActive = false;
  }

  async ConfirmarHorario() {
    // verifica que la disponibilidad se haya seleccionado
    console.log("Confirmar horario");
    console.log(this.bufferHorario);
    console.log("Disponibilidad seleccionada:", this.disponibilidadER?.nativeElement.value);
    
    // Si la disponibilidad es "No disponible", se debe quitar el horario del schedule
    // Si la disponibilidad es "Disponible", se debe agregar el horario al schedule
    // Si al agregar el horario ya existe en el schedule, no se debe agregar nuevamente y
    // se debe mostrar un mensaje de error
    if (this.disponibilidadER?.nativeElement.value == "No disponible") {
      // Verificar si el horario ya existe en el schedule
      const daySchedule = this.schedule[this.bufferHorario.dia as keyof Schedule];
      if (typeof daySchedule !== 'string' && daySchedule.horasDisponible.includes(this.bufferHorario.hora)) {
        // Eliminar el horario del schedule
        const index = daySchedule.horasDisponible.indexOf(this.bufferHorario.hora);
        if (index > -1) {
          daySchedule.horasDisponible.splice(index, 1);
          console.log("Horario eliminado", this.bufferHorario.hora);

          // Actualizar this.schedule con el nuevo horario
          console.log("this.schedule antes de actualizar:", this.schedule);
        }
      } else {
        console.error("El horario no existe en el schedule");
      }
    } else if (this.disponibilidadER?.nativeElement.value == "Disponible") {
      // Verificar si el horario ya existe en el schedule
      const daySchedule = this.schedule[this.bufferHorario.dia as keyof Schedule];
      if (typeof daySchedule !== 'string' && !daySchedule.horasDisponible.includes(this.bufferHorario.hora)) {
        // Agregar el horario al schedule
        daySchedule.horasDisponible.push(this.bufferHorario.hora);
        console.log("Horario agregado", this.bufferHorario.hora);

        // Actualizar this.schedule con el nuevo horario
        console.log("this.schedule antes de actualizar:", this.schedule);

      } else {
        console.error("El horario ya existe en el schedule");
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const modal = this.modalER?.nativeElement.querySelector('.modal-card');

    if (this.modalER?.nativeElement && !modal.contains(event.target) && this.modalActive) {
      this.CerrarModal();
    }
  }
}
