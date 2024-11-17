import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @Output() loaded = new EventEmitter<void>();
  @Output() continue = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  type: string;
  title: string;
  message: string;
  btnText: string;

  constructor() { 
    this.type = 'success';
    this.title = 'Exito';
    this.message = 'Operación realizada con éxito';
    this.btnText = 'Continuar';
  }

  ngAfterViewInit() {
    this.loaded.emit();
  }

  Continue() {
    console.log("Boton continuar presionado");
    this.continue.emit();
  }

  Close() {
    console.log("Boton cerrar presionado");
    this.close.emit();
  }
}
