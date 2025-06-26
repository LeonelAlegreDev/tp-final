import { Component, ComponentRef, ElementRef, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { MenuComponent } from "../../componentes/menu/menu.component";
import { FireAuthService } from '../../servicios/fire-auth.service';
import { TurnoService } from '../../servicios/turno.service';
import { Turno } from '../../interfaces/turno';
import { CapitalizePipe } from '../../pipes/capitalize.pipe';
import { TiposEspecialistaComboboxComponent } from '../../componentes/tipos-especialista-combobox/tipos-especialista-combobox.component';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [MenuComponent, CapitalizePipe],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.css'
})
export class MisTurnosComponent {
  @ViewChild('especialista') filtroEspecialistaER?: ElementRef;
  @ViewChild('especialidadesVCR', { read: ViewContainerRef }) especialidadesVCR?: ViewContainerRef;
  especialidadesCR?: ComponentRef<TiposEspecialistaComboboxComponent>;
  

  fireAuthService = inject(FireAuthService);
  turnoService = inject(TurnoService);
  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];

  flags = {
    turnosListos: false,
  }
  constructor() {
    this.turnoService.turnos$.subscribe(turnos => {
      this.turnos = turnos.filter(turno => turno.paciente.id === this.fireAuthService.user?.id);
      
      // ordenar los turnos por antiguedad, siendo el turno.fecha un string en formato dd/mm/yyyy
      // y el turno.hora es un numero de 0 a 23
      this.turnos.sort((a, b) => {
        const fechaA = a.fecha.split('/').reverse().join('');
        const fechaB = b.fecha.split('/').reverse().join('');
        if (fechaA === fechaB) {
          return parseInt(a.hora, 10) - parseInt(b.hora, 10);
        }
        return fechaA > fechaB ? 1 : -1;
      });

      this.turnosFiltrados = this.turnos;


      this.flags.turnosListos = true;
      console.log(this.turnos);
    });
  }

  ngAfterViewInit() {
    this.especialidadesCR = this.especialidadesVCR?.createComponent(TiposEspecialistaComboboxComponent);
    this.especialidadesCR!.instance.label = "Filtrar por especialidad:";

    this.especialidadesCR!.instance.loaded?.subscribe(() => {
      console.log('Especialidades cargadas');
    });
    
    this.especialidadesCR!.instance.selected.subscribe((especialidad: string) => {
      console.log('Especialidad seleccionada', especialidad);
      this.FiltrarTurnos(especialidad.toLocaleLowerCase());
    });

    this.especialidadesCR!.instance.disabled.subscribe((disabled: boolean) => {
      if(disabled){
        console.log('Combobox deshabilitado');
        this.CancelarFiltro();
      }
      else {
        console.log('Combobox habilitado');
      }
    });
  }

  FiltrarTurnos(especialidad: string){
    this.turnosFiltrados = this.turnos.filter(turno => turno.especialista.especialidad?.toLowerCase() === especialidad.toLocaleLowerCase());
  }
  CancelarFiltro(){
    this.turnosFiltrados = this.turnos;
  }

  FiltrarEspecialista(){
    console.log("Filtrando especialista");
    const inputNombre = this.filtroEspecialistaER?.nativeElement.querySelector('#filtroNombre');
    const inputApellido = this.filtroEspecialistaER?.nativeElement.querySelector('#filtroApellido');

    console.log("inputNombre", inputNombre);

    const nombre = inputNombre?.value.toLowerCase();
    const apellido = inputApellido?.value.toLowerCase();
    
    console.log("nombre", nombre);
    console.log("apellido", apellido);


    if(nombre !== ''){
      this.turnosFiltrados = this.turnos.filter(turno => {
        const nombreEspecialista = turno.especialista.nombre.toLowerCase();
        return nombreEspecialista.includes(nombre);
      });
    }
    if(apellido !== ''){
      this.turnosFiltrados = this.turnos.filter(turno => {
        const apellidoEspecialista = turno.especialista.apellido.toLowerCase();
        return apellidoEspecialista.startsWith(apellido);
      });
    }
    if(nombre === '' && apellido === ''){
      this.turnosFiltrados = this.turnos;
    }

  }

  GetHora(hora: string){
    // formatear a 00:00 o 23:00
    const horaNumber = parseInt(hora, 10);
    return horaNumber < 10 ? `0${horaNumber}:00` : `${horaNumber}:00`;
  }

  EditarTurno(turno: Turno){
    console.log("Editando turno", turno);
  }

}
