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
  formulario :FormGroup;
  errorMessage = "";
  modalActive = false;

  // schedule: { [key: string]: { horasDisponible: string[] } } = {
  //   Lunes: {
  //     horasDisponible: ['08:00', '00:00'] as string[] ,

  //   },
  //   Martes: {
  //     horasDisponible: [] as string[],

  //   },
  //   Miércoles: {
  //     horasDisponible: [] as string[],

  //   },
  //   Jueves: {
  //     horasDisponible: [] as string[],

  //   },
  //   Viernes: {
  //     horasDisponible: [] as string[],

  //   },
  //   sabado: {
  //     horasDisponible: [] as string[],

  //   },
  //   Domingo: {
  //     horasDisponible: [] as string[],

  //   }
  // };

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

  async CargarSchedules(){
    this.scheduleService.schedule$.subscribe((schedules: Schedule[]) => {
      // obtener los schedules cuyo campo idEspecialista coincida con el id del usuario
      schedules = schedules.filter(schedule => schedule.idEspecialista == this.fireAutService.user?.id);
      this.schedules = schedules;
    });
  }

  // async CargarSchedule(){
  //   this.scheduleService.schedule$.subscribe((schedules: Schedule[]) => {
  //     for(const schedule of schedules){
  //       // Verificar si el schedule pertenece al especialista
  //       if(schedule.idEspecialista == this.fireAutService.user?.id){
  //         console.log("schedule encontrado", schedule);
  //         this.schedule = schedule;
  //         return;
  //       }
  //     }
  //   });
  // }

  async ElegirEspecialidad() {
    // Verificar que se haya elegido una especialidad
    if(this.formulario.get('especialidad')?.value != '') {
      this.errorMessage = "";
      let createSchedule = true;

      // Verifica si el usuario tiene algun schedule
      if(this.schedules.length > 0){
        console.log("Schedules del usuario", this.schedules);
        // Verificar si el usuario ya tiene un schedule para la especialidad elegida
        for(const schedule of this.schedules){
          if(schedule.especialidad == this.formulario.get('especialidad')?.value){
            console.log("Schedule encontrado", schedule);
            this.schedule = schedule;
            createSchedule = false;
            this.MostrarHorarios();
            return;
          }
        }
      }
      if(createSchedule){
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
        try{
          await this.scheduleService.Create(schedule, this.fireAutService.user?.id!);

          this.MostrarHorarios();
        }
        catch(error){
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

  MostrarModal(){
    setTimeout(() => {
      this.modalER!.nativeElement.style.display = 'flex';
      this.modalActive = true;
    }, 10);
  }

  CerrarModal(){
    this.modalER!.nativeElement.style.display = 'none';
    this.modalActive = false;
  }

  async ConfirmarHorario() {
    // verifica que la disponibilidad se haya seleccionado

    if(this.disponibilidadER?.nativeElement.value !== ''){
      console.log("Confirmar horario");
      console.log(this.bufferHorario);
      // insertar los datos en this.schedule
      if (this.schedule) {
        const daySchedule = this.schedule[this.bufferHorario.dia as keyof Schedule];
        if (typeof daySchedule !== 'string') {
          daySchedule.horasDisponible.push(this.bufferHorario.hora);
          console.log("daySchedule actualizado", daySchedule);
        }

        try {
          await this.scheduleService.Update(this.schedule, this.schedule.idEspecialista);
          console.log("Schedule actualizado en Firestore");
          this.CerrarModal();
        } catch (error) {
          console.error("Error al actualizar el schedule en Firestore", error);
        }
      }
    }
    else{
      console.log("Debe seleccionar una disponibilidad");
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
