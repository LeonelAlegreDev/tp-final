import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FireAuthService } from '../servicios/fire-auth.service';

export const isPacienteOrEspecialistaGuard: CanActivateFn = (route, state) => {
  const fireAuthService = inject(FireAuthService);
  const router = inject(Router);
  
  if(fireAuthService.IsEspecialista() || fireAuthService.IsPaciente()){
    return true;
  }
  
  console.log("Acceso restringido");
  console.log("Redirigiendo a /unauthorized");
  router.navigate(["/unauthorized"]);
  return false;};
