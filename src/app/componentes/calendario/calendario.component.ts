import { Component, ComponentRef, ElementRef, EventEmitter, Host, HostListener, inject, Input, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { Turno } from '../../interfaces/turno';
import { Fecha } from '../../interfaces/fecha';
import { Hora } from '../../interfaces/hora';
import { TurnoService } from '../../servicios/turno.service';
import { Paciente } from '../../interfaces/paciente';
import { Especialista } from '../../interfaces/especialista';
import { FireAuthService } from '../../servicios/fire-auth.service';
import { BuscadorDePacientesComponent } from '../buscador-de-pacientes/buscador-de-pacientes.component';
import { ScheduleService } from '../../servicios/schedule.service';
import { DaySchedule, Schedule } from '../../interfaces/schedule';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [],
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.css'
})
export class CalendarioComponent {
  @ViewChild('modalConfirmacion') modalConfirmacion?: ElementRef;
  @ViewChild('calendarioVCR', {read: ViewContainerRef}) calendarioVCR?: ViewContainerRef;
  buscadorDePacientesCR?: ComponentRef<BuscadorDePacientesComponent>;

  private turnoService = inject(TurnoService);
  private fireAuthService = inject(FireAuthService);
  
  private scheduleService = inject(ScheduleService);
  schedulList: Schedule[] = [];
  schedule?: Schedule;

  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];
  calendario: any[] = [];
  turnoSeleccionado: Turno | null = null;
  fechaSeleccionada: Fecha | null = null;
  horaSeleccionada: Hora | null = null;
  modalActive: boolean = false;

  @Input() cantidadDias: number = 15;
  @Input() cantidadTurnosAleatorios: number = 40;
  @Input() desdeHora: number = 0;
  @Input() hastaHora: number = 23;
  @Input() paciente?: Paciente;
  @Input() especialista?: Especialista;

  @Output() schedulesLoaded: EventEmitter<void> = new EventEmitter();
  @Output() turnoConfirmado: EventEmitter<Turno> = new EventEmitter();

  loadFlags = {
    scheduleList: false,
    turnos: false
  }
  loadFlagsSubject = new EventEmitter<any>();

  ngOnInit() {
    this.loadFlagsSubject.subscribe(flags => {
      if (flags.scheduleList && flags.turnos) {
        this.schedulesLoaded.emit();
      }
    });
  }

  ngAfterViewInit() {
  }

  private updateLoadFlags(flag: keyof typeof this.loadFlags, value: boolean) {
    this.loadFlags[flag] = value;
    if(this.loadFlags.scheduleList && this.loadFlags.turnos) {
      this.loadFlagsSubject.emit(this.loadFlags);
    }
  }
  constructor() {
    this.turnoService.turnos$.subscribe(turnos => {
      this.turnos = turnos;
      this.updateLoadFlags('turnos', true);
    });
    this.CargarSchedules();
  }

  CargarSchedules(){
    this.scheduleService.schedule$.subscribe(schedules => {
      // filtrar por especialista
      this.schedulList = schedules.filter(s => s.idEspecialista === this.especialista?.id && s.especialidad === this.especialista?.especialidad);
      this.schedule = this.schedulList[0];
      console.log("Schedules del especialista:", this.schedulList);
      this.updateLoadFlags('scheduleList', true);
    });
  }

  FiltrarTurnos(idEspecialista: string){
    // obtiene los filtros de los turnos
    this.turnosFiltrados = this.turnos.filter(t => t.especialista?.id === idEspecialista);
  }

  GenerarCalendario() {
    this.calendario = [];
    this.turnoSeleccionado = null;
    let fechaActual = new Date();
    let dateBuffer = fechaActual;

    for (let i = 0; i < this.cantidadDias; i++) {
      const fecha = dateBuffer.toLocaleDateString('es-AR');
      const turnosDelDia = this.turnosFiltrados.filter(t => t.fecha === fecha);
      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const diaSemanaIndex = dateBuffer.getDay();
      const diaABuscar = diasSemana[diaSemanaIndex];

      const  fechaObj: Fecha = {
        dia: fecha.split('/')[0],
        mes: fecha.split('/')[1],
        anio: fecha.split('/')[2],
        horas: []
      }

      for(let hora = this.desdeHora; hora <= this.hastaHora; hora++) {
        // Verificar si hay un turno en la hora actual
        const turno = turnosDelDia.find(t => parseInt(t.hora) === hora);
        // hora string debe tener el formato 00:00 o 23:00 siendo hora un entero del 0 al 23
        const horaString = hora < 10 ? `0${hora}:00` : `${hora}:00`;
        const diaSchedule = this.schedule?.[diaABuscar as keyof Schedule] as DaySchedule;
        const horarioDisponible = diaSchedule?.horasDisponible.includes(horaString);
        console.log("Buscando en el schedule:", diaABuscar, horaString);

        let estado = "reservado";
        console.log("Horario disponible:", horarioDisponible);
        console.log("Turno encontrado:", turno);
        if(!turno && horarioDisponible) estado = "disponible";

        // Crear un objeto Hora según el estado del turno
        const horaObj: Hora = {
          hora: hora.toString(),
          estado: estado,
          turno: turno ? turno : null
        };

        fechaObj.horas.push(horaObj);
      }

      this.calendario.push(fechaObj);
      dateBuffer.setDate(dateBuffer.getDate() + 1);
    }    
  }

  SeleccionarHorario(hora: Hora, fecha: Fecha, estado: string) {
    if(estado !== 'disponible') return;

    if(this.especialista) {      
      if(this.paciente) {
        const turno: Turno = {
          fecha: `${fecha.dia}/${fecha.mes}/${fecha.anio}`,
          hora: hora.hora,
          especialista: this.especialista,
          paciente: this.paciente,
          estado: 'pendiente'
        }
        this.turnoSeleccionado = turno;

        console.log("turno seleccionado:", turno);
        this.AbrirModalConfirmacion();
      }
      else {
        if(this.fireAuthService.user && this.fireAuthService.IsAdmin()) {
          this.fechaSeleccionada = fecha;
          this.horaSeleccionada = hora;
          this.CrearBuscadorDePacientes();
        }
      }
    }
    else{
      console.error("No se ha especificado especialista");
    }
  }
  
  ConfirmarTurno() {
    try{
      this.turnoService.Create(this.turnoSeleccionado as Turno);
      console.log("Turno agendado en la base de datos:", this.turnoSeleccionado);
      this.CerrarModalConfirmacion();
    }
    catch(error){
      console.error("Error al confirmar turno:", error);
    }
  }

  AbrirModalConfirmacion() {    
    if(this.modalConfirmacion) {
      setTimeout(() => {
        this.modalActive = true;
        this.modalConfirmacion?.nativeElement.parentElement.classList.remove('hidden');
      }, 10);
    }
  }

  CerrarModalConfirmacion() {
    if(this.modalConfirmacion) {
      this.modalConfirmacion.nativeElement.parentElement.classList.add('hidden');
    }

    if(this.fireAuthService.user && this.fireAuthService.IsAdmin()) {
      this.paciente = undefined;
    }
  }

  CrearBuscadorDePacientes() {
    if(this.buscadorDePacientesCR){
      this.buscadorDePacientesCR.destroy();
    }
    this.buscadorDePacientesCR = this.calendarioVCR?.createComponent(BuscadorDePacientesComponent);

    this.buscadorDePacientesCR?.instance.cancelar.subscribe(() => {
      this.buscadorDePacientesCR?.destroy();
    });

    this.buscadorDePacientesCR?.instance.pacienteConfirmado.subscribe((paciente: Paciente) => {
      this.paciente = paciente;
      this.buscadorDePacientesCR?.destroy();

      if(this.fechaSeleccionada && this.horaSeleccionada && this.especialista) {
        const turno: Turno = {
          fecha: `${this.fechaSeleccionada.dia}/${this.fechaSeleccionada.mes}/${this.fechaSeleccionada.anio}`,
          hora: this.horaSeleccionada.hora,
          especialista: this.especialista,
          paciente: this.paciente,
          estado: 'pendiente'
        }
        this.turnoSeleccionado = turno;
        console.log("turno seleccionado:", turno);
        this.AbrirModalConfirmacion();

      }
    });
  }

  // Crear Host Event Listener para cerrar el modal al hacer click fuera de this.modalConfirmacion
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.modalActive && this.modalConfirmacion && !this.modalConfirmacion.nativeElement.contains(event.target)) {
      console.log("click fuera del modal");          
      this.CerrarModalConfirmacion();
    }
  }

}
