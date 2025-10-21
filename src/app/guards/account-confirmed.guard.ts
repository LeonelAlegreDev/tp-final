import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FireAuthService } from '../servicios/fire-auth.service';

export const accountConfirmedGuard: CanActivateFn = (route, state) => {
  const fireAuthService = inject(FireAuthService);
  const router = inject(Router);

  if(fireAuthService.user?.email === 'especialista1@email.com' || 
      fireAuthService.user?.email === 'paciente1@email.com' ||
      fireAuthService.user?.email === 'admin1@email.com')
  {
    console.log("Usuario de prueba, acceso permitido");
    return true;
  }

  if(fireAuthService.IsVerified()){
    return true;
  }
  console.log("Acceso denegado, cuenta no verificada");
  console.log("Redirigiendo a /verify-email");
  router.navigate(["/verify-email"]);
  return false;
};
