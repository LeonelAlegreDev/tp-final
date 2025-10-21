import { NgIf } from '@angular/common';
import { Component, ElementRef, Renderer2, ViewChild, ViewChildren, Injector, viewChild, Output, EventEmitter, ViewContainerRef, ComponentRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Storage, ref, uploadBytes } from '@angular/fire/storage';
import { Especialista } from '../../interfaces/especialista';
import { FireAuthService } from '../../servicios/fire-auth.service';
import { EspecialistaService } from '../../servicios/especialista.service';
import { inject } from '@angular/core';
import { Especialidad } from '../../interfaces/especialidad';
import { CaptchaComponent } from '../captcha/captcha.component';

@Component({
  selector: 'app-registro-especialista',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './registro-especialista.component.html',
  styleUrl: './registro-especialista.component.css'
})
export class RegistroEspecialistaComponent {
  @ViewChild('accountF') accountF!: ElementRef;
  @ViewChild('personalF') personalF!: ElementRef;
  @ViewChild('fotosF') fotosF!: ElementRef;
  @Output() loaded = new EventEmitter<void>();
  @Output() sending = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();
  @ViewChild('content', { read: ViewContainerRef }) contentVCR!: ViewContainerRef;
  captchaCR?: ComponentRef<CaptchaComponent>
  especialistaService: EspecialistaService = inject(EspecialistaService);
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
    especialidad: {
      required: 'Especialidad es requerida.',
      pattern: 'Especialidad solo debe contener letras.',
      invalid: 'Especialidad no válida. Seleccione una especialidad de la lista u "Otro" para cargar una especialidad.'
    },
    newEspecialidad: {
      required: "Especialidad es requerida.",
      pattern: 'Especialidad solo debe contener letras.'
    },
    fotoPerfil: {
      required: 'La foto de perfil es obligatoria.',
      format: 'Formato de imagen invalido. Formatos permitidos: .jpeg, .jpg, .png'
    }
  };
  fotoPerfil: any;
  listaEspecialidades: Especialidad[] = []
  especialidadesFiltradas: Especialidad[] = [];
  nuevaEspecialidad: boolean = false;

  get nombre() { return this.accountForm.get('nombre'); }
  get apellido() { return this.accountForm.get('apellido'); }
  get email() { return this.accountForm.get('email'); }
  get contrasena() { return this.accountForm.get('contrasena'); }

  get dni() { return this.personalForm.get('dni'); }
  get edad() { return this.personalForm.get('edad'); }
  get especialidad() { return this.personalForm.get('especialidad'); }
  get newEspecialidad() { return this.personalForm.get('newEspecialidad'); }

  constructor(private formBuilder: FormBuilder, private renderer: Renderer2, private storage: Storage, public fireAuthService: FireAuthService) {
    this.accountForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      apellido: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6), Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$')]]
    });

    this.personalForm = this.formBuilder.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      edad: ['', [Validators.required, Validators.pattern('^[0-9]{2}$'), Validators.min(18)]],
      especialidad: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$')]],
      newEspecialidad: ['', []]
    });

    // Suscribirse a los cambios en el campo especialidad
    this.personalForm.get('especialidad')?.valueChanges.subscribe(value => {
      this.onEspecialidadChange(value);
    });

    this.fotosForm = this.formBuilder.group({
      fotoPerfil: ['', [Validators.required]]
    });

    this.especialidadesFiltradas = this.listaEspecialidades;
  }

  ngAfterViewInit() {
    this.loaded.emit();

    // Mostrar las especialidades en la consola
    this.especialistaService.tipoEspecialista$.subscribe(tipoEspecialista => {
      this.listaEspecialidades = Array.isArray(tipoEspecialista) ? tipoEspecialista : [tipoEspecialista];
    });
  }

  SelectEspecialidad(evento: any, especialidad: string) {
    // Cambia el valor del input en el formulario
    this.especialidad?.setValue(especialidad);

    if (especialidad.toLowerCase() === 'otro') {
      const input = document.querySelector('.newEspecialidad')!;
      input.classList.remove('disable');
    }

    // Oculta la lista de especialidades
    const ul = document.querySelector('.especialidades')!;
    ul.classList.add('disable');
  }
  FiltrarEspecialidades() {
    const valor = this.personalForm.get('especialidad')?.value.toLowerCase();
    const ul = document.querySelector('.especialidades')!;
    ul.classList.remove('disable');

    // Filtra las especialidades que coincidan con el valor ingresado
    this.especialidadesFiltradas = this.listaEspecialidades.filter(especialidad =>
      especialidad.nombre.toLowerCase().includes(valor)
    );
    if (valor === 'otro') {
      const input = document.querySelector('.newEspecialidad')!;
      input.classList.remove('disable');
    }
    else {
      const input = document.querySelector('.newEspecialidad')!;
      input.classList.add('disable');
    }
  }

  onEspecialidadChange(value: string) {
    const newEspecialidadControl = this.personalForm.get('newEspecialidad');
    if (value.toLowerCase() === 'otro') {
      newEspecialidadControl?.setValidators([Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$')]);
    } else {
      newEspecialidadControl?.clearValidators();
    }
    newEspecialidadControl?.updateValueAndValidity();
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
        const especialidadSeleccionada = this.personalForm.get('especialidad')?.value;
        const especialidadValida = this.listaEspecialidades.some(especialidad =>
          especialidad.nombre.toLowerCase() === especialidadSeleccionada.toLowerCase()
        );
        if (!especialidadValida && especialidadSeleccionada.toLowerCase() !== 'otro') {

          this.personalForm.get('especialidad')?.setErrors({ invalid: true });
          return;
        }

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
          let especialista: Especialista = {
            nombre: this.nombre?.value,
            apellido: this.apellido?.value,
            email: this.email?.value,
            dni: this.dni?.value,
            edad: this.edad?.value,
            aprobed: false,
          }
          // Cambia el icono de la barra de progreso
          const icon = document.querySelector('.icons li:nth-child(3)');
          icon!.classList.remove('deschargedIcon');
          icon!.classList.add('chargedIcon');
          try {
            this.CreateCaptcha(especialista);
          }
          catch (e: any) {
            if (e.message === "Email ya en uso") {
              this.accountForm.get('email')?.setErrors({ used: true });
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
        else {
          this.fotosForm.markAllAsTouched();
          console.log('Error: Formulario incompleto');
        }
        break;
    }
  }

  async CreateCaptcha(especialista: Especialista) {
    this.captchaCR = this.contentVCR.createComponent(CaptchaComponent);

    this.captchaCR.instance.success.subscribe(async () => {
      console.log('Captcha correcto');
      this.captchaCR?.destroy();
      await this.CreateEspecialista(especialista);
    });
  }
  async CreateEspecialista(especialista: Especialista) {
    console.log("Creando especialista");

    if (this.especialidad?.value.toLowerCase() === 'otro') {
      // Crea la especialidad en la base de datos
      await this.especialistaService.CreateTipoEspecialista({
        nombre: this.newEspecialidad?.value,
        descripcion: '',
        aprobed: false
      } as Especialidad);
      console.log("Especialidad creada en la base de datos");
      especialista.especialidad = this.newEspecialidad?.value;
    }
    else especialista.especialidad = this.especialidad?.value;
    
    try {
      // Crear el usuario en Firebase Auth
      await this.fireAuthService.Signup(especialista, this.contrasena?.value)
      
      console.log("Usuario creado en Firebase Auth");
      // Una vez creado el usuario en Firebase Auth, se guardan los datos en la base de datos
      this.sending.emit();
    } catch (error: any) {
      if (error.message === "Email ya en uso") {
        this.accountForm.get('email')?.setErrors({ used: true });
        this.PrevStep();
        this.PrevStep();
      }
      if (this.fireAuthService.user) {
        await this.fireAuthService.DeleteUser();
      }
      console.log(error.message)
      return;
    }

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
    
    // Crear el documento en la base de datos
    const res = await this.especialistaService.Create(this.fireAuthService.user! as Especialista);
    console.log("Especialista creado en la base de datos");

    // Emitir evento de éxito
    this.success.emit();
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
