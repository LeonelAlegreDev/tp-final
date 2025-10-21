import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FireAuthService } from '../../servicios/fire-auth.service';
import { MenuComponent } from '../../componentes/menu/menu.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  fireAuthService = inject(FireAuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (!this.fireAuthService.user) {
      this.router.navigate(['/bienvenida']);
    }
  }
}
