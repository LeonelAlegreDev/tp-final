import { Component, inject } from '@angular/core';
import { MenuComponent } from '../../componentes/menu/menu.component';
import { FireAuthService } from '../../servicios/fire-auth.service';
import { CapitalizePipe } from "../../pipes/capitalize.pipe";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MenuComponent, CapitalizePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  fireAuthService = inject(FireAuthService);
}
