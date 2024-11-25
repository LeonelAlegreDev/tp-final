import { Component, ComponentRef, ElementRef, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { MenuComponent } from '../../componentes/menu/menu.component';
import { EspecialistaService } from '../../servicios/especialista.service';
import { Especialista } from '../../interfaces/especialista';
import { CapitalizePipe } from "../../pipes/capitalize.pipe";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { stringExistsInArrayValidator } from '../../validators/stringExistsInArray.validator';
import { LoaderComponent } from "../../componentes/loader/loader.component";

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [MenuComponent, CapitalizePipe, ReactiveFormsModule, FormsModule ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  @ViewChild('modal') modalElementRef?: ElementRef;
  @ViewChild('modal', { read: ViewContainerRef }) vcrModal!: ViewContainerRef;
  @ViewChild('vcrTablaEspecialistas', { read: ViewContainerRef }) vcrTablaEspecialistas!: ViewContainerRef;
  @ViewChild('tablaEspecialistas') tEspecialistasElementRef?: ElementRef;
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
    },
    general: {
      noChanges: 'No se han realizado cambios.'
    }
  }
  private loaderCR?: ComponentRef<LoaderComponent>;

  constructor() {
    this.especialistaForm = this.formBuilder.group({
      aprobado:['', [Validators.required, stringExistsInArrayValidator(['true', 'false'])]]      
    });
  }

  async ngOnInit() {
    const buffer =  new Promise<Especialista[]>((resolve, reject) => {
      this.especialistaService.especialistas$.subscribe({
        next: (especialistas) => {
          this.DestroyLoader();
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
    // Crea el loader para la tabla de especialistas
    this.CreateLoader(this.tEspecialistasElementRef!, this.vcrTablaEspecialistas);  
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
        // Valida si no se han realizado cambios
        if(this.bufferEspecialista!.aprobed === this.especialistaForm.get('aprobado')?.value) {
          this.errores.push(this.errorMessages['general']['noChanges']);
          return;
        }
        console.log('Editando especialista');
      
        // Actualiza el especialista
        this.bufferEspecialista!.aprobed = this.especialistaForm.get('aprobado')?.value; 
        
        // Actualiza el especialista en la base de datos
        await this.especialistaService.Update(especialista.id!, especialista);
        this.CreateLoader(this.modalElementRef!, this.vcrModal);

        console.log("Especialista editado correctamente");
        // this.CloseModal();
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

  CreateLoader(contenedor: ElementRef, vcr: ViewContainerRef) {
    console.log('contenedor:', contenedor);
    console.log('contenedor width:', contenedor.nativeElement.offsetWidth);
    console.log('contenedor height:', contenedor.nativeElement.offsetHeight);
    console.log('vcr:', vcr);

    if(this.loaderCR) {
      this.loaderCR.destroy();
    }

    this.loaderCR = vcr.createComponent(LoaderComponent);
    const loader = this.loaderCR.location.nativeElement.querySelector('#loader');

    // Establece el ancho del loader
    loader.style = `width: ${contenedor.nativeElement.offsetWidth }px;`;
    loader.style = `height: ${contenedor.nativeElement.offsetHeight }px;`;
    // Detecta si el tamaño del contenedor cambia
    const observer = new ResizeObserver(() => {
      console.log('Resized');
      loader.style.width = `${contenedor.nativeElement.offsetWidth }px`;
    });

    observer.observe(contenedor.nativeElement);
  }

  DestroyLoader() {
    this.loaderCR?.destroy();
  }
  OcultarElemento(element: HTMLElement) {
    element.style.display = 'none';
  }
}
