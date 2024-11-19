import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FireAuthService } from '../../servicios/fire-auth.service';
import { EspecialistaService } from '../../servicios/especialista.service';
import { PacienteService } from '../../servicios/paciente.service';
import { Especialista } from '../../interfaces/especialista';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
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
  especialistaService = inject(EspecialistaService);
  pacienteService = inject(PacienteService);

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
    try {
      const credentials = await this.fireAuthService.Login(this.email?.value, this.password?.value);
      console.log('Login successful');

      const especialista = await this.especialistaService.GetById(credentials.uid);
      if (especialista) {
        this.fireAuthService.user = especialista;
        this.router.navigate(['/home']);
        return;
      }

      const paciente = await this.pacienteService.GetById(credentials.uid); 
      if (paciente) {
        this.fireAuthService.user = paciente;
        this.router.navigate(['/home']);
        return;
      }
      throw new Error('Usuario no encontrado');

    } catch (error) {
      if ((error as { code: string }).code === 'auth/invalid-credential') {
        console.error('Credenciales inválidas');
      }
      else {
        console.error('Error desconocido:', error);
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
  

}