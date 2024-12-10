import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isPacienteOrEspecialistaGuard } from './is-paciente-or-especialista.guard';

describe('isPacienteOrEspecialistaGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isPacienteOrEspecialistaGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
