import { NgIf } from '@angular/common';
import { Component, ElementRef, Inject, Renderer2, ViewChild, ViewChildren, Injector } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Storage, ref, uploadBytes } from '@angular/fire/storage';
import { Paciente } from '../../interfaces/paciente';
import { FireAuthService } from '../../servicios/fire-auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  /* Formulario de varios pasos:
    1. Datos de la cuenta: Nombre, Apellido, Email, Contraseña
    2. Informacion Personal: Obra social, DNI, Edad
    3. Cargar 2 fotos del usuario.
    Se deben validar los campos de cada paso antes de pasar al siguiente.
    Se debe mostrar un mensaje de error si el usuario intenta pasar al siguiente paso sin completar los campos requeridos.
    Validaciones para nombre, apellido, obra social: solo letras, no vacio
    Validaciones para email: formato de email valido, 1 solo arroba, partes no vacias
    Validaciones para contraseña: minimo 6 caracteres, al menos 1 letra y 1 numero
    Validaciones para DNI: solo numeros, 8 digitos, sin puntos ni guiones, ni espacios
  */
  @ViewChild('accountF') accountF!: ElementRef;
  @ViewChild('personalF') personalF!: ElementRef;
  @ViewChild('fotosF') fotosF!: ElementRef;

  accountForm: FormGroup;
  personalForm: FormGroup;
  fotosForm: FormGroup;
  currentStep: number = 1;
  errorMessages: { [key: string]: { [key: string]: string } } = {
    nombre: {
      required: 'Nombre es requerido.',
      pattern: 'Nombre solo debe contener letras.'
    },
    apellido: {
      required: 'Apellido es requerido.',
      pattern: 'Apellido solo debe contener letras.'
    },
    email: {
      required: 'Email es requerido.',
      email: 'Email debe tener un formato válido.',
      used: 'Email ya en uso.'
    },
    contrasena: {
      required: 'Contraseña es requerida.',
      minlength: 'Contraseña debe tener al menos 6 caracteres.',
      pattern: 'Contraseña debe incluir al menos una letra y un número.'
    },
    dni: {
      required: 'DNI es requerido.',
      pattern: 'DNI debe tener 8 dígitos numéricos.'
    },
    edad: {
      required: 'Edad es requerida.',
      pattern: 'Edad invalida.'
    },
    obraSocial: {
      required: 'Obra social es requerida.'
    },
    fotoDni: {
      required: 'Debe subir una foto del DNI'
    },
    fotoPerfil: {
      required: 'Debe subir una foto de perfil'
    }
  };
  fotoDni: any;
  fotoPerfil: any;

  get nombre() { return this.accountForm.get('nombre'); }
  get apellido() { return this.accountForm.get('apellido'); }
  get email() { return this.accountForm.get('email'); }
  get contrasena() { return this.accountForm.get('contrasena'); }

  get dni() { return this.personalForm.get('dni'); }
  get edad() { return this.personalForm.get('edad'); }
  get obraSocial() { return this.personalForm.get('obraSocial'); }

  // get fotoPerfil() { return this.fotosForm.get('fotoPerfil'); }
  // get fotoDni() { return this.fotosForm.get('fotoDni'); }

  constructor(private formBuilder: FormBuilder, private renderer: Renderer2, private storage: Storage, public fireAuthService: FireAuthService) {
    this.accountForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      apellido: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6), Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$')]]
    });

    this.personalForm = this.formBuilder.group({
      obraSocial: ['', [Validators.required]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      edad: ['', [Validators.required, Validators.pattern('^[0-9]{2}$')]]
    });

    this.fotosForm = this.formBuilder.group({
      fotoPerfil: ['', [Validators.required]],
      fotoDni: ['', [Validators.required]]
    });
  }

  async NextStep() {
    switch (this.currentStep) {
      case 1:
        if (this.accountForm.valid) {
          const barElement = document.querySelector('.front li:nth-child(1)');
          const iconElement = document.querySelector('.icons li:nth-child(1)');
          const buttonPrev = document.querySelector('#btn-prev');
          
          barElement!.classList.remove('deschardedBar');
          iconElement!.classList.remove('deschargedIcon');
    
          // Agrega la animacion a la barra y al icono
          barElement!.classList.add('chargedBar');
          iconElement!.classList.add('chargedIcon');

          // Muestra el siguiente formulario
          this.renderer.setStyle(this.personalF.nativeElement, 'display', 'flex');

          setTimeout(() => {
            // Aplica la transformación para mover los formularios
            this.renderer.setStyle(this.accountF.nativeElement, 'transform', 'translateX(-100%)');
            this.renderer.setStyle(this.personalF.nativeElement, 'transform', 'translateX(0)');
          }, 1);
    
          buttonPrev?.classList.remove('desactivated');    
          this.currentStep++;
        }
        else {
          console.log('Error: Formulario incompleto');
          this.accountForm.markAllAsTouched();
        }
        break   
      case 2:
        if(this.personalForm.valid){
          const barElement = document.querySelector('.front li:nth-child(2)');
          const iconElement = document.querySelector('.icons li:nth-child(2)');

          barElement!.classList.remove('deschardedBar');
          iconElement!.classList.remove('deschargedIcon');

          barElement!.classList.add('chargedBar');
          iconElement!.classList.add('chargedIcon');

          this.renderer.setStyle(this.fotosF.nativeElement, 'display', 'flex');
          setTimeout(() => {
            this.renderer.setStyle(this.personalF.nativeElement, 'transform', 'translateX(-100%)');
            this.renderer.setStyle(this.fotosF.nativeElement, 'transform', 'translateX(0)');  
          }, 1);
          this.currentStep++;
        }
        else{
          this.personalForm.markAllAsTouched();
          console.log('Error: Formulario incompleto');
        }
        break;
      case 3:
        if(this.fotosForm.valid){
          let user: Paciente = {
            nombre: this.nombre?.value,
            apellido: this.apellido?.value,
            email: this.email?.value,
            dni: this.dni?.value,
            edad: this.edad?.value,
            obraSocial: this.obraSocial?.value,
          }
          try{
            await this.fireAuthService.Signup(user, this.contrasena?.value);
            console.log("Usuario creado con Fire Auth: ", this.fireAuthService.user);

            // Carga la foto de perfil
            console.log(this.fotoPerfil)
            let fileName = "perfil." + this.fotoPerfil.type.split('/')[1];
            let storageRef = ref(this.storage, `${this.fireAuthService.user?.id}/fotos/${fileName}`);

            uploadBytes(storageRef , this.fotoPerfil)
            .then((response) => {
              console.log("Foto de perfil subida correctamente");
              console.log(response);
            })
            .catch((error) => {
              console.log("Se produjo un error al subir la foto de perfil");
              throw error;
            });

            fileName = "dni." + this.fotoDni.type.split('/')[1];
            storageRef = ref(this.storage, `${this.fireAuthService.user?.id}/fotos/${fileName}`);

            uploadBytes(storageRef, this.fotoDni)
            .then((response) => {
              console.log("Foto de DNI subida correctamente");
              console.log(response);
            })
            .catch((error) => {
              console.log("Se produjo un error al subir la foto del DNI");
              throw error;
            });
          }
          catch(e: any){
            if(e.message === "Email ya en uso"){
              this.email?.setErrors({ used: true });
              this.PrevStep();
              this.PrevStep();
            }
            console.log(e.message)
            throw e;
          }
          
        }
        else{
          this.fotosForm.markAllAsTouched();
          console.log('Error: Formulario incompleto');
        }
        break;
    }
  }

  PrevStep(){
    console.log(this.currentStep);
    if(this.currentStep > 1){
      let barElement: Element;
      let iconElement: Element;

      switch(this.currentStep){
        case 2:
          barElement = document.querySelector('.front li:nth-child(1)')!;
          iconElement = document.querySelector('.icons li:nth-child(1)')!;
          const buttonPrev = document.querySelector('#btn-prev');
          
          // Desactiva el boton de volver
          buttonPrev?.classList.add('desactivated');

          this.renderer.setStyle(this.personalF.nativeElement, 'transform', 'translateX(100%)');
          this.accountF.nativeElement.style.transform = 'translateX(0)';

          iconElement!.classList.remove('chargedIcon');
          barElement!.classList.remove('chargedBar');

          iconElement!.classList.add('deschargedIcon');
          barElement!.classList.add('deschardedBar');

          setTimeout(() => {
            this.personalF!.nativeElement.style.display = 'none';
          }, 1000);
          this.currentStep--;
          break;
        
        case 3:
          barElement = document.querySelector('.front li:nth-child(2)')!;
          iconElement = document.querySelector('.icons li:nth-child(2)')!;
          
          iconElement!.classList.remove('chargedIcon');
          barElement!.classList.remove('chargedBar');

          iconElement!.classList.add('deschargedIcon');
          barElement!.classList.add('deschardedBar');
          
          this.renderer.setStyle(this.fotosF.nativeElement, 'transform', 'translateX(100%)');
          this.renderer.setStyle(this.personalF.nativeElement, 'transform', 'translateX(0%)');
          
          setTimeout(() => {
            this.fotosF.nativeElement.style.display = 'none';
          }, 1000);
          this.currentStep--;
          break;
      }
    }
  }

  // LISTA DE PASOS:
  /**
   * 1. El usuario completa el primer formulario, con su 
   * nombre, apellido, email y contraseña.
   * 2. El usuario completa el segundo formulario, con su
   * obra social, DNI y edad.
   * 3. El usuario completa el tercer formulario, con sus
   * fotos de perfil y DNI.
   * 
   * Primero se debe crear un usuario con la firebase auth
   * Luego crear un documento que tenga como ID del documento, el mismo ID que el usuario de firebase auth
   * Luego subir las fotos a firebase storage en la ruta {idPaciente}/fotos/
   */

  UploadDni($event: any) {
    const file = $event.target.files[0];

    if(file.type !== 'image/jpeg' && file.type !== 'image/png'){
      console.log('Error: Formato de imagen incorrecto');
      return;
    }
    const fileName = "dni." + file.type.split('/')[1];

    this.fotoDni = file;

    // cambiar nombre de la ruta por id del paciente
    // const storageRef = ref(this.storage, `${this.nombre?.value}/fotos/${fileName}`);

    // uploadBytes(storageRef, file)
    //   .then((response) => {
    //     console.log(response);
    //   })
    //   .catch((error) => {
    //     console.log("Se produjo un error al subir la foto del DNI");
    //     throw error;
    //   });
  }
  UploadFoto($event: any) {
    const file = $event.target.files[0];

    if(file.type !== 'image/jpeg' && file.type !== 'image/png'){
      console.log('Error: Formato de imagen incorrecto');
      return;
    }
    this.fotoPerfil = file;
    console.log(this.fotoPerfil);
  }

  GetErrorMessage(formGroupName: string, controlName: string): string {
    let formGroup: FormGroup;
  
    switch (formGroupName) {
      case 'accountForm':
        formGroup = this.accountForm;
        break;
      
      case 'personalForm':
        formGroup = this.personalForm;
        break;

        break;
      
      case 'fotosForm':
        formGroup = this.fotosForm;
        break;
      
      default:
        return '';
    }
  
    const control = formGroup.get(controlName);
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


