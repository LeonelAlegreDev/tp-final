import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { accountConfirmedGuard } from './account-confirmed.guard';

describe('accountConfirmedGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => accountConfirmedGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
