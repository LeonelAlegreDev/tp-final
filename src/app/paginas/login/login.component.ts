import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FireAuthService } from '../../servicios/fire-auth.service';
import { EspecialistaService } from '../../servicios/especialista.service';
import { PacienteService } from '../../servicios/paciente.service';
import { Especialista } from '../../interfaces/especialista';
import { AdminService } from '../../servicios/admin.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  @ViewChild('cuentas') cuentas!: ElementRef
  fireAuthService = inject(FireAuthService);
  router = inject(Router);

  loginForm: FormGroup;
  errorMessages: { [key: string]: { [key: string]: string } } = {
    email: {
      required: 'Ingrese su email',
      email: 'Email inválido'
    },
    password: {
      required: 'Ingrese su contraseña',
      minlength: 'La contraseña debe tener al menos 6 caracteres'
    }
  }
  generalError = '';
  especialistaService = inject(EspecialistaService);
  pacienteService = inject(PacienteService);
  adminService = inject(AdminService);

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  constructor(private formBuilder: FormBuilder) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async Submit() {
    if (this.loginForm.invalid) {
      console.log('Formulario inválido');
      this.loginForm.markAllAsTouched();
      return;
    }
    this.generalError = '';
    try {
      const credentials = await this.fireAuthService.Login(this.email?.value, this.password?.value);
      console.log('Login successful');

      const especialista = await this.especialistaService.GetById(credentials.uid);
      if (especialista) {
        this.fireAuthService.user = especialista;
        this.fireAuthService.userRole = 'especialista';
        this.fireAuthService.isLoggedIn = true;
        this.fireAuthService.SaveSession();
        this.router.navigate(['/home']);
        return;
      }

      const paciente = await this.pacienteService.GetById(credentials.uid); 
      if (paciente) {
        this.fireAuthService.user = paciente;
        this.fireAuthService.userRole = 'paciente';
        this.fireAuthService.isLoggedIn = true;
        this.fireAuthService.SaveSession();
        this.router.navigate(['/home']);
        return;
      }

      const admin = await this.adminService.GetById(credentials.uid);
      if (admin) {
        this.fireAuthService.user = admin;
        this.fireAuthService.userRole = 'admin';
        this.fireAuthService.isLoggedIn = true;
        this.fireAuthService.SaveSession();
        this.router.navigate(['/home']);
        return;
      }

      throw new Error('Usuario no encontrado');

    } catch (error) {
      if ((error as { code: string }).code === 'auth/invalid-credential') {
        this.generalError = 'Credenciales inválidas';
      }
      else {
        console.log('Error al iniciar sesión:', error);
        this.generalError = 'Error interno.';
      }
    }
  }

  GetErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control && control.errors) {
      for (const error in control.errors) {
        if (control.errors.hasOwnProperty(error)) {
          return this.errorMessages[controlName as keyof typeof this.errorMessages][error];
        }
      }
    }
    return '';
  }
  
  MostrarCuentas(){
    if(this.cuentas.nativeElement.classList.contains('active')){
      return;
    }
    this.cuentas.nativeElement.classList.add('active');
  }
  OcultarCuentas(){
    if(!this.cuentas.nativeElement.classList.contains('active')){
      return;
    }
    this.cuentas.nativeElement.classList.remove('active');
  }

  ElegirCuenta(tipo: string){
    let email = null;
    let password = null;

    if (tipo === 'especialista') {
      email = "especialista1@email.com";
      password = "123456a";

    } else if (tipo === 'paciente') {
      email = "paciente1@email.com";
      password = "123456a";
    }
    else if (tipo === 'admin') {
      email = "admin1@email.com";
      password = "123456A";
    }

    if(email && password){
      this.email?.setValue(email);
      this.password?.setValue(password);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.cuentas && !this.cuentas.nativeElement.contains(event.target)) {
      this.OcultarCuentas();
    } else {
      this.MostrarCuentas();
    }
  }

}