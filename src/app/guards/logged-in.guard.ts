import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { FireAuthService } from '../servicios/fire-auth.service';

export const loggedInGuard: CanActivateFn = (route, state) => {
  const fireAuthService = inject(FireAuthService);
  const router = inject(Router);
  
  if(fireAuthService.user === undefined){ 
    console.log("Acceso denegado, usuario no logueado");
    console.log("Redirigiendo a /bienvenida");
    router.navigate(["/bienvenida"]);
    return false;
  }
  return true;
};
