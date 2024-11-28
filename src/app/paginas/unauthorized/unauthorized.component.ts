import { Component } from '@angular/core';
import { MenuComponent } from '../../componentes/menu/menu.component';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css'
})
export class UnauthorizedComponent {

}
