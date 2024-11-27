import { Component, ComponentRef, ElementRef, HostListener, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { MenuComponent } from '../../componentes/menu/menu.component';
import { EspecialistaService } from '../../servicios/especialista.service';
import { Especialista } from '../../interfaces/especialista';
import { CapitalizePipe } from "../../pipes/capitalize.pipe";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { stringExistsInArrayValidator } from '../../validators/stringExistsInArray.validator';
import { LoaderComponent } from "../../componentes/loader/loader.component";
import { Paciente } from '../../interfaces/paciente';
import { PacienteService } from '../../servicios/paciente.service';
import { RegistroEspecialistaComponent } from '../../componentes/registro-especialista/registro-especialista.component';
import { ModalComponent } from '../../componentes/modal/modal.component';
import { FormularioRegistroComponent } from '../../componentes/formulario-registro/formulario-registro.component';
import { Admin } from '../../interfaces/admin';
import { AdminService } from '../../servicios/admin.service';
import { RegistroAdminComponent } from '../../componentes/registro-admin/registro-admin.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [MenuComponent, CapitalizePipe, ReactiveFormsModule, FormsModule ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  // ViewContainerRef para crear componentes dinamicos
  @ViewChild('vcrTablaEspecialistas', { read: ViewContainerRef }) vcrTablaEspecialistas!: ViewContainerRef;
  @ViewChild('vcrTablaPacientes', { read: ViewContainerRef }) vcrTablaPacientes!: ViewContainerRef;
  @ViewChild('vcrRegistro', { read: ViewContainerRef }) vcrRegistro!: ViewContainerRef;
  // Referencias a elementos del DOM
  @ViewChild('modal') modalElementRef?: ElementRef;
  @ViewChild('tablaEspecialistas') tEspecialistasElementRef?: ElementRef;
  @ViewChild('tablaPacientes') tPacientesElementRef?: ElementRef
  @ViewChild('modalFoto') modalFotoElementRef?: ElementRef;
  @ViewChild('formRegistro') formRegistroElementRef?: ElementRef;
  @ViewChild('formRegistroEspecialista') formRegistroEspecialistaElementRef?: ElementRef;

  // Componentes dinamicos
  private formRegistroEspecialistaCR?: ComponentRef<RegistroEspecialistaComponent>;
  private formRegistroPacienteCR?: ComponentRef<FormularioRegistroComponent>;
  private formRegistroAdminCR?: ComponentRef<RegistroAdminComponent>;
  private loaderCR?: ComponentRef<LoaderComponent>;
  private loaderPacientesCR?: ComponentRef<LoaderComponent>;
  private modalCR?: ComponentRef<ModalComponent>;
  // Inyeccion de servicios
  private formBuilder = inject(FormBuilder);
  especialistaService = inject(EspecialistaService);
  pacienteService = inject(PacienteService);
  adminService = inject(AdminService);
  // Variabeles
  especialistas: Especialista[] = [];
  pacientes: Paciente[] = [];
  admins: Admin[] = [];
  especialistaForm: FormGroup;
  bufferEspecialista?: Especialista;
  bufferPaciente?: Paciente;
  bufferRegistro?: Paciente | Especialista | Admin;
  tipoRegistro?: string;
  modalFotoActive = false;
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



  constructor() {
    this.especialistaForm = this.formBuilder.group({
      aprobado:['', [Validators.required, stringExistsInArrayValidator(['true', 'false'])]]      
    });
  }

  async ngOnInit() {
    const bufferEspecialistas =  new Promise<Especialista[]>((resolve, reject) => {
      this.especialistaService.especialistas$.subscribe({
        next: (especialistas) => {
          this.DestroyLoader(this.loaderCR);
          resolve(especialistas);
        },
        error: (error) => {
          console.error('Error al obtener especialistas:', error);
          reject(error);
        }
      });
    });
    await bufferEspecialistas.then((especialistas) => {
      this.especialistas = especialistas;
    });

    const bufferPacientes = new Promise<Paciente[]>((resolve, reject) => {
      this.pacienteService.pacientes$.subscribe({
        next: (pacientes) => {
          this.DestroyLoader(this.loaderPacientesCR);
          resolve(pacientes);
        },
        error: (error) => {
          console.error('Error al obtener pacientes:', error);
          reject(error);
        }
      });
    });
    await bufferPacientes.then((pacientes) => {
      this.pacientes = pacientes;
    });

    const bufferAdmins = new Promise<Admin[]>((resolve, reject) => {
      this.adminService.admins$.subscribe({
        next: (admins) => {
          resolve(admins);
        },
        error: (error) => {
          console.error('Error al obtener admins:', error);
          reject(error);
        }
      });
    });
    await bufferAdmins.then((admins) => {
      this.admins = admins;
    });
  }

  async ngAfterViewInit() {
    this.CloseModal();
    // Crea el loader para la tabla de especialistas
    this.loaderCR = this.CreateLoader(this.tEspecialistasElementRef!, this.vcrTablaEspecialistas, this.loaderCR);  
    
    // Crea el loader para la tabla de pacientes
    this.loaderPacientesCR = this.CreateLoader(this.tPacientesElementRef!, this.vcrTablaPacientes, this.loaderPacientesCR);
  
    // Crea la tabla de admins
  }
  

  async EditarRegistro(especialista?: Especialista | Paciente | Admin) {
    try{
      switch(this.tipoRegistro) {
        case 'especialista':
          await this.EditarEspecialista(especialista as Especialista);
          break;
        case 'paciente':
          console.log('Editando paciente');
          break;
      }
    }
    catch (error) {
      console.error('Error al editar el especialista:', error);
    }
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

    if(especialista) {
      this.errores = [];
      // Valida si no se han realizado cambios
      if((this.bufferRegistro as Especialista).aprobed === this.especialistaForm.get('aprobado')?.value) {
        this.errores.push(this.errorMessages['general']['noChanges']);
        return;
      }
      console.log('Editando especialista');
    
      // Actualiza el especialista
      (this.bufferRegistro as Especialista).aprobed = this.especialistaForm.get('aprobado')?.value; 
      
      // Actualiza el especialista en la base de datos
      await this.especialistaService.Update(especialista.id!, especialista);

      console.log("Especialista editado correctamente");
      this.CloseModal();
    }
    else throw new Error('No hay especialista seleccionado');

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

  CreateRegistroEspecialista() {
    if(this.vcrRegistro) {
      this.vcrRegistro.clear();
    }
    this.formRegistroEspecialistaCR = this.vcrRegistro.createComponent(RegistroEspecialistaComponent);

    const wrapper = this.formRegistroElementRef!.nativeElement.querySelector('#wrapper');
    wrapper.style = `width: ${this.formRegistroElementRef!.nativeElement.offsetWidth}px;height: ${this.formRegistroElementRef!.nativeElement.offsetHeight}px;`;

    const observer = new ResizeObserver(() => {
      wrapper.style = `width: ${this.formRegistroElementRef!.nativeElement.offsetWidth}px;height: ${this.formRegistroElementRef!.nativeElement.offsetHeight}px;`;
    });
    observer.observe(this.formRegistroElementRef!.nativeElement);

    this.formRegistroEspecialistaCR.instance.goBack.subscribe(() => {
      this.CloseRegistro(this.formRegistroEspecialistaCR);
    });

    this.formRegistroEspecialistaCR.instance.success.subscribe(() => {
      console.log('Registro exitoso');
      this.formRegistroEspecialistaCR?.destroy();
      this.CreateModalSuccess("especialista");
    });
  }
  CreateRegistroPaciente() {
    if(this.vcrRegistro) {
      this.vcrRegistro.clear();
    }
    this.formRegistroPacienteCR = this.vcrRegistro.createComponent(FormularioRegistroComponent);

    const wrapper = this.formRegistroElementRef!.nativeElement.querySelector('#wrapper');
    wrapper.style = `width: ${this.formRegistroElementRef!.nativeElement.offsetWidth}px;height: ${this.formRegistroElementRef!.nativeElement.offsetHeight}px;`;

    const observer = new ResizeObserver(() => {
      wrapper.style = `width: ${this.formRegistroElementRef!.nativeElement.offsetWidth}px;height: ${this.formRegistroElementRef!.nativeElement.offsetHeight}px;`;
    });
    observer.observe(this.formRegistroElementRef!.nativeElement);

    this.formRegistroPacienteCR.instance.goBack.subscribe(() => {
      this.CloseRegistroPaciente(this.formRegistroPacienteCR);
    });

    this.formRegistroPacienteCR.instance.success.subscribe(() => {
      console.log('Registro exitoso');
      this.formRegistroPacienteCR?.destroy();
      this.CreateModalSuccess("paciente");
    });
  }
  CreateRegistroAdmin() {
    if(this.vcrRegistro) {
      this.vcrRegistro.clear();
    }
    this.formRegistroAdminCR = this.vcrRegistro.createComponent(RegistroAdminComponent);

    const wrapper = this.formRegistroElementRef!.nativeElement.querySelector('#wrapper');
    wrapper.style = `width: ${this.formRegistroElementRef!.nativeElement.offsetWidth}px;height: ${this.formRegistroElementRef!.nativeElement.offsetHeight}px; left: 0;`;

    const observer = new ResizeObserver(() => {
      wrapper.style = `width: ${this.formRegistroElementRef!.nativeElement.offsetWidth}px;height: ${this.formRegistroElementRef!.nativeElement.offsetHeight}px;`;
    });
    observer.observe(this.formRegistroElementRef!.nativeElement);

    this.formRegistroAdminCR.instance.goBack.subscribe(() => {
      this.CloseRegistroAdmin(this.formRegistroAdminCR);
    });

    this.formRegistroAdminCR.instance.success.subscribe(() => {
      console.log('Registro exitoso');
      this.formRegistroPacienteCR?.destroy();
      this.CreateModalSuccess("admin");
    });
  }

  CreateModalSuccess(tipo: string) {
    this.modalCR = this.vcrRegistro.createComponent(ModalComponent);
    this.modalCR.instance.title = 'Registro Exitoso';
    const modal = this.modalCR.location.nativeElement.querySelector('#modal');
    
    if(tipo === "especialista"){

      modal.style = `width: ${this.formRegistroElementRef!.nativeElement.offsetWidth}px; height: ${this.formRegistroElementRef!.nativeElement.offsetHeight}px;`;
  
      this.modalCR.instance.continue.subscribe(() => {
        this.modalCR?.destroy();
        this.CloseRegistro(this.formRegistroEspecialistaCR);
      });
    }
    else if(tipo === "paciente") {
      
      modal.style = `width: ${this.formRegistroElementRef!.nativeElement.offsetWidth}px; height: ${this.formRegistroElementRef!.nativeElement.offsetHeight}px;`;
    
      this.modalCR.instance.continue.subscribe(() => {
        this.modalCR?.destroy();
        this.CloseRegistroPaciente(this.formRegistroPacienteCR);
      });
    }

  }

  CloseRegistro(formCR?: ComponentRef<RegistroEspecialistaComponent>) {
    const parent = this.formRegistroElementRef!.nativeElement.parentElement;
    parent.style.display = 'none';
  }
  CloseRegistroPaciente(formCR?: ComponentRef<FormularioRegistroComponent>) {
    const parent = this.formRegistroElementRef!.nativeElement.parentElement;
    parent.style.display = 'none';
  }
  CloseRegistroAdmin(formCR?: ComponentRef<RegistroAdminComponent>) {
    const parent = this.formRegistroElementRef!.nativeElement.parentElement;
    parent.style.display = 'none';
  }
  OpenRegistro(tipo: string) {
    if(tipo === 'especialista') {
      this.CreateRegistroEspecialista();
    }
    else if(tipo === 'paciente') {
      this.CreateRegistroPaciente();
    }
    else if(tipo === 'admin') {
      this.CreateRegistroAdmin();
    }

    const parent = this.formRegistroElementRef!.nativeElement.parentElement;
    parent.style.display = 'flex';
  }

  CreateLoader(contenedor: ElementRef, vcr: ViewContainerRef, loaderCR?: ComponentRef<LoaderComponent>) {
    if(loaderCR) {
      this.DestroyLoader(loaderCR);
    }

    loaderCR = vcr.createComponent(LoaderComponent);
    const loader = loaderCR.location.nativeElement.querySelector('#loader');

    // Establece el ancho del loader
    loader.style = `width: ${contenedor.nativeElement.offsetWidth }px;`;
    loader.style = `height: ${contenedor.nativeElement.offsetHeight }px;`;
    // Detecta si el tamaño del contenedor cambia
    const observer = new ResizeObserver(() => {
      loader.style.width = `${contenedor.nativeElement.offsetWidth }px`;
    });

    observer.observe(contenedor.nativeElement);

    return loaderCR;
  }
  DestroyLoader(loaderCR?: ComponentRef<LoaderComponent>) {
      loaderCR?.destroy();
  }
  OpenModal(usuario: Paciente | Especialista | Admin, tipo: string) {
    switch(tipo) {
      case 'paciente':
        this.bufferRegistro = usuario as Paciente;
        break;

      case 'especialista':
        this.bufferRegistro = usuario as Especialista;
        
        this.especialistaForm.patchValue({
          aprobado: this.bufferRegistro?.aprobed
        });
        break;
      
      case 'admin':
        this.bufferRegistro = usuario as Admin;
        break
    }
    this.tipoRegistro = tipo;
    this.modalElementRef!.nativeElement.parentElement.style.display = 'flex';
  }
  
  GetEspecialidad(): string  {
    if (this.tipoRegistro === 'especialista' && (this.bufferRegistro as Especialista).especialidad) {
      return (this.bufferRegistro as Especialista).especialidad ?? '';
    }
    return '';
  }

  GetObraSocial(): string {
    if (this.tipoRegistro === 'paciente' && (this.bufferRegistro as Paciente).obraSocial) {
      return (this.bufferRegistro as Paciente).obraSocial ?? '';
    }
    return '';
  }

  GetFotoPerfil(): string {
    if (this.tipoRegistro === 'paciente' && (this.bufferRegistro as Paciente).fotoPerfil) {
      return (this.bufferRegistro as Paciente).fotoPerfil ?? '';
    }
    else if (this.tipoRegistro === 'admin' && (this.bufferRegistro as Admin).fotoPerfil) {
      return (this.bufferRegistro as Admin).fotoPerfil ?? '';
    }
    return '';
  }

  GetFotoDni(): string {
    if (this.tipoRegistro === 'paciente' && (this.bufferRegistro as Paciente).fotoDni) {
      return (this.bufferRegistro as Paciente).fotoDni ?? '';
    }
    return '';
  }

  VerFoto(url: string) {    
    this.modalFotoElementRef!.nativeElement.style.display = 'flex';
    this.modalFotoElementRef!.nativeElement.querySelector('img')!.src = url;
    
    setTimeout(() => {
      this.modalFotoActive = true;
    }, 10);
  }
  CerrarFoto() {
    this.modalFotoElementRef!.nativeElement.style.display = 'none';
    this.modalFotoActive = false;
  }

  // Hotlistener que detecta si se hace click dentro o fuera de la foto del modal
  @HostListener('document:click', ['$event'])onDocumentClick(event: MouseEvent): void {
    const foto = this.modalFotoElementRef!.nativeElement.querySelector('div');

    if(!foto.contains(event.target as Node)) {
      if(this.modalFotoActive) {
        this.CerrarFoto();
      }
    }
  }
}
