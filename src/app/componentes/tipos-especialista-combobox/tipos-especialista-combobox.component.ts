import { Component, ElementRef, EventEmitter, HostListener, inject, Output, ViewChild } from '@angular/core';
import { CapitalizePipe } from '../../pipes/capitalize.pipe';
import { EspecialistaService } from '../../servicios/especialista.service';

@Component({
  selector: 'app-tipos-especialista-combobox',
  standalone: true,
  imports: [CapitalizePipe],
  templateUrl: './tipos-especialista-combobox.component.html',
  styleUrl: './tipos-especialista-combobox.component.css'
})
export class TiposEspecialistaComboboxComponent {
  @ViewChild('combobox') comboboxER?: ElementRef;
  @Output() loaded?: EventEmitter<boolean>;
  @Output() selected: EventEmitter<string> = new EventEmitter<string>();

  especialistaService = inject(EspecialistaService);
  tipoEspecialistas: any = [];
  tipoEspFiltrada: any = [];
  errorMessage: string = '';
  constructor() {
    this.especialistaService.tipoEspecialista$.subscribe(tipoEspecialistas => {
      this.tipoEspecialistas = tipoEspecialistas;
      this.tipoEspFiltrada = this.tipoEspecialistas;
      this.loaded?.emit(true);
    });
  }

  FiltrarEspecialidades(event: Event) {
    const input = event.target as HTMLInputElement;
    const valor = input.value.toLowerCase();

    this.tipoEspFiltrada = this.tipoEspecialistas.filter((especialidad: any) =>
      especialidad.nombre.toLowerCase().includes(valor)
    );
  }

  SelectTipo(tipo: string){
    const input = this.comboboxER?.nativeElement.querySelector('input');
    const capitalizePipe = new CapitalizePipe();
    input.value = capitalizePipe.transform(tipo);
  }

  Confirmar() {
    const input = this.comboboxER?.nativeElement.querySelector('input');
    const valor = input.value;

    if(valor !== '') {
      // Busca el tipo de especialista que coincida con el valor ingresado
      const tipo = this.tipoEspecialistas.find((tipo: any) => tipo.nombre.toLowerCase() === valor.toLowerCase());

      if(tipo) {
        this.selected?.emit(tipo.nombre);
        this.errorMessage = '';
      }
      else this.errorMessage = 'Tipo de especialista no valido';
    }
    else this.errorMessage = 'Debe seleccionar un tipo de especialista';
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const input = this.comboboxER?.nativeElement.querySelector('input');
    const label = this.comboboxER?.nativeElement.querySelector('label');
    const box = this.comboboxER?.nativeElement.querySelector('.box');

    if(event.target !== input && event.target !== label) {
      box?.classList.add('hidden');
    }
    else {
      box?.classList.remove('hidden');
    }
  }
}
