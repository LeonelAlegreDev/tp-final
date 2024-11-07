import { NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @Output() loaded = new EventEmitter<void>();

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
}
