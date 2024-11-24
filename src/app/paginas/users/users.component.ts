import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MenuComponent } from '../../componentes/menu/menu.component';
import { EspecialistaService } from '../../servicios/especialista.service';
import { Especialista } from '../../interfaces/especialista';
import { CapitalizePipe } from "../../pipes/capitalize.pipe";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [MenuComponent, CapitalizePipe, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  @ViewChild('modal') modalElementRef?: ElementRef;
  especialistaService = inject(EspecialistaService);
  private formBuilder = inject(FormBuilder);
  especialistas: Especialista[] = [];
  especialistaForm: FormGroup;
  bufferEspecialista?: Especialista;

  constructor() {
    this.especialistaForm = this.formBuilder.group({
      aprobado:['', [Validators.required]]      
    });
  }

  async ngOnInit() {
    const buffer =  new Promise<Especialista[]>((resolve, reject) => {
      this.especialistaService.especialistas$.subscribe({
        next: (especialistas) => {
          resolve(especialistas);
        },
        error: (error) => {
          console.error('Error al obtener especialistas:', error);
          reject(error);
        }
      });
    });

    await buffer.then((especialistas) => {
      this.especialistas = especialistas;
    });
  }

  async ngAfterViewInit() {
    // this.CloseModal();
  }
  

  async EditarEspecialista(especialista?: Especialista) {
    try{
      if(especialista) {
        especialista.aprobed = true;
        await this.especialistaService.Update(especialista.id!, especialista);
      }
      else throw new Error('No hay especialista seleccionado');
    }
    catch (error) {
      console.error('Error al editar el especialista:', error);
    }
  }

  CloseModal() {    
    this.modalElementRef!.nativeElement.parentElement.style.display = 'none';
  }

  OpenModal(especialista?: Especialista) {
    this.bufferEspecialista = especialista;

    this.modalElementRef!.nativeElement.parentElement.style.display = 'flex';
  }

  ActivarEdicion(event: any){
    const element = event.target.parentElement;
    console.log(element);

    element.classList.add('editando');
  }
}
