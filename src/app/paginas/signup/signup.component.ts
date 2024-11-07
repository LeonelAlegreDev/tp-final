import { Component, ComponentRef, ElementRef, ViewChild, viewChild, ViewContainerRef } from '@angular/core';
import { LoaderComponent } from "../../componentes/loader/loader.component";
import { FormularioRegistroComponent } from "../../componentes/formulario-registro/formulario-registro.component";
import { ModalComponent } from '../../componentes/modal/modal.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ LoaderComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  @ViewChild('viewport', { read: ViewContainerRef }) vcr!: ViewContainerRef;
  @ViewChild('container') containerRef!: ElementRef;
  private loaderCR?: ComponentRef<LoaderComponent>;
  private formRegistroCR?: ComponentRef<FormularioRegistroComponent>;
  private modalCR?: ComponentRef<ModalComponent>;
  selectedType: boolean = false;

  constructor() { }

  ngAfterViewInit() {
    // this.CreateLoader();
    // this.CreateForm();
  }

  SelectForm(tipo: string){
    if(tipo === 'paciente'){
      console.log('paciente');
    }
    if(tipo === 'especialista'){
      console.log('Especialista');
      this.selectedType = true;
      this.CreateFormEsp();
    }
  }

  CreateLoader() {
    this.loaderCR = this.vcr.createComponent(LoaderComponent);
    // Se ejecuta cuando el loader se ha cargado completamente
    this.loaderCR.instance.loaded.subscribe(() => {
    });
  }

  CreateFormEsp() {
    // Crea el formulario y lo oculta
    this.formRegistroCR = this.vcr.createComponent(FormularioRegistroComponent);
    this.OcultarComponente(this.formRegistroCR!);

    // Se ejecuta cuando el formulario se ha cargado completamente
    this.formRegistroCR.instance.loaded.subscribe(() => {
      // Muestra el formulario y destruye el loader
      this.MostrarComponente(this.formRegistroCR!);
      this.loaderCR?.destroy();
    });

    // Se ejecuta cuando el formulario está enviando los datos
    this.formRegistroCR.instance.sending.subscribe(() => {
      this.CreateLoader();
      this.OcultarComponente(this.formRegistroCR!);
    });

    // Se ejecuta cuando el formulario ha enviado los datos con éxito
    this.formRegistroCR.instance.success.subscribe(() => {
      this.loaderCR?.destroy();
      this.formRegistroCR?.destroy();
      this.CreateModal();
      this.modalCR!.instance.title = "Registro Exitoso";
      console.log(this.modalCR);
    });

    // Se ejecuta cuando el formulario regresa a la vista principal
    this.formRegistroCR.instance.goBack.subscribe(() => {
      this.formRegistroCR?.destroy();
      this.selectedType = false;
    });
  }

  CreateModal() {
    this.modalCR = this.vcr.createComponent(ModalComponent);
    this.OcultarComponente(this.modalCR!);

    // Se ejecuta cuando el modal se ha cargado completamente
    this.modalCR.instance.loaded.subscribe(() => {
      this.MostrarComponente(this.modalCR!);
    });
  }
  MostrarComponente(componente: ComponentRef<any>) {
    if(componente.location){
      componente.location.nativeElement.style.opacity = 1;
    }
  }
  OcultarComponente(componente: ComponentRef<any>) {
    if(componente.location){
      componente.location.nativeElement.style.opacity = 0;
    }
  }
}


