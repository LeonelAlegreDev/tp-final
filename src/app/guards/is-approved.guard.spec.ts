import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { isApprovedGuard } from './is-approved.guard';

describe('isApprovedGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => isApprovedGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
