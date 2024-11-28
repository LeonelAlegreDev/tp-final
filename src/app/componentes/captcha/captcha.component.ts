import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { min } from 'rxjs';

@Component({
  selector: 'app-captcha',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './captcha.component.html',
  styleUrl: './captcha.component.css'
})
export class CaptchaComponent {
  @ViewChild('canvas') canvas?: ElementRef;
  @Output() success = new EventEmitter<void>();

  ctx?: CanvasRenderingContext2D;
  captchaFG: FormGroup;
  captcha: string[] = [];
  code: any;
  charsArray ="0123456789abcdefghijklmnopqrstuvwxyz@!#$%&*";
  lengthOtp = 6;
  fontSize = 50;
  msjError = "";

  get CaptchaFG() { return this.captchaFG.get('response'); }
  
  constructor() { 
    this.captchaFG = new FormGroup({
      response: new FormControl('', Validators.required)
    });

  }

  ngAfterViewInit(){
    this.ctx = this.canvas!.nativeElement.getContext('2d');
    this.ctx!.font = `${this.fontSize}px MonoSpace`;

    this.CreateCaptcha();
  }


  Validate(){
    console.log(this.code)
    if(this.captchaFG.value.response == this.code){
      console.log("Captcha correcto");
      this.success.emit();
    }
    else{
      console.log("Captcha incorrecto");
      this.msjError = "Captcha incorrecto";
    }
  }

  CreateCaptcha(){
    this.captcha = [];
    this.code = [];

    for (var i = 0; i < this.lengthOtp; i++) {
      //below code will not allow Repetition of Characters
      var index = Math.floor(Math.random() * this.charsArray.length + 1); //get the next character from the array
      if (this.captcha.indexOf(this.charsArray[index]) == -1)
        this.captcha.push(this.charsArray[index]);
      else i--;
    }
    this.code = this.captcha.join("");

    const canvasWidth = this.canvas!.nativeElement.width;
    const canvasHeight = this.canvas!.nativeElement.height;

    this.ctx!.clearRect(0, 0, canvasWidth, canvasHeight);
    
    const text = this.captcha.join("");
    const rangeHeight = 50;
    const letterSpacing = 5; 
    let totalTextWidth = 0;
    const minCharWidth = 12;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const charWidth = this.ctx!.measureText(char).width;
      totalTextWidth += charWidth + letterSpacing;
    }
    totalTextWidth -= letterSpacing; // Restar el espaciado extra después del último carácter
    
    // Calcular la posición inicial para centrar el texto
    const startX = (canvasWidth - totalTextWidth) / 2;
    const colors = ['#FF0000', '#0000FF', '#008000', '#FFA500', '#800080']; // Array de colores
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const charWidth = this.ctx!.measureText(char).width;
      const x = startX + (charWidth + Math.random() * letterSpacing) * i + minCharWidth;
      const y = canvasHeight / 2 + this.fontSize / 4 + (Math.random() * rangeHeight - rangeHeight / 2);
      
      let colorStroke = colors[Math.floor(Math.random() * colors.length)];
      
      this.ctx!.strokeStyle = colorStroke;      
      this.ctx!.strokeText(char, x, y);
    }
  }
}
