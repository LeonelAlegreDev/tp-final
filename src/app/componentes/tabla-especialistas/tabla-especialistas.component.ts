import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { Especialista } from '../../interfaces/especialista';
import { EspecialistaService } from '../../servicios/especialista.service';
import { CapitalizePipe } from "../../pipes/capitalize.pipe";

@Component({
  selector: 'app-tabla-especialistas',
  standalone: true,
  imports: [CapitalizePipe],
  templateUrl: './tabla-especialistas.component.html',
  styleUrl: './tabla-especialistas.component.css'
})
export class TablaEspecialistasComponent {
  @ViewChild("table") tablaER?: ElementRef;
  @Output() loaded: EventEmitter<void> = new EventEmitter<void>();
  @Output() especialistaConfirmado: EventEmitter<Especialista> = new EventEmitter<Especialista>();

  especialistaService = inject(EspecialistaService);
  especialistas: Especialista[] = [];
  especialistasFiltrados: Especialista[] = [];
  especialistaSeleccionado?: Especialista;

  constructor() {
    this.especialistaService.especialistas$.subscribe((especialistas) => {
      this.especialistas = especialistas;
      // this.especialistasFiltrados = especialistas;
      this.loaded.emit();
    });
  }

  FiltrarEspecialistas(especialidad: string) {
    this.especialistasFiltrados = this.especialistas.filter((especialista) => {
      return especialista.especialidad?.toLocaleLowerCase() === especialidad.toLocaleLowerCase();
    });
  }
  SelectEspecialista(especialista: Especialista, $event: Event) {
    const target = $event.target as HTMLElement;
    const row = target.closest("tr");

    this.DesceleccionarRows();
    row?.classList.add("selected");

    this.especialistaSeleccionado = especialista;
  }

  DesceleccionarRows() {
    const rows = this.tablaER?.nativeElement.querySelectorAll("tbody tr");

    rows?.forEach((tr: HTMLElement) => {
      tr.classList.remove("selected");
    });
  }

  Confirmar(){
    if(this.especialistaSeleccionado){
      this.especialistaConfirmado.emit(this.especialistaSeleccionado);
    }
    else {
      console.log("No se ha seleccionado un especialista");
    }

  }
}
