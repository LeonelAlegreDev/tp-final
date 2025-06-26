import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { FireAuthService } from '../servicios/fire-auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedInGuard implements CanActivate {
  constructor(private authService: FireAuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    if (this.authService.IsLoggedIn) {
      return true;
    } else {
      this.router.navigate(['/bienvenida']); // Redirect to welcome page
      return false;
    }
  }
}
