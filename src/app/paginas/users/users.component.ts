import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MenuComponent } from '../../componentes/menu/menu.component';
import { EspecialistaService } from '../../servicios/especialista.service';
import { Especialista } from '../../interfaces/especialista';
import { CapitalizePipe } from "../../pipes/capitalize.pipe";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { stringExistsInArrayValidator } from '../../validators/stringExistsInArray.validator';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [MenuComponent, CapitalizePipe, ReactiveFormsModule, FormsModule ],
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
  errores: string[] = [];
  errorMessages: { [key: string]: { [key: string]: string } } = {
    aprobado: {
      required: 'El campo aprobado es requerido.',
      stringExistsInArray: 'El campo aprobado es invalido. Valores validos: "true" o "false".'
    }
  }

  constructor() {
    this.especialistaForm = this.formBuilder.group({
      aprobado:['', [Validators.required, stringExistsInArrayValidator(['true', 'false'])]]      
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
    this.CloseModal();
  }
  

  async EditarEspecialista(especialista?: Especialista) {
    // valida si el formulario es invalido
    if(this.especialistaForm.invalid) {
      console.log("Formulario invalido");

      this.errores = [];
      // Recorre los controles del formulario y obtiene los errores
      for(const control in this.especialistaForm.controls) {
        if(this.especialistaForm.controls.hasOwnProperty(control)) {
          let error = this.GetErrorMessage(control);
          if(error) {
            this.errores.push(error);
          }
        }
      }
      return;
    }

    try{
      if(especialista) {
        this.errores = [];
        this.bufferEspecialista!.aprobed = this.especialistaForm.get('aprobado')?.value; 
        console.log('Editando especialista');
        
        await this.especialistaService.Update(especialista.id!, especialista);
        console.log("Especialista editado correctamente");
        this.CloseModal();
      }
      else throw new Error('No hay especialista seleccionado');
    }
    catch (error) {
      console.error('Error al editar el especialista:', error);
    }
  }

  CloseModal() {    
    this.modalElementRef!.nativeElement.parentElement.style.display = 'none';
    const rows = this.modalElementRef!.nativeElement.querySelectorAll('.editando');
    const inputs = this.modalElementRef!.nativeElement.querySelectorAll('.modal-value');

    // Remueve la clase 'editando' de todas las filas
    rows.forEach((row: HTMLElement) => {
      row.classList.remove('editando');
    });

    // Agrega el atributo 'readonly' a todos los inputs
    inputs.forEach((input: HTMLElement) => {
      input.setAttribute('readonly', '');
    });

    this.errores = [];
  }

  OpenModal(especialista?: Especialista) {
    this.bufferEspecialista = especialista;
    this.modalElementRef!.nativeElement.parentElement.style.display = 'flex';

    this.especialistaForm.patchValue({
      aprobado: especialista?.aprobed
    });
  }

  ToggleEdicion(event: any){
    let row = (event.target as HTMLElement).closest('.row');
    let input = (event.target as HTMLElement).closest('.row')?.querySelector('.modal-value') as HTMLElement;

    if(row!.classList.contains('editando')) {
      row!.classList.remove('editando');
      input!.setAttribute('readonly', '');
    }
    else {
      row!.classList.add('editando');
      input!.removeAttribute('readonly');
    }
  }

  GetErrorMessage(control: string): string {
    const formControl = this.especialistaForm.get(control);

    if(formControl && formControl.errors){
      for(const error in formControl.errors) {
        if(formControl.errors.hasOwnProperty(error)){
          return this.errorMessages[control][error];
        }
      }
    }
    return '';
  }


}
