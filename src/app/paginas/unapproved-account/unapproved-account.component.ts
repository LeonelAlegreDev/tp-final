import { Component, inject } from '@angular/core';
import { MenuComponent } from '../../componentes/menu/menu.component';
import { FireAuthService } from '../../servicios/fire-auth.service';

@Component({
  selector: 'app-unapproved-account',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './unapproved-account.component.html',
  styleUrl: './unapproved-account.component.css'
})
export class UnapprovedAccountComponent {
  fireAuthService = inject(FireAuthService)
}
