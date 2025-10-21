import { Component } from '@angular/core';
import { LoaderComponent } from "../../componentes/loader/loader.component";
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [LoaderComponent, RouterLink, RouterLinkActive],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {
  isComponentReady = false;

  constructor() {
    this.isComponentReady = true;
  }
}
