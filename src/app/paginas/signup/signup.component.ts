import { Component, ComponentRef, ElementRef, ViewChild, viewChild, ViewContainerRef } from '@angular/core';
import { LoaderComponent } from "../../componentes/loader/loader.component";
import { FormularioRegistroComponent } from "../../componentes/formulario-registro/formulario-registro.component";
import { ModalComponent } from '../../componentes/modal/modal.component';
import { RegistroEspecialistaComponent } from '../../componentes/registro-especialista/registro-especialista.component';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  @ViewChild('viewport', { read: ViewContainerRef }) vcr!: ViewContainerRef;
  @ViewChild('container') containerRef!: ElementRef;
  private formRegistroCR?: ComponentRef<FormularioRegistroComponent>;
  private formRegEspCR?: ComponentRef<RegistroEspecialistaComponent>;
  private modalCR?: ComponentRef<ModalComponent>;
  private loaderCR?: ComponentRef<LoaderComponent>;

  selectedType: boolean = false;

  constructor(private router: Router) { }

  SelectForm(tipo: string){
    if(tipo === 'paciente'){
      this.selectedType = true;
      this.CreateFormPac();
    }
    if(tipo === 'especialista'){
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

  CreateFormPac() {
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
    });

    // Se ejecuta cuando el formulario regresa a la vista principal
    this.formRegistroCR.instance.goBack.subscribe(() => {
      this.formRegistroCR?.destroy();
      this.selectedType = false;
    });
  }

  CreateFormEsp() {
    // Crea el formulario y lo oculta
    this.formRegEspCR = this.vcr.createComponent(RegistroEspecialistaComponent);
    this.OcultarComponente(this.formRegEspCR!);

    // Se ejecuta cuando el formulario se ha cargado completamente
    this.formRegEspCR.instance.loaded.subscribe(() => {
      // Muestra el formulario y destruye el loader
      this.MostrarComponente(this.formRegEspCR!);
      this.loaderCR?.destroy();
    });

    // Se ejecuta cuando el formulario está enviando los datos
    this.formRegEspCR.instance.sending.subscribe(() => {
      this.CreateLoader();
      this.OcultarComponente(this.formRegEspCR!);
    });

    // Se ejecuta cuando el formulario ha enviado los datos con éxito
    this.formRegEspCR.instance.success.subscribe(() => {
      this.loaderCR?.destroy();
      this.formRegEspCR?.destroy();
      this.CreateModal();
      this.modalCR!.instance.title = "Registro Exitoso";
    });

    // Se ejecuta cuando el formulario regresa a la vista principal
    this.formRegEspCR.instance.goBack.subscribe(() => {
      this.formRegEspCR?.destroy();
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

    // Se subscribe al Output de continue del modal
    this.modalCR?.instance.continue.subscribe(() => {
      console.log('Continuar');
      this.router.navigate(['/home']);
    });

    // Se subscribe al Output de close del modal
    this.modalCR?.instance.close.subscribe(() => {
      console.log('Cerrar');
      this.router.navigate(['/home']);
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


