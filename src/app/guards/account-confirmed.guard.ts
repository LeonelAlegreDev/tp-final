import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FireAuthService } from '../servicios/fire-auth.service';

export const accountConfirmedGuard: CanActivateFn = (route, state) => {
  const fireAuthService = inject(FireAuthService);
  const router = inject(Router);

  if(fireAuthService.IsVerified()){
    console.log("Cuenta verificada, acceso permitido");
    return true;
  }
  console.log("Acceso denegado, cuenta no verificada");
  console.log("Redirigiendo a /verify-email");
  router.navigate(["/verify-email"]);
  return false;
};
