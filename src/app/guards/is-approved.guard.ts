import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FireAuthService } from '../servicios/fire-auth.service';

export const isApprovedGuard: CanActivateFn = (route, state) => {
  const fireAuthService = inject(FireAuthService);
  const router = inject(Router);

  if(fireAuthService.IsApproved()){
    return true;
  }
  console.log("Cuenta no aprobada");
  console.log("Redirigiendo a /unapproved-account");
  router.navigate(["/unapproved-account"]);
  return false;
};
