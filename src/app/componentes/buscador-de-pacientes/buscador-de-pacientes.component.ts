import { Component, ElementRef, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { FireAuthService } from '../../servicios/fire-auth.service';
import { PacienteService } from '../../servicios/paciente.service';
import { Paciente } from '../../interfaces/paciente';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-buscador-de-pacientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './buscador-de-pacientes.component.html',
  styleUrl: './buscador-de-pacientes.component.css'
})
export class BuscadorDePacientesComponent {
  @ViewChild('usuario') usuarioER?: ElementRef;

  fireAuthService = inject(FireAuthService);
  pacienteService = inject(PacienteService);
  pacientes: Paciente[] = [];
  pacienteForm: FormGroup;
  showErrors: boolean = false;
  errorsMessages: { [key: string]: { [key: string]: string } } = {
    email:{
      email: "El email ingresado no es válido"
    },
    id:{
      pattern: "ID invalido. El ID debe ser una cadena de caracteres alfanuméricos."
    },
    dni:{
      pattern: "DNI invalido. El DNI debe ser un número de 8 dígitos."
    }
  };
  generalError: string = '';

  @Output() loaded: EventEmitter<void> = new EventEmitter();
  @Output() pacienteConfirmado: EventEmitter<Paciente> = new EventEmitter();
  @Output() cancelar: EventEmitter<void> = new EventEmitter();
  bufferPaciente?: Paciente;

  constructor(private fb: FormBuilder) {
    this.pacienteService.pacientes$.subscribe(pacientes => {
      this.pacientes = pacientes;
    });

    this.pacienteForm = this.fb.group({
      id: ['', [Validators.pattern('^[a-zA-Z0-9]*$')]],
      dni: ['', [Validators.pattern('^[0-9]{8}$')]],
      email: ['', [Validators.email]]
    });
  }
  GetPaciente(id?: string, dni?: string, email?: string): Paciente | undefined {
    if (!id && !dni && !email) {
      console.error("Debe ingresar al menos un criterio de búsqueda");
      this.generalError = "Debe ingresar al menos un criterio de búsqueda";
      return undefined;
    }
    
    return this.pacientes.find((paciente: Paciente) => {
      return (
        (id ? paciente.id === id : true) &&
        (dni ? paciente.dni === dni : true) &&
        (email ? paciente.email.toLowerCase() === email.toLowerCase() : true)
      );
    });
  }

  GetError(control: any) {
    if (control && control.errors) {
      const controlName = Object.keys(this.pacienteForm.controls).find(name => this.pacienteForm.controls[name] === control);
      if (controlName) {
        const controlErrors = this.errorsMessages[controlName as keyof typeof this.errorsMessages];
        for (const errorKey in control.errors) {
          if (controlErrors && controlErrors[errorKey]) {
            return controlErrors[errorKey];
          }
        }
      }
    }
    return null;
  }

  Buscar() {
    if (this.pacienteForm.valid) {
      const id = this.pacienteForm.get('id')?.value;
      const dni = this.pacienteForm.get('dni')?.value;
      const email = this.pacienteForm.get('email')?.value;

      // Valida que al menos uno de los campos sea distinto de vacío
      if(!id && !dni && !email) {
        this.generalError = "Debe ingresar al menos un criterio de búsqueda";
        return;
      }

      const paciente = this.GetPaciente(id, dni, email);

      if (paciente) {
        this.bufferPaciente = paciente;
        this.generalError = '';
        this.MostrarModalConfirmacion();

      } else {
        this.generalError = "No se encontró ningún paciente con los criterios de búsqueda ingresados";
      }
    } else {
      console.log("Formulario inválido");
    }
  }

  Cancelar() {
    this.cancelar.emit();
  }
  CancelarConfirmacion(){
    this.bufferPaciente = undefined;
    this.OcultarModalConfirmacion();
  }
  Confirmar(){
    if(this.bufferPaciente){
      this.pacienteConfirmado.emit(this.bufferPaciente)
    }
  }

  MostrarModalConfirmacion(){
    this.usuarioER?.nativeElement.classList.remove('hidden');
  }
  OcultarModalConfirmacion(){
    this.usuarioER?.nativeElement.classList.add('hidden');
  }
}
