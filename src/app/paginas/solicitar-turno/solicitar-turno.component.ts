import { Component, ComponentRef, ElementRef, HostListener, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { MenuComponent } from "../../componentes/menu/menu.component";
import { Turno } from '../../interfaces/turno';
import { Hora } from '../../interfaces/hora';
import { Fecha } from '../../interfaces/fecha';
import { CalendarioComponent } from '../../componentes/calendario/calendario.component';
import { EspecialistaService } from '../../servicios/especialista.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CapitalizePipe } from '../../pipes/capitalize.pipe';
import { TiposEspecialistaComboboxComponent } from '../../componentes/tipos-especialista-combobox/tipos-especialista-combobox.component';
import { Especialista } from '../../interfaces/especialista';
import { TablaEspecialistasComponent } from '../../componentes/tabla-especialistas/tabla-especialistas.component';
import { FireAuthService } from '../../servicios/fire-auth.service';
import { Paciente } from '../../interfaces/paciente';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [MenuComponent, ReactiveFormsModule],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css'
})
export class SolicitarTurnoComponent {
  @ViewChild('calendario', { read: ViewContainerRef }) calendarioVCR!: ViewContainerRef;
  private calendarioCR?: ComponentRef<CalendarioComponent>;

  @ViewChild('comboboxVCR', { read: ViewContainerRef }) comboboxVCR!: ViewContainerRef;
  private comboboxCR?: ComponentRef<TiposEspecialistaComboboxComponent>;

  @ViewChild('especialistasVCR', { read: ViewContainerRef }) especialistasVCR!: ViewContainerRef;
  private especialistasCR?: ComponentRef<TablaEspecialistasComponent>;

  private authService = inject(FireAuthService);

  ngAfterViewInit() {
    this.CreateCombobox();
  }

  CreateCombobox() {
    if(this.comboboxCR) {
      this.comboboxCR?.destroy();
    }

    this.comboboxCR = this.comboboxVCR?.createComponent(TiposEspecialistaComboboxComponent);
    
    this.comboboxCR.instance.selected?.subscribe((tipo: string) => {
      if(this.calendarioCR){
        this.calendarioCR?.destroy();
      }
      this.CreateEspecialistas(tipo);
    });
  }

  CreateEspecialistas(tipo: string) {
    if(this.especialistasCR) {
      this.especialistasCR?.destroy();
    }

    this.especialistasCR = this.especialistasVCR?.createComponent(TablaEspecialistasComponent);

    this.especialistasCR.instance.loaded.subscribe(() => {
      this.especialistasCR?.instance.FiltrarEspecialistas(tipo);
    });

    this.especialistasCR.instance.especialistaConfirmado.subscribe((especialista: Especialista) => {
      this.CreateCalendario(especialista);
    });
  }

  CreateCalendario(especialista: Especialista) {
    if(this.calendarioCR) {
      this.calendarioCR?.destroy();
    }

    this.calendarioCR = this.calendarioVCR?.createComponent(CalendarioComponent);
    this.calendarioCR.instance.especialista = especialista;

    if(this.authService.user && this.authService.IsPaciente()) {
      this.calendarioCR.instance.paciente = this.authService.user as Paciente;
    }

    this.calendarioCR.instance.loaded.subscribe(() => {
      this.calendarioCR?.instance.FiltrarTurnos(especialista.id as string);
      this.calendarioCR?.instance.GenerarCalendario();
    });
  }
}
