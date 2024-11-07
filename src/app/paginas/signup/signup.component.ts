import { Component, ComponentRef, ElementRef, ViewChild, viewChild, ViewContainerRef } from '@angular/core';
import { LoaderComponent } from "../../componentes/loader/loader.component";
import { FormularioRegistroComponent } from "../../componentes/formulario-registro/formulario-registro.component";

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

  constructor() { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.CreateLoader();
    this.loadFormRegistro();
    this.OcultarComponente(this.formRegistroCR!);
  }

  CreateLoader() {
    this.loaderCR = this.vcr.createComponent(LoaderComponent);
    this.loaderCR.instance.loaded.subscribe(() => {
      // console.log('Loader component has finished loading its styles.');
    });
  }

  DeleteLoader() {
    this.loaderCR?.destroy();
  }

  loadFormRegistro() {
    this.formRegistroCR = this.vcr.createComponent(FormularioRegistroComponent);
    
    // Se ejecuta cuando el componente se ha cargado completamente
    this.formRegistroCR.instance.loaded.subscribe(() => {
      this.MostrarComponente(this.formRegistroCR!);
      this.DeleteLoader();
    });

    // Se ejecuta cuando el componente está enviando los datos
    this.formRegistroCR.instance.sending.subscribe(() => {
      this.CreateLoader();
      this.OcultarComponente(this.formRegistroCR!);
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


