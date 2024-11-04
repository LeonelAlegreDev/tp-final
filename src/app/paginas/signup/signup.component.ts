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

  
  ngAfterViewInit() {
    // this.CreateLoader();
    this.loadFormRegistro();
  }

  CreateLoader() {
    this.vcr.clear();
    this.loaderCR = this.vcr.createComponent(LoaderComponent);
  }

  DeleteLoader() {
    this.loaderCR?.destroy();
  }

  loadFormRegistro() {
    // this.DeleteLoader();
    this.vcr.clear();
    this.formRegistroCR = this.vcr.createComponent(FormularioRegistroComponent);
  }
}


