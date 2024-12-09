import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isAdminOrPacienteGuard } from './is-admin-or-paciente.guard';

describe('isAdminOrPacienteGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isAdminOrPacienteGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
