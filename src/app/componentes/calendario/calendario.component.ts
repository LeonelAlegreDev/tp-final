import { Component, ComponentRef, ElementRef, EventEmitter, Host, HostListener, inject, Input, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { Turno } from '../../interfaces/turno';
import { Fecha } from '../../interfaces/fecha';
import { Hora } from '../../interfaces/hora';
import { TurnoService } from '../../servicios/turno.service';
import { Paciente } from '../../interfaces/paciente';
import { Especialista } from '../../interfaces/especialista';
import { FireAuthService } from '../../servicios/fire-auth.service';
import { BuscadorDePacientesComponent } from '../buscador-de-pacientes/buscador-de-pacientes.component';

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

  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];
  calendario: any[] = [];
  turnoSeleccionado: Turno | null = null;
  fechaSeleccionada: Fecha | null = null;
  horaSeleccionada: Hora | null = null;
  modalActive: boolean = false;

  @Input() cantidadDias: number = 15;
  @Input() cantidadTurnosAleatorios: number = 40;
  @Input() desdeHora: number = 8;
  @Input() hastaHora: number = 19;
  @Input() paciente?: Paciente;
  @Input() especialista?: Especialista;

  @Output() loaded: EventEmitter<void> = new EventEmitter();
  @Output() turnoConfirmado: EventEmitter<Turno> = new EventEmitter();

  constructor() {
    // this.turnos = this.GenerarTurnosAleatorios(this.cantidadTurnosAleatorios);    
    
    this.turnoService.turnos$.subscribe(turnos => {
      this.turnos = turnos;
      this.turnosFiltrados = this.turnos;      
      this.loaded.emit();
    });
  }

  FiltrarTurnos(idEspecialista: string){
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

      const  fechaObj: Fecha = {
        dia: fecha.split('/')[0],
        mes: fecha.split('/')[1],
        anio: fecha.split('/')[2],
        horas: []
      }

      for(let hora = this.desdeHora; hora <= this.hastaHora; hora++) {
        // Verificar si hay un turno en la hora actual
        const turno = turnosDelDia.find(t => parseInt(t.hora) === hora);
        
        // Crear un objeto Hora según el estado del turno
        const horaObj: Hora = {
          hora: hora.toString(),
          estado: turno ? 'reservado' : 'disponible',
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
