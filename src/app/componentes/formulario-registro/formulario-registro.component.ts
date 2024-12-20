import { NgIf } from '@angular/common';
import { Component, ElementRef, Inject, Renderer2, ViewChild, ViewChildren, Injector, viewChild, Output, EventEmitter, ViewContainerRef, ComponentRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Storage, ref, uploadBytes } from '@angular/fire/storage';
import { Paciente } from '../../interfaces/paciente';
import { FireAuthService } from '../../servicios/fire-auth.service';
import { PacienteService } from '../../servicios/paciente.service';
import { inject } from '@angular/core';
import { LoaderComponent } from "../../componentes/loader/loader.component";
import { CaptchaComponent } from '../captcha/captcha.component';

@Component({
  selector: 'app-formulario-registro',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './formulario-registro.component.html',
  styleUrl: './formulario-registro.component.css'
})
export class FormularioRegistroComponent {
  @ViewChild('accountF') accountF!: ElementRef;
  @ViewChild('personalF') personalF!: ElementRef;
  @ViewChild('fotosF') fotosF!: ElementRef;
  @Output() loaded = new EventEmitter<void>();
  @Output() sending = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();
  @ViewChild('content', { read: ViewContainerRef }) contentVCR!: ViewContainerRef;
  private captchaCR?: ComponentRef<CaptchaComponent>;
  pacienteService: PacienteService = inject(PacienteService);
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
      pattern: 'Edad invalida.',
      min: 'Debe ser mayor de 18 años.'
    },
    obraSocial: {
      required: 'Obra social es requerida.'
    },
    fotoDni: {
      required: 'La foto del DNI es obligatoria.',
      format: 'Formato de imagen invalido. Formatos permitidos: .jpeg, .jpg, .png'
    },
    fotoPerfil: {
      required: 'La foto de perfil es obligatoria.',
      format: 'Formato de imagen invalido. Formatos permitidos: .jpeg, .jpg, .png'
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
      edad: ['', [Validators.required, Validators.pattern('^[0-9]{2}$'), Validators.min(18)]]
    });

    this.fotosForm = this.formBuilder.group({
      fotoPerfil: ['', [Validators.required]],
      fotoDni: ['', [Validators.required]]
    });
  }

  ngAfterViewInit() {
    this.loaded.emit();
    // this.orquestador.estadoActual = this.orquestador.estados[1];
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
        if (this.personalForm.valid) {
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
        else {
          this.personalForm.markAllAsTouched();
          console.log('Error: Formulario incompleto');
        }
        break;
      case 3:
        if (this.fotosForm.valid) {
          let user: Paciente = {
            nombre: this.nombre?.value,
            apellido: this.apellido?.value,
            email: this.email?.value,
            dni: this.dni?.value,
            edad: this.edad?.value,
            obraSocial: this.obraSocial?.value,
          }

          // Cambia el icono de la barra de progreso
          const icon = document.querySelector('.icons li:nth-child(3)');
          icon!.classList.remove('deschargedIcon');
          icon!.classList.add('chargedIcon');

          this.CreateCaptcha(user)

        }
        else {
          this.fotosForm.markAllAsTouched();
          console.log('Error: Formulario incompleto');
        }
        break;
    }
  }

  async CreateCaptcha(paciente: Paciente) {
    this.captchaCR = this.contentVCR.createComponent(CaptchaComponent);

    this.captchaCR.instance.success.subscribe(async () => {
      console.log('Captcha correcto');
      this.captchaCR?.destroy();
      await this.CreatePaciente(paciente);
    });
  }

  async CreatePaciente(user: Paciente) {
    try {
      console.log("Creando paciente");
      // Crear el usuario en Firebase Auth
      await this.fireAuthService.Signup(user, this.contrasena?.value);
      console.log("Usuario creado en Firebase Auth");

      // Una vez creado el usuario en Firebase Auth, se guardan los datos en la base de datos
      this.sending.emit();

      const userDetails = document.getElementsByClassName('user-details');

      // Subir las fotos a Firebase Storage
      let fileName = "perfil." + this.fotoPerfil.type.split('/')[1];
      let storageRef = ref(this.storage, `${this.fireAuthService.user?.id}/fotos/${fileName}`);

      await uploadBytes(storageRef, this.fotoPerfil)
        .then((response) => {
          console.log("Foto de perfil subida correctamente");
          // Guardar la URL de la foto de perfil en una variable
          let fullPath = encodeURIComponent(response.metadata.fullPath);
          let bucket = response.metadata.bucket;
          this.fireAuthService.user!.fotoPerfil = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${fullPath}?alt=media`;
        })
        .catch((error) => {
          console.log("Se produjo un error al subir la foto de perfil");
          throw error;
        });

      fileName = "dni." + this.fotoDni.type.split('/')[1];
      storageRef = ref(this.storage, `${this.fireAuthService.user?.id}/fotos/${fileName}`);

      await uploadBytes(storageRef, this.fotoDni)
        .then((response) => {
          console.log("Foto de DNI subida correctamente");
          let fullPath = encodeURIComponent(response.metadata.fullPath);
          let bucket = response.metadata.bucket;
          (this.fireAuthService.user as Paciente).fotoDni = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${fullPath}?alt=media`;
        })
        .catch((error) => {
          console.log("Se produjo un error al subir la foto del DNI");
          throw error;
        });

      // Crear el documento en la base de datos
      const res = await this.pacienteService.Create(this.fireAuthService.user! as Paciente);
      console.log("Paciente creado en la base de datos");

      // Emitir evento de éxito
      this.success.emit();
    }
    catch (e: any) {
      if (e.message === "Email ya en uso") {
        this.email?.setErrors({ used: true });
        this.PrevStep();
        this.PrevStep();
      }
      if (this.fireAuthService.user) {
        await this.fireAuthService.DeleteUser();
      }
      console.log(e.message)
      throw e;
    }
  }

  PrevStep() {
    if (this.currentStep > 1) {
      let barElement: Element;
      let iconElement: Element;

      switch (this.currentStep) {
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
          let lastIcon = document.querySelector('.icons li:nth-child(3)')!;

          iconElement!.classList.remove('chargedIcon');
          barElement!.classList.remove('chargedBar');
          lastIcon!.classList.remove('chargedIcon');

          iconElement!.classList.add('deschargedIcon');
          barElement!.classList.add('deschardedBar');
          lastIcon!.classList.add('deschargedIcon');

          this.renderer.setStyle(this.fotosF.nativeElement, 'transform', 'translateX(100%)');
          this.renderer.setStyle(this.personalF.nativeElement, 'transform', 'translateX(0%)');

          setTimeout(() => {
            this.fotosF.nativeElement.style.display = 'none';
          }, 1000);
          this.currentStep--;
          break;
      }
    }
    else {
      this.goBack.emit();
    }
  }

  UploadDni($event: any) {
    const file = $event.target.files[0];

    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      this.fotosForm.get('errorFotoDni')?.setValue(this.errorMessages['fotoDni']['format']);
      this.fotosForm.get('fotoDni')?.setErrors({ format: true });
      return;
    }

    this.fotoDni = file;
  }

  UploadFoto($event: any) {
    const file = $event.target.files[0];

    if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/jpg') {
      this.fotosForm.get('errorFotoPerfil')?.setValue(this.errorMessages['fotoPerfil']['format']);
      this.fotosForm.get('fotoPerfil')?.setErrors({ format: true });
      return;
    }
    this.fotoPerfil = file;
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
