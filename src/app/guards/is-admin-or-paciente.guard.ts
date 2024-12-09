import { CanActivateFn, Router } from '@angular/router';
import { FireAuthService } from '../servicios/fire-auth.service';
import { inject } from '@angular/core';

export const isAdminOrPacienteGuard: CanActivateFn = (route, state) => {
  const fireAuthService = inject(FireAuthService);
  const router = inject(Router);
  
  if(fireAuthService.IsAdmin() || fireAuthService.IsPaciente()){
    return true;
  }
  
  console.log("Acceso restringido");
  console.log("Redirigiendo a /unauthorized");
  router.navigate(["/unauthorized"]);
  return false;
};
